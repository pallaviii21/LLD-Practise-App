import { AIEvaluator, LLMProvider } from '../evaluators/ai.evaluator';
import { Problem, Submission, Difficulty, Requirement, EvaluationConfig } from '../domain/types';

// Mock LLM Provider
class MockLLMProvider implements LLMProvider {
  private response: string;
  private available: boolean;
  private shouldThrow: boolean;

  constructor(response: string = '', available: boolean = true, shouldThrow: boolean = false) {
    this.response = response;
    this.available = available;
    this.shouldThrow = shouldThrow;
  }

  isAvailable(): boolean {
    return this.available;
  }

  async complete(_prompt: string): Promise<string> {
    if (this.shouldThrow) {
      throw new Error('API rate limit exceeded');
    }
    return this.response;
  }
}

function createTestProblem(): Problem {
  return {
    id: 'test',
    title: 'Test Problem',
    slug: 'test',
    description: 'Test description',
    difficulty: 'MEDIUM' as Difficulty,
    requirements: [
      { id: 'r1', description: 'Test requirement', priority: 'MUST_HAVE' as const },
    ] as Requirement[],
    constraints: [],
    submissionConfig: {
      requiredConcepts: ['TestClass'],
      minClasses: 1,
      minRelationships: 0,
      requireExplanation: true,
    },
    evaluationConfig: {
      requiredConcepts: ['TestClass'],
      rules: [],
      criteria: [
        {
          id: 'crit-1',
          name: 'Test Criterion',
          description: 'Test criterion description',
          evaluationType: 'AI',
          weight: 100,
        },
      ],
    } as EvaluationConfig,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const testSubmission: Submission = {
  classes: [{ name: 'TestClass', responsibilities: ['test'], methods: ['test()'] }],
  relationships: [],
  explanation: 'Test explanation',
};

describe('AIEvaluator', () => {
  test('should return unavailable result when provider is not available', async () => {
    const provider = new MockLLMProvider('', false);
    const evaluator = new AIEvaluator(provider);

    const result = await evaluator.evaluate(createTestProblem(), testSubmission);

    expect(result.summary).toContain('not available');
    expect(result.feedbackItems.length).toBeGreaterThan(0);
    expect(result.feedbackItems[0].criterion).toBe('ai-availability');
  });

  test('should handle provider throwing an error gracefully', async () => {
    const provider = new MockLLMProvider('', true, true);
    const evaluator = new AIEvaluator(provider);

    const result = await evaluator.evaluate(createTestProblem(), testSubmission);

    expect(result.summary).toContain('error');
    expect(result.feedbackItems[0].criterion).toBe('ai-error');
    expect(result.feedbackItems[0].message).toContain('rate limit');
  });

  test('should handle invalid JSON response', async () => {
    const provider = new MockLLMProvider('This is not JSON at all');
    const evaluator = new AIEvaluator(provider);

    const result = await evaluator.evaluate(createTestProblem(), testSubmission);

    expect(result.summary).toContain('error');
    expect(result.feedbackItems[0].criterion).toBe('ai-error');
  });

  test('should handle malformed JSON response (missing criteria)', async () => {
    const provider = new MockLLMProvider(JSON.stringify({
      summary: 'Good design',
      strengths: ['Nice'],
      // missing criteria field
    }));
    const evaluator = new AIEvaluator(provider);

    const result = await evaluator.evaluate(createTestProblem(), testSubmission);

    expect(result.summary).toContain('error');
  });

  test('should handle valid AI response correctly', async () => {
    const validResponse = JSON.stringify({
      criteria: [
        {
          criterionId: 'crit-1',
          status: 'GOOD',
          feedback: 'Great design',
          suggestion: 'Consider adding more detail',
        },
      ],
      strengths: ['Clean separation of concerns'],
      summary: 'Overall, a solid design approach.',
    });

    const provider = new MockLLMProvider(validResponse);
    const evaluator = new AIEvaluator(provider);

    const result = await evaluator.evaluate(createTestProblem(), testSubmission);

    expect(result.summary).toBe('Overall, a solid design approach.');
    expect(result.strengths).toContain('Clean separation of concerns');
    expect(result.criterionResults.length).toBe(1);
    expect(result.criterionResults[0].status).toBe('GOOD');
    expect(result.criterionResults[0].feedback).toBe('Great design');
  });

  test('should filter out criteria with invalid status', async () => {
    const response = JSON.stringify({
      criteria: [
        {
          criterionId: 'crit-1',
          status: 'GOOD',
          feedback: 'Valid',
          suggestion: '',
        },
        {
          criterionId: 'crit-2',
          status: 'INVALID_STATUS',
          feedback: 'This should be filtered',
          suggestion: '',
        },
      ],
      strengths: [],
      summary: 'Summary',
    });

    const provider = new MockLLMProvider(response);
    const evaluator = new AIEvaluator(provider);

    const result = await evaluator.evaluate(createTestProblem(), testSubmission);

    // Only the valid criterion should remain
    expect(result.criterionResults.length).toBe(1);
    expect(result.criterionResults[0].criterionId).toBe('crit-1');
  });
});
