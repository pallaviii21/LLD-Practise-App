# LLD Practice Platform

A focused platform where learners can practice Low-Level Design (LLD) problems, design structured solutions, and receive detailed feedback.

## Features

- **4 LLD Problems**: Rate Limiter, Parking Lot, BookMyShow, Vending Machine
- **Structured Submission**: Define classes, responsibilities, methods, and relationships
- **Dual Evaluation**: Deterministic rule-based checks + optional AI-powered feedback
- **Extensible Architecture**: Add new evaluators without modifying existing code
- **Attempt History**: Review and compare previous attempts
- **Graceful AI Fallback**: Works fully without an AI API key

## Architecture

```
┌──────────────┐     ┌───────────────────────────┐
│   React App  │────▶│     Express API Server     │
│  (Vite + TS) │     │                           │
└──────────────┘     │  Controllers → Services    │
                     │  Services → Repositories   │
                     │  Services → Evaluators     │
                     └───────────┬───────────────┘
                                 │
                     ┌───────────▼───────────────┐
                     │       PostgreSQL           │
                     │    (Prisma ORM)           │
                     └───────────────────────────┘
```

### Evaluation Architecture

```
EvaluationService
  ├── RuleBasedEvaluator  (deterministic checks)
  └── AIEvaluator         (LLM-powered feedback)
      └── LLMProvider     (OpenAI-compatible)
```

Problems define evaluation configuration; evaluators define evaluation behavior. No hardcoded problem-specific logic exists in the EvaluationService.

## Tech Stack

| Layer     | Technology                     |
|-----------|--------------------------------|
| Frontend  | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend   | Node.js, Express, TypeScript   |
| Database  | PostgreSQL, Prisma ORM         |
| Testing   | Jest, @swc/jest                 |
| AI        | Gemini API (abstracted)        |

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL running locally
- npm

### 1. Clone and install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Environment Variables

Create `server/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lld_practice?schema=public"
PORT=3001
AI_API_KEY=          # Optional — leave empty for deterministic-only mode
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
```

### 3. Database Setup

```bash
cd server

# Create the database and run migrations
npx prisma db push

# Seed the four problems
npm run seed
```

### 4. Run

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:3001

### 5. Run Tests

```bash
cd server
npm test
```

## Environment Variables

| Variable       | Required | Description                          |
|----------------|----------|--------------------------------------|
| DATABASE_URL   | Yes      | PostgreSQL connection string         |
| PORT           | No       | Server port (default: 3001)          |
| AI_API_KEY     | No       | Gemini API key for AI evaluation     |
| AI_PROVIDER    | No       | AI provider (default: gemini)        |
| AI_MODEL       | No       | AI model (default: gemini-1.5-flash)      |

## API Endpoints

| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| GET    | /api/problems                  | List all problems        |
| GET    | /api/problems/:id              | Get problem details      |
| POST   | /api/attempts                  | Create new attempt       |
| GET    | /api/attempts                  | List all attempts        |
| GET    | /api/attempts/:id              | Get specific attempt     |
| PUT    | /api/attempts/:id/draft        | Save draft submission    |
| POST   | /api/attempts/:id/submit       | Submit for evaluation    |
| GET    | /api/attempts/:id/evaluation   | Get evaluation results   |
| GET    | /api/health                    | Health check             |

## Tests

35 tests covering:
- Submission validation
- Status transitions
- Rule-based evaluator (all 4 problems)
- AI evaluator (availability, errors, invalid responses)
- Evaluation service (merging, failure handling)

## Limitations

- Single-user (no authentication)
- AI evaluation is synchronous (blocks until completion)
- No persistence of multiple submissions per attempt
- Simplified deterministic rules (keyword matching, not semantic analysis)
