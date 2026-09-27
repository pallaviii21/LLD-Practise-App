import { Router, Request, Response, NextFunction } from 'express';
import { ProblemService } from '../services/problem.service';

export function createProblemRouter(problemService: ProblemService): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problems = await problemService.getAllProblems();
      // Return a lighter version for the list view
      const summaries = problems.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description.substring(0, 200) + '...',
        difficulty: p.difficulty,
        requiredConcepts: p.submissionConfig.requiredConcepts,
        criteriaCount: p.evaluationConfig.criteria.length,
      }));
      res.json(summaries);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const problem = await problemService.getProblemById(req.params.id as string);
      if (!problem) {
        res.status(404).json({ error: 'Not Found', message: 'Problem not found' });
        return;
      }
      res.json(problem);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
