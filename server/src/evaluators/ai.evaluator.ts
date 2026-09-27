import {
  Evaluator,
  EvaluationResult,
  Problem,
  Submission,
  FeedbackItem,
  CriterionResult,
  AIEvaluationResponse,
  AIEvaluationCriterion,
} from '../domain/types';

/**
 * LLM Provider abstraction. 
 * Allows swapping between different AI providers (OpenAI, Anthropic, etc.).
 */
export interface LLMProvider {
  complete(prompt: string): Promise<string>;
  isAvailable(): boolean;
}

/**
 * OpenAI-compatible LLM provider.
 */
export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(
    apiKey: string,
    model: string = 'gpt-4o-mini',
    baseUrl: string = 'https://api.openai.com/v1'
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert software design evaluator. You evaluate Low-Level Design (LLD) submissions. Always respond with valid JSON.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI provider error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }
}

/**
 * Gemini-compatible LLM provider.
 */
export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async complete(prompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: 'You are an expert software design evaluator. You evaluate Low-Level Design (LLD) submissions. Always respond with valid JSON without any markdown formatting wrappers.',
              },
            ],
          },
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI provider error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as any;
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) {
      throw new Error('Invalid response format from Gemini API');
    }
    return textContent;
  }
}

/**
 * AIEvaluator uses an LLM to provide qualitative feedback on design submissions.
 * Gracefully handles unavailability.
 */
export class AIEvaluator implements Evaluator {
  private provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  async evaluate(
    problem: Problem,
    submission: Submission
  ): Promise<EvaluationResult> {
    if (!this.provider.isAvailable()) {
      return this.unavailableResult();
    }

    try {
      const prompt = this.buildPrompt(problem, submission);
      const rawResponse = await this.provider.complete(prompt);
      const parsed = this.parseResponse(rawResponse, problem);
      return parsed;
    } catch (error) {
      console.error('AI evaluation failed:', error);
      return this.errorResult('AI evaluation failed due to a service error. Please verify your design manually or try again later.');
    }
  }

  private buildPrompt(problem: Problem, submission: Submission): string {
    const aiCriteria = problem.evaluationConfig.criteria.filter(
      (c) => c.evaluationType === 'AI'
    );

    return `
You are evaluating a Low-Level Design (LLD) submission for the following problem.

IMPORTANT: There can be multiple valid LLD solutions. Do not require the learner's design to match a canonical solution. Evaluate whether the design satisfies the requirements and demonstrates sound design principles.

## Problem: ${problem.title}

### Description
${problem.description}

### Requirements
${problem.requirements.map((r) => `- [${r.priority}] ${r.description}`).join('\n')}

## Learner's Submission

### Classes
${submission.classes
  .map(
    (c) => `
**${c.name}**
- Responsibilities: ${c.responsibilities.join(', ') || 'None specified'}
- Methods: ${c.methods.join(', ') || 'None specified'}`
  )
  .join('\n')}

### Relationships
${
  submission.relationships.length > 0
    ? submission.relationships
        .map((r) => `- ${r.source} --[${r.type}]--> ${r.target}`)
        .join('\n')
    : 'No relationships defined'
}

### Design Explanation
${submission.explanation || 'No explanation provided'}

## Evaluation Criteria
Evaluate the submission on these specific criteria:
${aiCriteria
  .map(
    (c) => `- **${c.id}** (${c.name}): ${c.description} [Weight: ${c.weight}%]`
  )
  .join('\n')}

## Response Format
Respond with a JSON object in this exact format:
{
  "criteria": [
    {
      "criterionId": "<criterion id from above>",
      "status": "GOOD" | "NEEDS_IMPROVEMENT" | "MISSING",
      "feedback": "<specific, constructive feedback>",
      "suggestion": "<actionable suggestion for improvement>"
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>"],
  "summary": "<overall assessment in 2-3 sentences>"
}

Include an entry for each criterion listed above. Be specific and constructive in your feedback.
`;
  }

  private parseResponse(
    raw: string,
    problem: Problem
  ): EvaluationResult {
    let parsed: AIEvaluationResponse;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('AI returned invalid JSON');
    }

    // Validate the response structure
    if (!parsed.criteria || !Array.isArray(parsed.criteria)) {
      throw new Error('AI response missing criteria array');
    }
    if (!parsed.summary || typeof parsed.summary !== 'string') {
      throw new Error('AI response missing summary');
    }

    const validStatuses = new Set(['GOOD', 'NEEDS_IMPROVEMENT', 'MISSING']);

    const criterionResults: CriterionResult[] = parsed.criteria
      .filter(
        (c): c is AIEvaluationCriterion =>
          !!c.criterionId && !!c.status && validStatuses.has(c.status)
      )
      .map((c) => {
        const problemCriterion = problem.evaluationConfig.criteria.find(
          (pc) => pc.id === c.criterionId
        );
        return {
          criterionId: c.criterionId,
          criterionName: problemCriterion?.name || c.criterionId,
          status: c.status as 'GOOD' | 'NEEDS_IMPROVEMENT' | 'MISSING',
          feedback: c.feedback || '',
          suggestion: c.suggestion || '',
          severity: (c.status === 'GOOD'
            ? 'INFO'
            : c.status === 'MISSING'
            ? 'ERROR'
            : 'WARNING') as 'INFO' | 'WARNING' | 'ERROR',
        };
      });

    const feedbackItems: FeedbackItem[] = criterionResults.map((cr) => ({
      criterion: cr.criterionId,
      status: cr.status,
      message: cr.feedback,
      suggestion: cr.suggestion,
      severity: cr.severity,
    }));

    return {
      summary: parsed.summary,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      criterionResults,
      feedbackItems,
    };
  }

  private unavailableResult(): EvaluationResult {
    return {
      summary:
        'AI evaluation is not available. Only deterministic feedback is shown. Set the AI_API_KEY environment variable to enable AI-powered feedback.',
      strengths: [],
      criterionResults: [],
      feedbackItems: [
        {
          criterion: 'ai-availability',
          status: 'NEEDS_IMPROVEMENT',
          message:
            'AI evaluation is not configured. Deterministic feedback is still available.',
          suggestion:
            'Set the AI_API_KEY environment variable to enable detailed AI feedback.',
          severity: 'INFO',
        },
      ],
    };
  }

  private errorResult(errorMessage: string): EvaluationResult {
    return {
      summary: `AI evaluation encountered an error. Deterministic feedback is preserved. Error: ${errorMessage}`,
      strengths: [],
      criterionResults: [],
      feedbackItems: [
        {
          criterion: 'ai-error',
          status: 'NEEDS_IMPROVEMENT',
          message: `AI evaluation failed: ${errorMessage}`,
          suggestion:
            'You can retry the evaluation later. Deterministic feedback is still available below.',
          severity: 'WARNING',
        },
      ],
    };
  }
}
