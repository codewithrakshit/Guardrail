/**
 * Patch Generator
 * Creates secure code replacements using Groq API
 */

const Groq = require('groq-sdk');

class PatchGenerator {
  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
    this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  async generatePatch({ originalCode, analysis, strategy, secretRef, language }) {
    const prompt = this.buildPatchPrompt(originalCode, analysis, strategy, secretRef, language);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 3000,
        top_p: 0.9
      });

      const secureCode = response.choices[0].message.content;
      const cleanCode = this.extractCode(secureCode);

      return {
        originalCode,
        secureCode: cleanCode,
        diff: this.generateDiff(originalCode, cleanCode),
        explanation: analysis.explanation,
        securityBenefit: strategy.approach,
        confidence: strategy.confidence,
        vulnerabilities: [{
          type: analysis.risk_type,
          severity: analysis.severity,
          line: analysis.affected_lines && analysis.affected_lines[0] ? analysis.affected_lines[0] : 1,
          column: 0,
          message: `${analysis.severity.toUpperCase()}: ${analysis.risk_type.replace(/_/g, ' ')}`,
          description: analysis.explanation,
          cwe: this.getCWE(analysis.risk_type)
        }],
        secretRef: secretRef ? {
          name: secretRef.secretName,
          expiresAt: secretRef.expiresAt
        } : null
      };

    } catch (error) {
      console.error('Patch generation error:', error);
      throw new Error(`Failed to generate patch: ${error.message}`);
    }
  }

  buildPatchPrompt(code, analysis, strategy, secretRef, language) {
    let prompt = `You are a secure code generator for GuardRail AI.

VULNERABILITY DETAILS:
- Type: ${analysis.risk_type}
- Severity: ${analysis.severity}
- Explanation: ${analysis.explanation}
- Affected Lines: ${analysis.affected_lines.join(', ')}

REMEDIATION STRATEGY:
${strategy.approach}

ORIGINAL CODE:
\`\`\`${language}
${code}
\`\`\`

`;

    if (secretRef) {
      prompt += `AWS SECRET CREATED:
Secret Name: ${secretRef.secretName}
Region: ${process.env.AWS_REGION}

RETRIEVAL CODE (${language}):
${secretRef.retrievalCode[this.getLanguageKey(language)]}

`;
    }

    prompt += `REQUIREMENTS:
1. Generate production-ready secure code
2. Maintain all original functionality
3. Add necessary imports/dependencies
4. Include brief security comments
5. Follow ${language} best practices
6. Return ONLY the secure code, no explanations

Generate the secure replacement code now:`;

    return prompt;
  }

  getLanguageKey(language) {
    const map = {
      'javascript': 'nodejs',
      'typescript': 'nodejs',
      'python': 'python',
      'java': 'java'
    };
    return map[language] || 'nodejs';
  }

  extractCode(response) {
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : response.trim();
  }

  generateDiff(original, secure) {
    const origLines = original.split('\n');
    const secureLines = secure.split('\n');

    return {
      linesRemoved: origLines.length,
      linesAdded: secureLines.length,
      changeCount: Math.abs(origLines.length - secureLines.length),
      original: origLines,
      secure: secureLines
    };
  }

  getCWE(riskType) {
    const cweMap = {
      'hardcoded_secret': 'CWE-798',
      'sql_injection': 'CWE-89',
      'insecure_http': 'CWE-319',
      'unsafe_deserialization': 'CWE-502',
      'permissive_config': 'CWE-732',
      'xss': 'CWE-79',
      'command_injection': 'CWE-78',
      'path_traversal': 'CWE-22'
    };
    return cweMap[riskType] || 'CWE-Unknown';
  }
}

module.exports = PatchGenerator;
