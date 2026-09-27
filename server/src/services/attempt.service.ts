import { Attempt, Submission, Evaluation } from '../domain/types';
import { AttemptRepository } from '../repositories/attempt.repository';
import { ProblemRepository } from '../repositories/problem.repository';
import { EvaluationService } from './evaluation.service';
import { validateSubmission, isValidStatusTransition } from '../domain/validation';

export class AttemptService {
  private attemptRepo: AttemptRepository;
  private problemRepo: ProblemRepository;
  private evaluationService: EvaluationService;

  constructor(
    attemptRepo: AttemptRepository,
    problemRepo: ProblemRepository,
    evaluationService: EvaluationService
  ) {
    this.attemptRepo = attemptRepo;
    this.problemRepo = problemRepo;
    this.evaluationService = evaluationService;
  }

  async createAttempt(problemId: string): Promise<Attempt> {
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }
    return this.attemptRepo.create(problemId);
  }

  async getAttempt(id: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(id);
    if (!attempt) {
      throw new AppError('Attempt not found', 404);
    }
    return attempt;
  }

  async getAttemptsByProblem(problemId: string): Promise<Attempt[]> {
    return this.attemptRepo.findByProblemId(problemId);
  }

  async getAllAttempts(): Promise<Attempt[]> {
    return this.attemptRepo.findAll();
  }

  async saveDraft(id: string, submission: Submission): Promise<Attempt> {
    const attempt = await this.getAttempt(id);

    if (attempt.status !== 'DRAFT') {
      throw new AppError(
        'Cannot modify a submitted attempt. Create a new attempt to try again.',
        400
      );
    }

    const errors = validateSubmission(submission);
    // For drafts, we allow partial data but still validate structure
    // Only block on structural errors, not content errors
    const structuralErrors = errors.filter(
      (e) => e.includes('must be') || e.includes('is required')
    );
    if (structuralErrors.length > 0) {
      throw new AppError(
        `Invalid submission structure: ${structuralErrors.join('; ')}`,
        400
      );
    }

    return this.attemptRepo.updateDraft(id, submission);
  }

  async submitAttempt(id: string): Promise<Attempt> {
    const attempt = await this.getAttempt(id);

    if (attempt.status !== 'DRAFT') {
      throw new AppError(
        'Only draft attempts can be submitted',
        400
      );
    }

    if (!attempt.submission) {
      throw new AppError(
        'Cannot submit without a saved draft. Save your design first.',
        400
      );
    }

    const errors = validateSubmission(attempt.submission);
    if (errors.length > 0) {
      throw new AppError(
        `Submission validation failed: ${errors.join('; ')}`,
        400
      );
    }

    // Transition to SUBMITTED then EVALUATING
    await this.attemptRepo.updateStatus(id, 'SUBMITTED');
    await this.attemptRepo.updateStatus(id, 'EVALUATING');

    // Run evaluation asynchronously but wait for it
    try {
      const problem = await this.problemRepo.findById(attempt.problemId);
      if (!problem) {
        throw new AppError('Problem not found', 404);
      }

      const evaluation = await this.evaluationService.evaluate(
        problem,
        attempt.submission
      );

      return this.attemptRepo.updateEvaluation(id, evaluation, 'COMPLETED');
    } catch (error) {
      console.error('Evaluation failed:', error);

      // Try to at least save deterministic feedback
      try {
        const problem = await this.problemRepo.findById(attempt.problemId);
        if (problem && attempt.submission) {
          // Run only rule-based evaluation
          const { RuleBasedEvaluator } = await import(
            '../evaluators/rule-based.evaluator'
          );
          const ruleEvaluator = new RuleBasedEvaluator();
          const ruleResult = await ruleEvaluator.evaluate(
            problem,
            attempt.submission
          );

          const fallbackEvaluation: Evaluation = {
            summary:
              'Evaluation partially completed. AI feedback was unavailable, but deterministic checks are preserved.',
            strengths: ruleResult.strengths,
            criterionResults: ruleResult.criterionResults,
            deterministicFeedback: ruleResult.feedbackItems,
            aiFeedback: null,
            aiAvailable: false,
            evaluatedAt: new Date(),
          };

          return this.attemptRepo.updateEvaluation(
            id,
            fallbackEvaluation,
            'FAILED'
          );
        }
      } catch (fallbackError) {
        console.error('Fallback evaluation also failed:', fallbackError);
      }

      const failedEvaluation: Evaluation = {
        summary: 'Evaluation failed. Please try again later.',
        strengths: [],
        criterionResults: [],
        deterministicFeedback: [],
        aiFeedback: null,
        aiAvailable: false,
        evaluatedAt: new Date(),
      };

      return this.attemptRepo.updateEvaluation(
        id,
        failedEvaluation,
        'FAILED'
      );
    }
  }

  async getEvaluation(id: string): Promise<Evaluation | null> {
    const attempt = await this.getAttempt(id);
    return attempt.evaluation;
  }
}

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
