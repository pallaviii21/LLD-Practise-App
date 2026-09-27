import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { createProblemRouter } from './controllers/problem.controller';
import { createAttemptRouter } from './controllers/attempt.controller';
import { ProblemRepository } from './repositories/problem.repository';
import { AttemptRepository } from './repositories/attempt.repository';
import { ProblemService } from './services/problem.service';
import { AttemptService, AppError } from './services/attempt.service';
import { EvaluationService } from './services/evaluation.service';
import { RuleBasedEvaluator } from './evaluators/rule-based.evaluator';
import { AIEvaluator, OpenAIProvider, GeminiProvider } from './evaluators/ai.evaluator';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// --- Dependency injection ---

// Repositories
const problemRepo = new ProblemRepository();
const attemptRepo = new AttemptRepository();

// Evaluators
const ruleBasedEvaluator = new RuleBasedEvaluator();

const aiApiKey = process.env.AI_API_KEY || '';
const aiProviderType = process.env.AI_PROVIDER || 'gemini';
const aiModel = process.env.AI_MODEL || (aiProviderType === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');

const llmProvider = aiProviderType === 'openai'
  ? new OpenAIProvider(aiApiKey, aiModel)
  : new GeminiProvider(aiApiKey, aiModel);
const aiEvaluator = new AIEvaluator(llmProvider);

// Evaluation service with pluggable evaluators
const evaluationService = new EvaluationService([
  ruleBasedEvaluator,
  aiEvaluator,
]);

// Services
const problemService = new ProblemService(problemRepo);
const attemptService = new AttemptService(
  attemptRepo,
  problemRepo,
  evaluationService
);

// --- Routes ---
app.use('/api/problems', createProblemRouter(problemService));
app.use('/api/attempts', createAttemptRouter(attemptService));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    aiAvailable: llmProvider.isAvailable(),
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get(/.*/, (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// --- Error handling ---
app.use(
  (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err.message);

    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: err.name,
        message: err.message,
        statusCode: err.statusCode,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  }
);

// --- Start server ---
const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, () => {
  console.log(`\n🚀 LLD Practice Platform API running on http://localhost:${PORT}`);
  console.log(`   AI Evaluation: ${llmProvider.isAvailable() ? '✅ Enabled' : '⚠️  Disabled (set AI_API_KEY to enable)'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
