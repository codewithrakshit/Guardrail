/**
 * Notifier Service
 * Sends email (AWS SES) and Slack alerts based on severity matrix:
 *   Critical → Email + Slack + Block PR
 *   High     → Email + Block PR
 *   Medium/Low → no notification (dashboard only)
 */

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const https = require('https');

class Notifier {
  constructor() {
    this.ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
    this.fromEmail = process.env.SES_FROM_EMAIL;
    this.toEmail = process.env.ALERT_EMAIL;
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  async send({ severity, prUrl, prTitle, author, authorEmail, findings, repoFullName }) {
    const isCritical = severity === 'critical';
    const isHigh = severity === 'high';

    const promises = [];

    if ((isCritical || isHigh) && this.fromEmail && this.toEmail) {
      promises.push(this._sendEmail({ severity, prUrl, prTitle, author, authorEmail, findings, repoFullName }));
    }

    if (isCritical && this.slackWebhookUrl) {
      promises.push(this._sendSlack({ severity, prUrl, prTitle, author, findings, repoFullName }));
    }

    await Promise.allSettled(promises);
  }

  async _sendEmail({ severity, prUrl, prTitle, author, authorEmail, findings, repoFullName }) {
    const findingLines = findings.map(f =>
      `• ${f.file} — ${f.vuln.severity.toUpperCase()}: ${f.vuln.type?.replace(/_/g, ' ')} (${f.vuln.cwe || 'CWE-Unknown'})`
    ).join('\n');

    const subject = `[GuardRail AI] ${severity.toUpperCase()} vulnerability in PR: ${prTitle}`;
    const body = [
      `GuardRail AI detected a ${severity.toUpperCase()} severity vulnerability in a pull request.`,
      '',
      `Repository: ${repoFullName}`,
      `PR: ${prTitle}`,
      `Author: ${author}`,
      `PR URL: ${prUrl}`,
      '',
      'Findings:',
      findingLines,
      '',
      'The PR has been blocked. The author must resolve these issues before merging.',
      '',
      '— GuardRail AI Security Platform'
    ].join('\n');

    const toAddresses = [this.toEmail];
    if (authorEmail) toAddresses.push(authorEmail);

    try {
      await this.ses.send(new SendEmailCommand({
        Source: this.fromEmail,
        Destination: { ToAddresses: toAddresses },
        Message: {
          Subject: { Data: subject },
          Body: { Text: { Data: body } }
        }
      }));
      console.log(`[notifier] Email sent for ${severity} finding in ${repoFullName}`);
    } catch (error) {
      console.error('[notifier] Email failed:', error.message);
    }
  }

  _sendSlack({ severity, prUrl, prTitle, author, findings, repoFullName }) {
    const emoji = severity === 'critical' ? '🚨' : '⚠️';
    const findingText = findings.map(f =>
      `• \`${f.file}\` — *${f.vuln.severity.toUpperCase()}*: ${f.vuln.type?.replace(/_/g, ' ')} (${f.vuln.cwe || 'CWE-Unknown'})`
    ).join('\n');

    const payload = {
      text: `${emoji} *GuardRail AI — ${severity.toUpperCase()} Alert*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${emoji} *GuardRail AI blocked a PR in \`${repoFullName}\`*\n*PR:* <${prUrl}|${prTitle}>\n*Author:* ${author}`
          }
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: `*Findings:*\n${findingText}` }
        },
        {
          type: 'actions',
          elements: [{
            type: 'button',
            text: { type: 'plain_text', text: 'View PR' },
            url: prUrl,
            style: 'danger'
          }]
        }
      ]
    };

    return new Promise((resolve) => {
      const url = new URL(this.slackWebhookUrl);
      const body = JSON.stringify(payload);
      const req = https.request({
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      }, (res) => {
        res.resume();
        console.log(`[notifier] Slack response: ${res.statusCode}`);
        resolve();
      });
      req.on('error', (e) => {
        console.error('[notifier] Slack failed:', e.message);
        resolve();
      });
      req.write(body);
      req.end();
    });
  }
}

module.exports = Notifier;
