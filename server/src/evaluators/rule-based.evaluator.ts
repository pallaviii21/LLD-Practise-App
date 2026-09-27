import {
  Evaluator,
  EvaluationResult,
  Problem,
  Submission,
  FeedbackItem,
  CriterionResult,
  EvaluationRule,
  FeedbackStatus,
  FeedbackSeverity,
} from '../domain/types';

/**
 * RuleBasedEvaluator runs deterministic checks against a submission.
 * It reads rules from the problem's EvaluationConfig and applies them generically.
 * No problem-specific hardcoded logic exists in this evaluator.
 */
export class RuleBasedEvaluator implements Evaluator {
  async evaluate(
    problem: Problem,
    submission: Submission
  ): Promise<EvaluationResult> {
    const feedbackItems: FeedbackItem[] = [];
    const criterionResults: CriterionResult[] = [];
    const strengths: string[] = [];

    const { rules } = problem.evaluationConfig;

    for (const rule of rules) {
      const result = this.evaluateRule(rule, problem, submission);
      feedbackItems.push(...result.feedbackItems);
      if (result.strength) {
        strengths.push(result.strength);
      }
    }

    // Generate criterion results for RULE-type criteria
    const ruleCriteria = problem.evaluationConfig.criteria.filter(
      (c) => c.evaluationType === 'RULE'
    );
    for (const criterion of ruleCriteria) {
      const relatedFeedback = feedbackItems.filter(
        (f) => f.criterion === criterion.id
      );
      const worstStatus = this.getWorstStatus(relatedFeedback);
      criterionResults.push({
        criterionId: criterion.id,
        criterionName: criterion.name,
        status: worstStatus,
        feedback: relatedFeedback.map((f) => f.message).join('; ') || 'All checks passed',
        suggestion: relatedFeedback.map((f) => f.suggestion).filter(Boolean).join('; '),
        severity: worstStatus === 'GOOD' ? 'INFO' : worstStatus === 'MISSING' ? 'ERROR' : 'WARNING',
      });
    }

    const summary = this.generateSummary(feedbackItems, strengths);

    return {
      summary,
      strengths,
      criterionResults,
      feedbackItems,
    };
  }

  private evaluateRule(
    rule: EvaluationRule,
    problem: Problem,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    switch (rule.type) {
      case 'REQUIRED_CONCEPTS':
        return this.checkRequiredConcepts(rule, submission);
      case 'UNIQUE_CLASS_NAMES':
        return this.checkUniqueClassNames(rule, submission);
      case 'VALID_RELATIONSHIPS':
        return this.checkValidRelationships(rule, submission);
      case 'NON_EMPTY_FIELDS':
        return this.checkNonEmptyFields(rule, submission);
      case 'MIN_CLASSES':
        return this.checkMinClasses(rule, submission);
      case 'MIN_RELATIONSHIPS':
        return this.checkMinRelationships(rule, submission);
      case 'CONCEPT_RESPONSIBILITIES':
        return this.checkConceptResponsibilities(rule, submission);
      case 'REQUIREMENT_COVERAGE':
        return this.checkRequirementCoverage(rule, problem, submission);
      default:
        return { feedbackItems: [], strength: null };
    }
  }

  private checkRequiredConcepts(
    rule: EvaluationRule,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    const feedbackItems: FeedbackItem[] = [];
    const requiredConcepts = (rule.params.concepts as string[]) || [];
    const submittedClassNames = submission.classes.map((c) =>
      c.name.toLowerCase().trim()
    );

    const missing: string[] = [];
    const found: string[] = [];

    for (const concept of requiredConcepts) {
      const conceptLower = concept.toLowerCase();
      // Flexible matching: check if any class name contains the concept
      const hasMatch = submittedClassNames.some(
        (name) =>
          name === conceptLower ||
          name.includes(conceptLower) ||
          conceptLower.includes(name)
      );

      if (hasMatch) {
        found.push(concept);
      } else {
        missing.push(concept);
      }
    }

    if (missing.length > 0) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'MISSING',
        message: `Missing concepts: ${missing.join(', ')}`,
        suggestion: `Consider adding classes or interfaces for: ${missing.join(', ')}`,
        severity: 'ERROR',
      });
    }

    if (found.length > 0 && missing.length === 0) {
      return {
        feedbackItems,
        strength: `All required domain concepts are present (${found.join(', ')})`,
      };
    }

    if (found.length > 0) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'NEEDS_IMPROVEMENT',
        message: `Found ${found.length}/${requiredConcepts.length} required concepts: ${found.join(', ')}`,
        suggestion: `Add the missing concepts to improve coverage`,
        severity: 'WARNING',
      });
    }

    return { feedbackItems, strength: null };
  }

  private checkUniqueClassNames(
    rule: EvaluationRule,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    const feedbackItems: FeedbackItem[] = [];
    const names = submission.classes.map((c) => c.name.toLowerCase().trim());
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const name of names) {
      if (seen.has(name)) {
        duplicates.push(name);
      }
      seen.add(name);
    }

    if (duplicates.length > 0) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'MISSING',
        message: `Duplicate class names found: ${duplicates.join(', ')}`,
        suggestion: 'Each class should have a unique name',
        severity: 'ERROR',
      });
    }

    return {
      feedbackItems,
      strength: duplicates.length === 0 ? 'All class names are unique' : null,
    };
  }

  private checkValidRelationships(
    rule: EvaluationRule,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    const feedbackItems: FeedbackItem[] = [];
    const classNames = new Set(
      submission.classes.map((c) => c.name.toLowerCase().trim())
    );

    for (const rel of submission.relationships) {
      if (!classNames.has(rel.source.toLowerCase().trim())) {
        feedbackItems.push({
          criterion: rule.id,
          status: 'MISSING',
          message: `Relationship source "${rel.source}" does not match any defined class`,
          suggestion: `Make sure "${rel.source}" is defined as a class, or correct the relationship source`,
          severity: 'ERROR',
        });
      }
      if (!classNames.has(rel.target.toLowerCase().trim())) {
        feedbackItems.push({
          criterion: rule.id,
          status: 'MISSING',
          message: `Relationship target "${rel.target}" does not match any defined class`,
          suggestion: `Make sure "${rel.target}" is defined as a class, or correct the relationship target`,
          severity: 'ERROR',
        });
      }
    }

    return {
      feedbackItems,
      strength:
        feedbackItems.length === 0 && submission.relationships.length > 0
          ? 'All relationships reference valid classes'
          : null,
    };
  }

  private checkNonEmptyFields(
    rule: EvaluationRule,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    const feedbackItems: FeedbackItem[] = [];

    if (submission.classes.length === 0) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'MISSING',
        message: 'No classes defined',
        suggestion: 'Add at least one class to your design',
        severity: 'ERROR',
      });
    }

    for (const cls of submission.classes) {
      if (cls.responsibilities.length === 0) {
        feedbackItems.push({
          criterion: rule.id,
          status: 'NEEDS_IMPROVEMENT',
          message: `Class "${cls.name}" has no responsibilities defined`,
          suggestion: `Define what "${cls.name}" is responsible for`,
          severity: 'WARNING',
        });
      }
      if (cls.methods.length === 0) {
        feedbackItems.push({
          criterion: rule.id,
          status: 'NEEDS_IMPROVEMENT',
          message: `Class "${cls.name}" has no methods defined`,
          suggestion: `Add key methods to "${cls.name}" to clarify its behavior`,
          severity: 'WARNING',
        });
      }
    }

    if (!submission.explanation || submission.explanation.trim().length < 20) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'NEEDS_IMPROVEMENT',
        message: 'Design explanation is too short or missing',
        suggestion: 'Provide a more detailed explanation of your design decisions and trade-offs',
        severity: 'WARNING',
      });
    }

    return { feedbackItems, strength: null };
  }

  private checkMinClasses(
    rule: EvaluationRule,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    const feedbackItems: FeedbackItem[] = [];
    const min = (rule.params.min as number) || 3;

    if (submission.classes.length < min) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'NEEDS_IMPROVEMENT',
        message: `Only ${submission.classes.length} classes defined (minimum recommended: ${min})`,
        suggestion: 'Consider if there are more domain concepts that should be modeled as separate classes',
        severity: 'WARNING',
      });
    }

    return { feedbackItems, strength: null };
  }

  private checkMinRelationships(
    rule: EvaluationRule,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    const feedbackItems: FeedbackItem[] = [];
    const min = (rule.params.min as number) || 2;

    if (submission.relationships.length < min) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'NEEDS_IMPROVEMENT',
        message: `Only ${submission.relationships.length} relationships defined (minimum recommended: ${min})`,
        suggestion: 'Define how your classes relate to each other',
        severity: 'WARNING',
      });
    }

    return { feedbackItems, strength: null };
  }

  private checkConceptResponsibilities(
    rule: EvaluationRule,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    const feedbackItems: FeedbackItem[] = [];
    const conceptName = rule.params.concept as string;
    const expectedKeywords = (rule.params.expectedResponsibilities as string[]) || [];

    const matchingClass = submission.classes.find(
      (c) => c.name.toLowerCase().includes(conceptName.toLowerCase())
    );

    if (!matchingClass) {
      return { feedbackItems, strength: null };
    }

    const allText = [
      ...matchingClass.responsibilities,
      ...matchingClass.methods,
    ]
      .join(' ')
      .toLowerCase();

    const coveredKeywords = expectedKeywords.filter((kw) =>
      allText.includes(kw.toLowerCase())
    );
    const missingKeywords = expectedKeywords.filter(
      (kw) => !allText.includes(kw.toLowerCase())
    );

    if (missingKeywords.length > 0 && coveredKeywords.length < expectedKeywords.length / 2) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'NEEDS_IMPROVEMENT',
        message: `"${matchingClass.name}" may be missing some key responsibilities`,
        suggestion: `Consider whether "${matchingClass.name}" should address: ${missingKeywords.join(', ')}`,
        severity: 'WARNING',
      });
    }

    if (coveredKeywords.length === expectedKeywords.length) {
      return {
        feedbackItems,
        strength: `"${matchingClass.name}" has well-defined responsibilities`,
      };
    }

    return { feedbackItems, strength: null };
  }

  private checkRequirementCoverage(
    rule: EvaluationRule,
    problem: Problem,
    submission: Submission
  ): { feedbackItems: FeedbackItem[]; strength: string | null } {
    // Simple heuristic: check if required requirements are mentioned in explanation or class names
    const feedbackItems: FeedbackItem[] = [];
    const mustHaveReqs = problem.requirements.filter(
      (r) => r.priority === 'MUST_HAVE'
    );
    const allText = [
      submission.explanation,
      ...submission.classes.map((c) => c.name),
      ...submission.classes.flatMap((c) => c.responsibilities),
      ...submission.classes.flatMap((c) => c.methods),
    ]
      .join(' ')
      .toLowerCase();

    const uncovered = mustHaveReqs.filter((req) => {
      const keywords = req.description.toLowerCase().split(/\s+/).filter(
        (w) => w.length > 4
      );
      const coveredCount = keywords.filter((kw) => allText.includes(kw)).length;
      return coveredCount < keywords.length * 0.3;
    });

    if (uncovered.length > 0) {
      feedbackItems.push({
        criterion: rule.id,
        status: 'NEEDS_IMPROVEMENT',
        message: `Some requirements may not be fully addressed in your design`,
        suggestion: `Review these requirements: ${uncovered.map((r) => r.description).slice(0, 3).join('; ')}`,
        severity: 'WARNING',
      });
    }

    return { feedbackItems, strength: null };
  }

  private getWorstStatus(items: FeedbackItem[]): FeedbackStatus {
    if (items.some((i) => i.status === 'MISSING')) return 'MISSING';
    if (items.some((i) => i.status === 'NEEDS_IMPROVEMENT'))
      return 'NEEDS_IMPROVEMENT';
    return 'GOOD';
  }

  private generateSummary(
    feedbackItems: FeedbackItem[],
    strengths: string[]
  ): string {
    const errors = feedbackItems.filter((f) => f.severity === 'ERROR').length;
    const warnings = feedbackItems.filter(
      (f) => f.severity === 'WARNING'
    ).length;

    if (errors === 0 && warnings === 0) {
      return 'All deterministic checks passed. Your submission has good structural coverage.';
    }

    const parts: string[] = [];
    if (errors > 0) {
      parts.push(`${errors} issue(s) found`);
    }
    if (warnings > 0) {
      parts.push(`${warnings} area(s) for improvement`);
    }
    if (strengths.length > 0) {
      parts.push(`${strengths.length} strength(s) identified`);
    }

    return `Deterministic evaluation: ${parts.join(', ')}.`;
  }
}
