// Domain types shared between client and server

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
  type: string;
  params: Record<string, unknown>;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  evaluationType: 'RULE' | 'AI';
  weight: number;
}

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
  createdAt: string;
  updatedAt: string;
}

export interface ProblemSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  requiredConcepts: string[];
  criteriaCount: number;
}

// --- Submission ---

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

// --- Attempt ---

export type AttemptStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'EVALUATING'
  | 'COMPLETED'
  | 'FAILED';

export interface Attempt {
  id: string;
  problemId: string;
  status: AttemptStatus;
  submission: Submission | null;
  evaluation: Evaluation | null;
  createdAt: string;
  submittedAt: string | null;
  updatedAt: string;
}

// --- Evaluation ---

export interface Evaluation {
  summary: string;
  strengths: string[];
  criterionResults: CriterionResult[];
  deterministicFeedback: FeedbackItem[];
  aiFeedback: FeedbackItem[] | null;
  aiAvailable: boolean;
  evaluatedAt: string;
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
