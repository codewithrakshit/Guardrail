/**
 * Bedrock Client Wrapper
 * Handles all Amazon Bedrock Nova Lite interactions
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class BedrockClient {
  constructor() {
    this.client = new BedrockRuntimeClient({ 
      region: process.env.AWS_REGION || 'us-east-1' 
    });
    this.modelId = 'amazon.nova-lite-v1:0';
    this.maxTokens = parseInt(process.env.BEDROCK_MAX_TOKENS) || 2000;
  }

  async analyzeCode({ code, language, filename }) {
    const prompt = this.buildAnalysisPrompt(code, language, filename);

    const payload = {
      messages: [{ 
        role: 'user', 
        content: [{ text: prompt }] 
      }],
      inferenceConfig: {
        maxTokens: this.maxTokens,
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
      console.error('Bedrock analysis error:', error);
      throw new Error(`Security analysis failed: ${error.message}`);
    }
  }

  buildAnalysisPrompt(code, language, filename) {
    return `You are a security analysis engine for GuardRail AI, a production SaaS platform.

CRITICAL SECURITY RULES TO DETECT:
1. Hardcoded secrets (API keys, passwords, tokens, private keys, JWT secrets, OAuth credentials)
2. SQL injection vulnerabilities (unsanitized user input in queries)
3. Insecure HTTP usage for sensitive data
4. Unsafe deserialization patterns
5. Overly permissive access configurations

FILE INFORMATION:
- Filename: ${filename}
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
