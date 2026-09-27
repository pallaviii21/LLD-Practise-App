import { Router, Request, Response, NextFunction } from 'express';
import { AttemptService, AppError } from '../services/attempt.service';

export function createAttemptRouter(attemptService: AttemptService): Router {
  const router = Router();

  // Create a new attempt
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { problemId } = req.body;
      if (!problemId || typeof problemId !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'problemId is required',
        });
        return;
      }
      const attempt = await attemptService.createAttempt(problemId);
      res.status(201).json(attempt);
    } catch (error) {
      next(error);
    }
  });

  // List all attempts (optionally filter by problemId)
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { problemId } = req.query;
      let attempts;
      if (problemId && typeof problemId === 'string') {
        attempts = await attemptService.getAttemptsByProblem(problemId);
      } else {
        attempts = await attemptService.getAllAttempts();
      }
      res.json(attempts);
    } catch (error) {
      next(error);
    }
  });

  // Get a specific attempt
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attempt = await attemptService.getAttempt(req.params.id as string);
      res.json(attempt);
    } catch (error) {
      next(error);
    }
  });

  // Save draft
  router.put(
    '/:id/draft',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { submission } = req.body;
        if (!submission) {
          res.status(400).json({
            error: 'Bad Request',
            message: 'submission is required',
          });
          return;
        }
        const attempt = await attemptService.saveDraft(
          req.params.id as string,
          submission
        );
        res.json(attempt);
      } catch (error) {
        next(error);
      }
    }
  );

  // Submit attempt for evaluation
  router.post(
    '/:id/submit',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const attempt = await attemptService.submitAttempt(req.params.id as string);
        res.json(attempt);
      } catch (error) {
        next(error);
      }
    }
  );

  // Get evaluation
  router.get(
    '/:id/evaluation',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const evaluation = await attemptService.getEvaluation(req.params.id as string);
        if (!evaluation) {
          res.status(404).json({
            error: 'Not Found',
            message:
              'No evaluation available yet. Submit your attempt first.',
          });
          return;
        }
        res.json(evaluation);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
