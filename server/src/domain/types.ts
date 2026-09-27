// ============================================================
// Domain Types for LLD Practice Platform
// ============================================================

// --- Problem Domain ---

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  requirements: Requirement[];
  constraints: string[];
  submissionConfig: SubmissionConfig;
  evaluationConfig: EvaluationConfig;
  createdAt: Date;
  updatedAt: Date;
}

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface Requirement {
  id: string;
  description: string;
  priority: 'MUST_HAVE' | 'SHOULD_HAVE' | 'NICE_TO_HAVE';
}

export interface SubmissionConfig {
  requiredConcepts: string[];
  minClasses: number;
  minRelationships: number;
  requireExplanation: boolean;
}

export interface EvaluationConfig {
  requiredConcepts: string[];
  rules: EvaluationRule[];
  criteria: EvaluationCriterion[];
}

export interface EvaluationRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  params: Record<string, unknown>;
}

export type RuleType =
  | 'REQUIRED_CONCEPTS'
  | 'UNIQUE_CLASS_NAMES'
  | 'VALID_RELATIONSHIPS'
  | 'NON_EMPTY_FIELDS'
  | 'MIN_CLASSES'
  | 'MIN_RELATIONSHIPS'
  | 'CONCEPT_RESPONSIBILITIES'
  | 'REQUIREMENT_COVERAGE';

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  evaluationType: 'RULE' | 'AI';
  weight: number;
}

// --- Submission Domain ---

export interface Submission {
  classes: ClassDefinition[];
  relationships: Relationship[];
  explanation: string;
}

export interface ClassDefinition {
  name: string;
  responsibilities: string[];
  methods: string[];
}

export interface Relationship {
  source: string;
  target: string;
  type: RelationshipType;
}

export type RelationshipType =
  | 'ASSOCIATION'
  | 'INHERITANCE'
  | 'COMPOSITION'
  | 'AGGREGATION';

// --- Attempt Domain ---

export interface Attempt {
  id: string;
  problemId: string;
  status: AttemptStatus;
  submission: Submission | null;
  evaluation: Evaluation | null;
  createdAt: Date;
  submittedAt: Date | null;
  updatedAt: Date;
}

export type AttemptStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'FAILED';

// --- Evaluation Domain ---

export interface Evaluation {
  summary: string;
  strengths: string[];
  criterionResults: CriterionResult[];
  deterministicFeedback: FeedbackItem[];
  aiFeedback: FeedbackItem[] | null;
  aiAvailable: boolean;
  evaluatedAt: Date;
}

export interface CriterionResult {
  criterionId: string;
  criterionName: string;
  status: FeedbackStatus;
  feedback: string;
  suggestion: string;
  severity: FeedbackSeverity;
}

export interface FeedbackItem {
  criterion: string;
  status: FeedbackStatus;
  message: string;
  suggestion: string;
  severity: FeedbackSeverity;
}

export type FeedbackStatus = 'GOOD' | 'NEEDS_IMPROVEMENT' | 'MISSING';
export type FeedbackSeverity = 'INFO' | 'WARNING' | 'ERROR';

// --- Evaluator Interface ---

export interface EvaluationResult {
  summary: string;
  strengths: string[];
  criterionResults: CriterionResult[];
  feedbackItems: FeedbackItem[];
}

export interface Evaluator {
  evaluate(
    problem: Problem,
    submission: Submission
  ): Promise<EvaluationResult>;
}

// --- AI Response Types ---

export interface AIEvaluationResponse {
  criteria: AIEvaluationCriterion[];
  strengths: string[];
  summary: string;
}

export interface AIEvaluationCriterion {
  criterionId: string;
  status: 'GOOD' | 'NEEDS_IMPROVEMENT' | 'MISSING';
  feedback: string;
  suggestion: string;
}

// --- API Types ---

export interface CreateAttemptRequest {
  problemId: string;
}

export interface SaveDraftRequest {
  submission: Submission;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
