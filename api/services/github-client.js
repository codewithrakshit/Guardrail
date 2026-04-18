/**
 * GitHub Client
 * Fetches PR diffs, posts status checks and review comments
 */

const axios = require('axios');

class GitHubClient {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
  }

  // Map file extensions to language strings the scan API expects
  detectLanguage(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
      js: 'javascript', mjs: 'javascript', cjs: 'javascript',
      ts: 'typescript', tsx: 'typescript',
      py: 'python',
      java: 'java',
      go: 'go',
      rb: 'ruby',
      php: 'php'
    };
    return map[ext] || null;
  }

  // Fetch list of changed files in a PR, filtered to supported languages only
  async fetchPRFiles(repoFullName, prNumber) {
    const { data } = await this.client.get(
      `/repos/${repoFullName}/pulls/${prNumber}/files`
    );

    return data
      .filter(f => f.status !== 'removed' && this.detectLanguage(f.filename))
      .map(f => ({
        filename: f.filename,
        language: this.detectLanguage(f.filename),
        rawUrl: f.raw_url
      }));
  }

  // Fetch raw file content from GitHub
  async fetchFileContent(rawUrl) {
    const { data } = await axios.get(rawUrl, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    return data;
  }

  // Post a commit status check (the ✅ / ❌ on the PR)
  async postStatus(repoFullName, commitSha, state, description, targetUrl = null) {
    const payload = {
      state,                              // pending | success | failure | error
      description: description.slice(0, 140), // GitHub limit
      context: 'GuardRail AI / security-scan'
    };
    if (targetUrl) payload.target_url = targetUrl;

    await this.client.post(
      `/repos/${repoFullName}/statuses/${commitSha}`,
      payload
    );
  }

  // Post a PR review with file-level comments for each vulnerability found
  async postReview(repoFullName, prNumber, findings) {
    const hasCriticalOrHigh = findings.some(
      f => f.severity === 'critical' || f.severity === 'high'
    );

    const comments = findings.map(f => ({
      path: f.filename,
      position: 1, // file-level comment — avoids diff position complexity
      body: this.formatComment(f)
    }));

    const summary = this.formatReviewSummary(findings);

    await this.client.post(
      `/repos/${repoFullName}/pulls/${prNumber}/reviews`,
      {
        event: hasCriticalOrHigh ? 'REQUEST_CHANGES' : 'COMMENT',
        body: summary,
        comments
      }
    );
  }

  formatComment({ severity, type, explanation, affectedLines, cwe }) {
    const emoji = { critical: '🚨', high: '🔴', medium: '🟡', low: '🔵' }[severity] || '⚠️';
    const lines = affectedLines && affectedLines.length
      ? `**Line(s):** ${affectedLines.join(', ')}\n`
      : '';
    return `${emoji} **${severity.toUpperCase()}: ${type.replace(/_/g, ' ')}** (${cwe})\n\n${lines}${explanation}\n\n> *Detected by [GuardRail AI](https://github.com/guardrail-ai)*`;
  }

  formatReviewSummary(findings) {
    if (!findings.length) return '✅ GuardRail AI found no security issues.';

    const counts = findings.reduce((acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {});

    const breakdown = Object.entries(counts)
      .map(([sev, n]) => `${n} ${sev}`)
      .join(', ');

    return `## 🛡️ GuardRail AI Security Scan\n\n**Found ${findings.length} issue(s):** ${breakdown}\n\nReview the comments below for details and patches.`;
  }
}

module.exports = new GitHubClient();
