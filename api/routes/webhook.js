/**
 * GitHub Webhook Route
 * Receives PR events, scans changed code, posts status + inline comment
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const SecurityOrchestrator = require('../services/security-orchestrator');
const SessionManager = require('../services/session-manager');
const GitHubClient = require('../services/github-client');
const Notifier = require('../services/notifier');
const { v4: uuidv4 } = require('uuid');

function verifySignature(req) {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return false;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(req.rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/**
 * POST /api/webhook/github
 */
router.post('/github', express.raw({ type: 'application/json' }), async (req, res) => {
  // Attach rawBody for signature verification
  req.rawBody = req.body;
  const body = JSON.parse(req.body.toString());

  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'];

  // Only handle pull_request opened/synchronize events
  if (event !== 'pull_request' || !['opened', 'synchronize'].includes(body.action)) {
    return res.status(200).json({ skipped: true });
  }

  res.status(202).json({ received: true });

  // Process async — don't block the webhook response
  setImmediate(() => processPR(body).catch(err =>
    console.error('[webhook] PR processing error:', err.message)
  ));
});

async function processPR(payload) {
  const github = new GitHubClient();
  const notifier = new Notifier();

  const { pull_request: pr, repository: repo } = payload;
  const owner = repo.owner.login;
  const repoName = repo.name;
  const prNumber = pr.number;
  const sha = pr.head.sha;
  const authorEmail = pr.user?.email || null;

  console.log(`[webhook] Processing PR #${prNumber} in ${owner}/${repoName} @ ${sha}`);

  // Set pending status immediately
  await github.setCommitStatus(owner, repoName, sha, {
    state: 'pending',
    description: 'GuardRail AI is scanning...',
    context: 'guardrail-ai/scan'
  });

  try {
    const files = await github.getPRFiles(owner, repoName, prNumber);
    const supported = ['js', 'ts', 'py', 'java', 'go', 'rb', 'php'];
    const scannable = files.filter(f =>
      f.status !== 'removed' &&
      supported.some(ext => f.filename.endsWith(`.${ext}`))
    );

    if (scannable.length === 0) {
      await github.setCommitStatus(owner, repoName, sha, {
        state: 'success',
        description: 'No scannable files changed.',
        context: 'guardrail-ai/scan'
      });
      return;
    }

    const orchestrator = new SecurityOrchestrator();
    const sessionManager = new SessionManager();
    let criticalCount = 0;
    let highCount = 0;
    const findings = [];

    for (const file of scannable) {
      const content = await github.getFileContent(owner, repoName, file.filename, sha);
      if (!content) continue;

      const sessionId = uuidv4();
      const ext = file.filename.split('.').pop();
      const langMap = { js: 'javascript', ts: 'typescript', py: 'python', java: 'java', go: 'go', rb: 'ruby', php: 'php' };
      const language = langMap[ext] || 'javascript';

      await sessionManager.createSession({
        sessionId,
        language,
        filename: file.filename,
        clientIp: 'github-webhook',
        codeLength: content.length
      });

      const result = await orchestrator.processCode({
        sessionId,
        code: content,
        language,
        filename: file.filename
      });

      if (result.status === 'vulnerable') {
        const vuln = result.vulnerabilities[0];
        findings.push({ file: file.filename, vuln, sessionId });

        if (vuln.severity === 'critical') criticalCount++;
        else if (vuln.severity === 'high') highCount++;

        // Post inline PR comment on the first affected line
        const line = vuln.affectedLines?.[0] || 1;
        await github.postPRComment(owner, repoName, prNumber, sha, {
          path: file.filename,
          line,
          body: [
            `## 🚨 GuardRail AI — ${vuln.severity.toUpperCase()} (${vuln.cwe || 'CWE-Unknown'})`,
            '',
            `**${vuln.type?.replace(/_/g, ' ')}** detected in \`${file.filename}\` at line ${line}.`,
            '',
            `> ${vuln.explanation}`,
            '',
            `**Confidence:** ${Math.round((vuln.confidence || 0.9) * 100)}%`,
            `**Session:** \`${sessionId}\``,
            '',
            `[View full patch →](${process.env.FRONTEND_URL || 'http://localhost:3000'}/results/${sessionId})`
          ].join('\n')
        });
      }
    }

    const blocked = criticalCount > 0 || highCount > 0;
    const totalIssues = criticalCount + highCount;

    await github.setCommitStatus(owner, repoName, sha, {
      state: blocked ? 'failure' : 'success',
      description: blocked
        ? `GuardRail AI blocked: ${criticalCount} critical, ${highCount} high issue(s) found`
        : `GuardRail AI: ${scannable.length} file(s) scanned — clean`,
      context: 'guardrail-ai/scan'
    });

    // Notify if critical or high
    if (blocked && findings.length > 0) {
      await notifier.send({
        severity: criticalCount > 0 ? 'critical' : 'high',
        prUrl: pr.html_url,
        prTitle: pr.title,
        author: pr.user.login,
        authorEmail,
        findings,
        repoFullName: repo.full_name
      });
    }

  } catch (error) {
    console.error('[webhook] Scan pipeline error:', error.message);
    await github.setCommitStatus(owner, repoName, sha, {
      state: 'error',
      description: 'GuardRail AI encountered an error during scan',
      context: 'guardrail-ai/scan'
    });
  }
}

module.exports = router;
