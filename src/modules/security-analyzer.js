/**
 * Security Analysis Engine
 * Uses Amazon Bedrock Nova Lite for vulnerability detection
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class SecurityAnalyzer {
  constructor(config) {
    this.client = new BedrockRuntimeClient({ region: config.region || 'us-east-1' });
    this.modelId = 'amazon.nova-lite-v1:0';
  }

  async analyze({ code, language, filePath, modifiedLines }) {
    const prompt = this.buildAnalysisPrompt(code, language, modifiedLines);
    
    const payload = {
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.1,
        topP: 0.9
      }
    };

    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload)
      });

      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const analysisText = responseBody.output.message.content[0].text;
      
      return this.parseAnalysisResponse(analysisText);
    } catch (error) {
      throw new Error(`Bedrock analysis failed: ${error.message}`);
    }
  }

  buildAnalysisPrompt(code, language, modifiedLines) {
    return `You are a security analysis engine. Analyze this ${language} code for vulnerabilities.

SECURITY RULES:
- Detect hardcoded secrets (API keys, passwords, tokens, private keys)
- Detect SQL injection patterns
- Detect insecure HTTP for sensitive data
- Detect unsafe deserialization
- Detect overly permissive configurations

CODE TO ANALYZE:
\`\`\`${language}
${code}
\`\`\`

MODIFIED LINES: ${JSON.stringify(modifiedLines)}

Return ONLY valid JSON in this exact format:
{
  "risk_detected": boolean,
  "risk_type": "hardcoded_secret|sql_injection|insecure_http|unsafe_deserialization|permissive_config|none",
  "severity": "low|medium|high|critical",
  "explanation": "brief explanation",
  "affected_lines": [line numbers],
  "remediation_required": boolean,
  "extracted_value": "the secret value if applicable"
}`;
  }

  parseAnalysisResponse(text) {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { risk_detected: false, risk_type: 'none', remediation_required: false };
    }
    
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      return { risk_detected: false, risk_type: 'none', remediation_required: false };
    }
  }
}

module.exports = SecurityAnalyzer;
