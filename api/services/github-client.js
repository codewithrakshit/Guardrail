/**
 * GitHub Client
 * Fetches PR diffs, posts commit statuses and inline review comments
 */

const https = require('https');

class GitHubClient {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.baseUrl = 'api.github.com';
  }

  _request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl,
        path,
        method,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'GuardRail-AI/1.0',
          ...(body ? { 'Content-Type': 'application/json' } : {})
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(data ? JSON.parse(data) : {});
          } catch {
            resolve({});
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async getPRFiles(owner, repo, prNumber) {
    const data = await this._request('GET', `/repos/${owner}/${repo}/pulls/${prNumber}/files`);
    return Array.isArray(data) ? data : [];
  }

  async getFileContent(owner, repo, filepath, ref) {
    try {
      const data = await this._request('GET', `/repos/${owner}/${repo}/contents/${filepath}?ref=${ref}`);
      if (!data.content) return null;
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch {
      return null;
    }
  }

  async setCommitStatus(owner, repo, sha, { state, description, context }) {
    return this._request('POST', `/repos/${owner}/${repo}/statuses/${sha}`, {
      state,
      description: description.slice(0, 140),
      context
    });
  }

  async postPRComment(owner, repo, prNumber, commitId, { path, line, body }) {
    return this._request('POST', `/repos/${owner}/${repo}/pulls/${prNumber}/comments`, {
      body,
      commit_id: commitId,
      path,
      line,
      side: 'RIGHT'
    });
  }
}

module.exports = GitHubClient;
