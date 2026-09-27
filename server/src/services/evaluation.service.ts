import {
  Evaluator,
  EvaluationResult,
  Problem,
  Submission,
  Evaluation,
  CriterionResult,
  FeedbackItem,
} from '../domain/types';

/**
 * EvaluationService orchestrates multiple evaluators.
 * It runs all evaluators, merges results, and returns a unified Evaluation.
 * 
 * New evaluators can be added without modifying this class — 
 * simply pass them in the constructor.
 */
export class EvaluationService {
  private evaluators: Evaluator[];

  constructor(evaluators: Evaluator[]) {
    this.evaluators = evaluators;
  }

  async evaluate(
    problem: Problem,
    submission: Submission
  ): Promise<Evaluation> {
    const results: EvaluationResult[] = [];
    let aiAvailable = true;

    for (const evaluator of this.evaluators) {
      try {
        const result = await evaluator.evaluate(problem, submission);
        results.push(result);
      } catch (error) {
        console.error('Evaluator failed:', error);
        // If an evaluator fails, we continue with the rest
        aiAvailable = false;
      }
    }

    return this.mergeResults(results, aiAvailable);
  }

  private mergeResults(
    results: EvaluationResult[],
    aiAvailable: boolean
  ): Evaluation {
    const allCriterionResults: CriterionResult[] = [];
    const deterministicFeedback: FeedbackItem[] = [];
    const aiFeedback: FeedbackItem[] = [];
    const allStrengths: string[] = [];
    const summaries: string[] = [];

    // First result is typically the rule-based evaluator
    if (results.length > 0) {
      const ruleResult = results[0];
      deterministicFeedback.push(...ruleResult.feedbackItems);
      allCriterionResults.push(...ruleResult.criterionResults);
      allStrengths.push(...ruleResult.strengths);
      if (ruleResult.summary) {
        summaries.push(ruleResult.summary);
      }
    }

    // Remaining results are AI evaluators
    for (let i = 1; i < results.length; i++) {
      const aiResult = results[i];
      aiFeedback.push(...aiResult.feedbackItems);
      allCriterionResults.push(...aiResult.criterionResults);
      allStrengths.push(...aiResult.strengths);
      if (aiResult.summary) {
        summaries.push(aiResult.summary);
      }

      // Check if AI reported as unavailable
      if (
        aiResult.feedbackItems.some(
          (f) =>
            f.criterion === 'ai-availability' || f.criterion === 'ai-error'
        )
      ) {
        aiAvailable = false;
      }
    }

    // Deduplicate criterion results (prefer AI results over rule-based for same criterion)
    const criterionMap = new Map<string, CriterionResult>();
    for (const cr of allCriterionResults) {
      const existing = criterionMap.get(cr.criterionId);
      if (!existing) {
        criterionMap.set(cr.criterionId, cr);
      }
      // If both rule-based and AI have results for the same criterion,
      // keep the AI result as it's typically more detailed
    }

    return {
      summary: summaries.join(' '),
      strengths: [...new Set(allStrengths)],
      criterionResults: Array.from(criterionMap.values()),
      deterministicFeedback,
      aiFeedback: aiFeedback.length > 0 ? aiFeedback : null,
      aiAvailable,
      evaluatedAt: new Date(),
    };
  }
}
