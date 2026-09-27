import { EvaluationService } from '../services/evaluation.service';
import { Evaluator, EvaluationResult, Problem, Submission, Difficulty, Requirement, EvaluationConfig } from '../domain/types';

// Mock evaluators
class MockRuleEvaluator implements Evaluator {
  async evaluate(_problem: Problem, _submission: Submission): Promise<EvaluationResult> {
    return {
      summary: 'Rule-based evaluation complete',
      strengths: ['All concepts present'],
      criterionResults: [],
      feedbackItems: [
        {
          criterion: 'rule-check-1',
          status: 'GOOD',
          message: 'All required concepts found',
          suggestion: '',
          severity: 'INFO',
        },
      ],
    };
  }
}

class MockAIEvaluator implements Evaluator {
  async evaluate(_problem: Problem, _submission: Submission): Promise<EvaluationResult> {
    return {
      summary: 'AI evaluation complete',
      strengths: ['Good design patterns'],
      criterionResults: [
        {
          criterionId: 'ai-crit-1',
          criterionName: 'Responsibility Distribution',
          status: 'GOOD',
          feedback: 'Well distributed',
          suggestion: '',
          severity: 'INFO',
        },
      ],
      feedbackItems: [
        {
          criterion: 'ai-crit-1',
          status: 'GOOD',
          message: 'Well distributed responsibilities',
          suggestion: '',
          severity: 'INFO',
        },
      ],
    };
  }
}

class FailingEvaluator implements Evaluator {
  async evaluate(_problem: Problem, _submission: Submission): Promise<EvaluationResult> {
    throw new Error('Evaluator crashed');
  }
}

const testProblem: Problem = {
  id: 'test',
  title: 'Test',
  slug: 'test',
  description: 'Test',
  difficulty: 'MEDIUM' as Difficulty,
  requirements: [] as Requirement[],
  constraints: [],
  submissionConfig: { requiredConcepts: [], minClasses: 1, minRelationships: 0, requireExplanation: true },
  evaluationConfig: { requiredConcepts: [], rules: [], criteria: [] } as EvaluationConfig,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testSubmission: Submission = {
  classes: [{ name: 'Test', responsibilities: ['test'], methods: ['test()'] }],
  relationships: [],
  explanation: 'Test explanation',
};

describe('EvaluationService', () => {
  test('should merge results from multiple evaluators', async () => {
    const service = new EvaluationService([
      new MockRuleEvaluator(),
      new MockAIEvaluator(),
    ]);

    const evaluation = await service.evaluate(testProblem, testSubmission);

    expect(evaluation.summary).toContain('Rule-based');
    expect(evaluation.summary).toContain('AI evaluation');
    expect(evaluation.strengths).toContain('All concepts present');
    expect(evaluation.strengths).toContain('Good design patterns');
    expect(evaluation.deterministicFeedback.length).toBe(1);
    expect(evaluation.aiFeedback!.length).toBe(1);
    expect(evaluation.evaluatedAt).toBeDefined();
  });

  test('should handle evaluator failure gracefully', async () => {
    const service = new EvaluationService([
      new MockRuleEvaluator(),
      new FailingEvaluator(),
    ]);

    const evaluation = await service.evaluate(testProblem, testSubmission);

    // Deterministic feedback should still be present
    expect(evaluation.deterministicFeedback.length).toBe(1);
    expect(evaluation.aiAvailable).toBe(false);
  });

  test('should work with only rule-based evaluator', async () => {
    const service = new EvaluationService([new MockRuleEvaluator()]);

    const evaluation = await service.evaluate(testProblem, testSubmission);

    expect(evaluation.deterministicFeedback.length).toBe(1);
    expect(evaluation.aiFeedback).toBeNull();
  });
});
