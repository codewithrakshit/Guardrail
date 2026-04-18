/**
 * GitHub Webhook Route
 * Receives PR events, validates signature, triggers security scans
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const githubClient = require('../services/github-client');
const SecurityOrchestrator = require('../services/security-orchestrator');
const SessionManager = require('../services/session-manager');
const { sanitizeCode } = require('../middleware/validation');

// Validate X-Hub-Signature-256 against raw request body
function validateSignature(rawBody, signature) {
  if (!signature) return false;
  const expected = `sha256=${crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

// Scan all changed files in a PR and write results back to GitHub
async function processPR(repoFullName, prNumber, commitSha) {
  const orchestrator = new SecurityOrchestrator();
  const sessionManager = new SessionManager();
  const allFindings = [];

  try {
    // Signal to GitHub that scan is in progress
    await githubClient.postStatus(repoFullName, commitSha, 'pending', 'GuardRail AI is scanning...');

    const files = await githubClient.fetchPRFiles(repoFullName, prNumber);

    if (!files.length) {
      await githubClient.postStatus(repoFullName, commitSha, 'success', 'No scannable files changed');
      return;
    }

    // Scan each file through the existing pipeline
    for (const file of files) {
      const sessionId = uuidv4();

      try {
        const code = await githubClient.fetchFileContent(file.rawUrl);
        const sanitized = sanitizeCode(typeof code === 'string' ? code : JSON.stringify(code));

        await sessionManager.createSession({
          sessionId,
          language: file.language,
          filename: file.filename,
          clientIp: 'github-webhook',
          codeLength: sanitized.length
        });

        const result = await orchestrator.processCode({
          sessionId,
          code: sanitized,
          language: file.language,
          filename: file.filename
        });

        if (result.status === 'vulnerable') {
          result.vulnerabilities.forEach(v => {
            allFindings.push({
              filename: file.filename,
              severity: v.severity,
              type: v.type,
              explanation: v.explanation,
              affectedLines: v.affectedLines,
              cwe: v.cwe
            });
          });
        }
      } catch (err) {
        console.error(`[webhook] Failed to scan ${file.filename}:`, err.message);
      }
    }

    // Write results back to GitHub
    const hasCriticalOrHigh = allFindings.some(
      f => f.severity === 'critical' || f.severity === 'high'
    );

    if (allFindings.length) {
      await githubClient.postReview(repoFullName, prNumber, allFindings);
      await githubClient.postStatus(
        repoFullName,
        commitSha,
        hasCriticalOrHigh ? 'failure' : 'success',
        `GuardRail AI: ${allFindings.length} issue(s) found`
      );
    } else {
      await githubClient.postStatus(repoFullName, commitSha, 'success', 'GuardRail AI: No issues found ✅');
    }

  } catch (err) {
    console.error('[webhook] PR processing error:', err.message);
    await githubClient.postStatus(repoFullName, commitSha, 'error', 'GuardRail AI scan failed').catch(() => {});
  }
}

/**
 * POST /api/webhook/github
 */
router.post('/github', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];

  // req.body is a raw Buffer here (see server.js registration)
  if (!validateSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Respond immediately — GitHub expects 200 fast
  res.status(200).json({ received: true });

  // Only process pull_request events
  if (event !== 'pull_request') return;

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch {
    return;
  }

  const { action, pull_request, repository } = payload;
  if (!['opened', 'synchronize', 'reopened'].includes(action)) return;

  const repoFullName = repository.full_name;
  const prNumber = pull_request.number;
  const commitSha = pull_request.head.sha;

  console.log(`[webhook] PR #${prNumber} ${action} on ${repoFullName} — scanning...`);

  // Fire and forget — processing happens after response is sent
  processPR(repoFullName, prNumber, commitSha)
    .catch(err => console.error('[webhook] Unhandled error:', err.message));
});

module.exports = router;
