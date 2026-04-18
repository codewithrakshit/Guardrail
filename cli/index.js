#!/usr/bin/env node
/**
 * GuardRail AI CLI
 * Usage: npx guardrail scan [path] [--fix] [--api-url <url>]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;

const LANG_MAP = {
  '.js': 'javascript', '.ts': 'typescript', '.py': 'python',
  '.java': 'java', '.go': 'go', '.rb': 'ruby', '.php': 'php'
};

function collectFiles(target) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    const ext = path.extname(target);
    return LANG_MAP[ext] ? [target] : [];
  }
  const results = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) results.push(...collectFiles(full));
    else if (LANG_MAP[path.extname(entry.name)]) results.push(full);
  }
  return results;
}

function post(apiUrl, endpoint, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, apiUrl);
    const data = JSON.stringify(body);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function scanFile(apiUrl, filepath) {
  const code = fs.readFileSync(filepath, 'utf-8');
  const ext = path.extname(filepath);
  const language = LANG_MAP[ext];
  const filename = path.basename(filepath);
  return post(apiUrl, '/api/scan', { code, language, filename });
}

async function applyFix(apiUrl, filepath, sessionId) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api/result/${sessionId}`, apiUrl);
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request({ hostname: url.hostname, port: url.port, path: url.pathname, method: 'GET' }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          if (data.patchedCode) {
            fs.writeFileSync(filepath, data.patchedCode, 'utf-8');
            resolve(true);
          } else {
            resolve(false);
          }
        } catch { resolve(false); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (cmd !== 'scan' || args.length < 2) {
    console.log(`${c('bold', 'GuardRail AI CLI')}\n`);
    console.log(`Usage: guardrail scan <path> [--fix] [--api-url <url>]\n`);
    console.log(`  ${c('cyan', 'scan <path>')}   Scan a file or directory`);
    console.log(`  ${c('cyan', '--fix')}          Auto-apply patches for found issues`);
    console.log(`  ${c('cyan', '--api-url')}      GuardRail API URL (default: http://localhost:3001)\n`);
    process.exit(0);
  }

  const target = args[1];
  const fix = args.includes('--fix');
  const apiUrlIdx = args.indexOf('--api-url');
  const apiUrl = apiUrlIdx !== -1 ? args[apiUrlIdx + 1] : (process.env.GUARDRAIL_API_URL || 'http://localhost:3001');

  if (!fs.existsSync(target)) {
    console.error(c('red', `Error: path not found — ${target}`));
    process.exit(1);
  }

  const files = collectFiles(target);
  if (files.length === 0) {
    console.log(c('dim', 'No supported files found.'));
    process.exit(0);
  }

  console.log(`\n${c('bold', '🛡  GuardRail AI')} — scanning ${files.length} file(s)...\n`);

  let critical = 0, high = 0, medium = 0, low = 0, clean = 0;

  for (const filepath of files) {
    const rel = path.relative(process.cwd(), filepath);
    process.stdout.write(`  ${c('dim', rel)} ... `);

    try {
      const result = await scanFile(apiUrl, filepath);

      if (result.status === 'vulnerable') {
        const vuln = result.vulnerabilities?.[0];
        const sev = vuln?.severity || result.severity || 'unknown';
        const type = vuln?.type?.replace(/_/g, ' ') || 'vulnerability';
        const line = vuln?.affectedLines?.[0] || '?';
        const cwe = vuln?.cwe || '';

        const sevColor = sev === 'critical' ? 'red' : sev === 'high' ? 'yellow' : 'cyan';
        console.log(`${c(sevColor, sev.toUpperCase())}: ${type} (${cwe}) — line ${line}`);

        if (sev === 'critical') critical++;
        else if (sev === 'high') high++;
        else if (sev === 'medium') medium++;
        else low++;

        if (fix && result.sessionId) {
          process.stdout.write(`    ${c('dim', '↳ applying fix...')} `);
          const applied = await applyFix(apiUrl, filepath, result.sessionId);
          console.log(applied ? c('green', '✓ fixed') : c('yellow', 'no patch available'));
        }
      } else {
        console.log(c('green', 'clean'));
        clean++;
      }
    } catch (err) {
      console.log(c('red', `error: ${err.message}`));
    }
  }

  const total = critical + high + medium + low;
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ${c('bold', 'Results:')} ${files.length} file(s) scanned`);
  if (total === 0) {
    console.log(`  ${c('green', '✅ No issues found.')}`);
  } else {
    if (critical) console.log(`  ${c('red',    `🚨 ${critical} critical`)}`);
    if (high)     console.log(`  ${c('yellow', `⚠️  ${high} high`)}`);
    if (medium)   console.log(`  ${c('cyan',   `ℹ️  ${medium} medium`)}`);
    if (low)      console.log(`  ${c('dim',    `   ${low} low`)}`);
    if (!fix)     console.log(`\n  Run with ${c('cyan', '--fix')} to auto-apply patches.`);
  }
  console.log();

  process.exit(critical > 0 || high > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(c('red', `Fatal: ${err.message}`));
  process.exit(1);
});
