/**
 * AI Client Wrapper
 * Handles Groq API interactions for security analysis
 */

const Groq = require('groq-sdk');

class BedrockClient {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.maxTokens = parseInt(process.env.GROQ_MAX_TOKENS) || 2000;
  }

  async analyzeCode({ code, language, filename }) {
    const prompt = this.buildAnalysisPrompt(code, language, filename);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: this.maxTokens,
        top_p: 0.9
      });

      const analysisText = response.choices[0].message.content;
      return this.parseAnalysisResponse(analysisText);

    } catch (error) {
      console.error('Groq analysis error:', error);
      throw new Error(`Security analysis failed: ${error.message}`);
    }
  }

  sanitizeFilename(filename) {
    // Strip everything except safe path characters to prevent prompt injection
    return filename.replace(/[^a-zA-Z0-9._\-/]/g, '_').slice(0, 100);
  }

  buildAnalysisPrompt(code, language, filename) {
    const safeFilename = this.sanitizeFilename(filename);
    return `You are a security analysis engine for GuardRail AI, a production SaaS platform.

CRITICAL SECURITY RULES TO DETECT:
1. Hardcoded secrets (API keys, passwords, tokens, private keys, JWT secrets, OAuth credentials)
2. SQL injection vulnerabilities (unsanitized user input in queries)
3. Insecure HTTP usage for sensitive data
4. Unsafe deserialization patterns
5. Overly permissive access configurations

FILE INFORMATION:
- Filename: ${safeFilename}
- Language: ${language}
- Lines: ${code.split('\n').length}

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

ANALYSIS REQUIREMENTS:
- Be thorough but precise
- Extract actual secret values when found
- Identify exact line numbers
- Provide clear explanations
- Assign accurate severity levels

Return ONLY valid JSON in this exact format:
{
  "risk_detected": boolean,
  "risk_type": "hardcoded_secret|sql_injection|insecure_http|unsafe_deserialization|permissive_config|none",
  "severity": "low|medium|high|critical",
  "explanation": "Clear explanation of the vulnerability",
  "affected_lines": [array of line numbers],
  "remediation_required": boolean,
  "extracted_value": "the actual secret value if applicable, otherwise null"
}`;
  }

  parseAnalysisResponse(text) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { 
        risk_detected: false, 
        risk_type: 'none', 
        remediation_required: false 
      };
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (typeof parsed.risk_detected !== 'boolean') {
        throw new Error('Invalid analysis response format');
      }

      return parsed;

    } catch (error) {
      console.error('Failed to parse Bedrock response:', error);
      return { 
        risk_detected: false, 
        risk_type: 'none', 
        remediation_required: false 
      };
    }
  }
}

module.exports = BedrockClient;
