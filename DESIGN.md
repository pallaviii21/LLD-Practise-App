# Design Document: LLD Practice Platform

## MVP Scope

A single-user practice platform for 4 LLD problems with structured submission, dual evaluation (deterministic + AI), and attempt history.

**In scope:**
- Problem browsing and detail viewing
- Structured design submission (classes, relationships, explanation)
- Deterministic rule-based evaluation
- AI-powered evaluation (optional)
- Evaluation results with explainable feedback
- Attempt history and retry
- Draft saving

**Out of scope:**
- Authentication / multi-tenancy
- Admin dashboard
- Real-time collaboration
- Microservices / message queues
- Visual UML editor

## User Flow

```
Problems Dashboard
  └── Problem Detail → Start Practice
        └── Practice Page (Editor)
              ├── Save Draft
              └── Submit → Evaluation Page
                    ├── View Results
                    └── Try Again → New Practice Page

History Page
  ├── Review (completed attempts)
  ├── Continue (draft attempts)
  └── Try Again (create new attempt)
```

## Domain Model

```
Problem
  ├── id, title, slug, description, difficulty
  ├── requirements: Requirement[]
  ├── constraints: string[]
  ├── submissionConfig: SubmissionConfig
  └── evaluationConfig: EvaluationConfig

Attempt
  ├── id, problemId, status
  ├── submission: Submission | null
  ├── evaluation: Evaluation | null
  └── timestamps

Submission
  ├── classes: ClassDefinition[]
  ├── relationships: Relationship[]
  └── explanation: string

Evaluation
  ├── summary, strengths
  ├── criterionResults: CriterionResult[]
  ├── deterministicFeedback: FeedbackItem[]
  ├── aiFeedback: FeedbackItem[] | null
  └── aiAvailable: boolean
```

## Evaluation Architecture

### Core Principle

> "Problems define evaluation configuration; evaluators define evaluation behavior."

### Design

```typescript
interface Evaluator {
  evaluate(problem: Problem, submission: Submission): Promise<EvaluationResult>;
}

class EvaluationService {
  constructor(evaluators: Evaluator[]) {}
  async evaluate(problem, submission): Promise<Evaluation> {}
}
```

The EvaluationService:
1. Receives problem + submission
2. Runs all evaluators in sequence
3. Merges results (deterministic first, then AI)
4. Returns unified Evaluation

### Evaluator Implementations

1. **RuleBasedEvaluator**: Reads rules from problem's EvaluationConfig and applies them generically
   - REQUIRED_CONCEPTS: Checks if required domain concepts exist
   - UNIQUE_CLASS_NAMES: Ensures no duplicate class names
   - VALID_RELATIONSHIPS: Validates relationship sources/targets
   - NON_EMPTY_FIELDS: Checks for empty responsibilities/methods/explanation
   - CONCEPT_RESPONSIBILITIES: Checks if key concepts have appropriate responsibilities

2. **AIEvaluator**: Sends structured prompt to LLM, validates response
   - Builds prompt with problem description, requirements, submission, and criteria
   - Instructs AI to accept multiple valid solutions
   - Validates JSON response structure
   - Gracefully handles unavailability and errors

### Problem-Specific Configuration (not code)

Each problem defines its own:
- `requiredConcepts`: What domain entities must exist
- `rules`: Which deterministic checks to apply
- `criteria`: What AI should evaluate against

This eliminates `if (problem === "parking-lot")` style logic.

## Why Structured Submission?

**Pros:**
- Makes deterministic evaluation possible
- Ensures consistent submission structure
- Easier to compare across attempts
- Forces learners to think about class responsibilities

**Cons:**
- Less flexible than free-form text or diagrams
- Can't capture every design nuance

**Why not a visual UML editor?**
- Significantly more complex to build (drag-and-drop, canvas rendering, layout algorithms)
- High risk of bugs and poor UX within a 2-day timeline
- A well-structured form achieves 80% of the value with 20% of the effort

## Handling Evaluation Failure

1. If AI is unavailable (no API key): Shows deterministic feedback only
2. If AI call fails (network/API error): Preserves deterministic feedback, marks as FAILED
3. If AI returns invalid JSON: Logs error, falls back to deterministic feedback
4. In all failure cases: The submission is preserved and can be retried

## Trade-offs

| Decision | Trade-off |
|----------|-----------|
| Synchronous evaluation | Simpler architecture, but blocks the request during AI evaluation |
| JSON fields in PostgreSQL | Simpler schema, but harder to query sub-fields |
| Keyword-based deterministic rules | Fast and deterministic, but limited in semantic understanding |
| Single evaluator sequence | Simple merging, but no parallel evaluation |
| No authentication | Simpler setup, but single-user only |

## Extensibility

Adding a new evaluator (e.g., `PatternEvaluator`):
1. Implement the `Evaluator` interface
2. Add it to the evaluator list in `index.ts`
3. No changes to EvaluationService, controllers, or other evaluators

Adding a new problem:
1. Add seed data with requirements, rules, and criteria
2. No code changes needed
