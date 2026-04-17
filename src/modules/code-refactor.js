/**
 * Code Refactor Engine
 * Generates secure replacement code
 */

const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

class CodeRefactor {
  constructor() {
    this.client = new BedrockRuntimeClient({ region: 'us-east-1' });
    this.modelId = 'amazon.nova-lite-v1:0';
  }

  async generatePatch({ originalCode, analysis, strategy, secretRef }) {
    const prompt = this.buildRefactorPrompt(originalCode, analysis, strategy, secretRef);

    const payload = {
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: {
        maxTokens: 3000,
        temperature: 0.2,
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
      const secureCode = responseBody.output.message.content[0].text;

      return {
        original_code: originalCode,
        secure_code: this.extractCode(secureCode),
        diff_view: this.generateDiff(originalCode, secureCode),
        reason_for_change: analysis.explanation,
        security_benefit: strategy.approach,
        secretRef: secretRef
      };
    } catch (error) {
      throw new Error(`Code refactoring failed: ${error.message}`);
    }
  }

  buildRefactorPrompt(code, analysis, strategy, secretRef) {
    let prompt = `Generate secure replacement code for this vulnerability.

VULNERABILITY: ${analysis.risk_type}
SEVERITY: ${analysis.severity}
STRATEGY: ${strategy.approach}

ORIGINAL CODE:
${code}

`;

    if (secretRef) {
      prompt += `SECRET REFERENCE:
Name: ${secretRef.secretName}
Retrieval: ${secretRef.retrievalCode.nodejs}

`;
    }

    prompt += `REQUIREMENTS:
- Maintain all functionality
- Use production-ready patterns
- Include necessary imports
- Add brief security comments
- Return ONLY the secure code, no explanations

Generate the secure replacement:`;

    return prompt;
  }

  extractCode(response) {
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : response.trim();
  }

  generateDiff(original, secure) {
    const origLines = original.split('\n');
    const secureLines = this.extractCode(secure).split('\n');
    
    return {
      removed: origLines.length,
      added: secureLines.length,
      preview: `- ${origLines.slice(0, 3).join('\n- ')}\n+ ${secureLines.slice(0, 3).join('\n+ ')}`
    };
  }
}

module.exports = CodeRefactor;
