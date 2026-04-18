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
3. Command injection (unsanitized input in exec/spawn)
4. Path traversal (unsanitized file paths)
5. XSS vulnerabilities (innerHTML with user input)
6. Insecure cryptography (MD5, SHA1, weak algorithms)
7. Insecure random (Math.random for security)
8. Dangerous eval() usage
9. Insecure HTTP usage for sensitive data
10. Unsafe deserialization patterns

FILE INFORMATION:
- Filename: ${safeFilename}
- Language: ${language}
- Lines: ${code.split('\n').length}

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

ANALYSIS REQUIREMENTS:
- Detect ALL vulnerabilities in the code
- Return an array of ALL findings
- Extract actual secret values when found
- Identify exact line numbers for each issue
- Provide clear explanations
- Assign accurate severity levels

Return ONLY valid JSON in this exact format:
{
  "vulnerabilities": [
    {
      "risk_type": "hardcoded_secret|sql_injection|command_injection|path_traversal|xss|weak_crypto|insecure_random|eval_usage|insecure_http|unsafe_deserialization",
      "severity": "low|medium|high|critical",
      "explanation": "Clear explanation of the vulnerability",
      "affected_lines": [array of line numbers],
      "extracted_value": "the actual secret value if applicable, otherwise null"
    }
  ]
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
      
      // Handle new array format
      if (parsed.vulnerabilities && Array.isArray(parsed.vulnerabilities)) {
        if (parsed.vulnerabilities.length === 0) {
          return { 
            risk_detected: false, 
            risk_type: 'none', 
            remediation_required: false 
          };
        }
        // Return first vulnerability for now (backward compatibility)
        const first = parsed.vulnerabilities[0];
        return {
          risk_detected: true,
          risk_type: first.risk_type,
          severity: first.severity,
          explanation: first.explanation,
          affected_lines: first.affected_lines,
          remediation_required: true,
          extracted_value: first.extracted_value,
          all_vulnerabilities: parsed.vulnerabilities
        };
      }
      
      // Handle old single format (backward compatibility)
      if (typeof parsed.risk_detected !== 'boolean') {
        throw new Error('Invalid analysis response format');
      }

      return parsed;

    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return { 
        risk_detected: false, 
        risk_type: 'none', 
        remediation_required: false 
      };
    }
  }
}

module.exports = BedrockClient;
