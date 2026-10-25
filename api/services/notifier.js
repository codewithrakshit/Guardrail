/**
 * Notifier Service
 * Local notification hook based on severity matrix. External delivery is
 * intentionally disabled in local-only mode.
 *   Critical → Email + Slack + Block PR
 *   High     → Email + Block PR
 *   Medium/Low → no notification (dashboard only)
 */

class Notifier {
  constructor() {
    this.enabled = process.env.LOCAL_NOTIFICATIONS === 'true';
  }

  async send({ severity, prUrl, prTitle, author, authorEmail, findings, repoFullName }) {
    const isCritical = severity === 'critical';
    const isHigh = severity === 'high';

    if (this.enabled && (isCritical || isHigh)) {
      console.log(`[notifier] Local notification: ${severity} finding in ${repoFullName}`);
    }
  }
}

module.exports = Notifier;
