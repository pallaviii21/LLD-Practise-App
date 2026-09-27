import { Submission, ClassDefinition, Relationship } from './types';

/**
 * Validates a submission structure.
 * Returns an array of error messages. Empty array means valid.
 */
export function validateSubmission(submission: Submission): string[] {
  const errors: string[] = [];

  if (!submission) {
    errors.push('Submission is required');
    return errors;
  }

  if (!Array.isArray(submission.classes)) {
    errors.push('Classes must be an array');
  } else {
    if (submission.classes.length === 0) {
      errors.push('At least one class is required');
    }
    submission.classes.forEach((cls, i) => {
      errors.push(...validateClassDefinition(cls, i));
    });
  }

  if (!Array.isArray(submission.relationships)) {
    errors.push('Relationships must be an array');
  } else {
    const classNames = new Set(
      (submission.classes || []).map((c) => c.name.toLowerCase())
    );
    submission.relationships.forEach((rel, i) => {
      errors.push(...validateRelationship(rel, i, classNames));
    });
  }

  if (typeof submission.explanation !== 'string') {
    errors.push('Explanation must be a string');
  }

  return errors;
}

function validateClassDefinition(
  cls: ClassDefinition,
  index: number
): string[] {
  const errors: string[] = [];
  const prefix = `Class[${index}]`;

  if (!cls.name || typeof cls.name !== 'string' || cls.name.trim() === '') {
    errors.push(`${prefix}: name is required`);
  }

  if (!Array.isArray(cls.responsibilities)) {
    errors.push(`${prefix}: responsibilities must be an array`);
  }

  if (!Array.isArray(cls.methods)) {
    errors.push(`${prefix}: methods must be an array`);
  }

  return errors;
}

const VALID_RELATIONSHIP_TYPES = new Set([
  'ASSOCIATION',
  'INHERITANCE',
  'COMPOSITION',
  'AGGREGATION',
]);

function validateRelationship(
  rel: Relationship,
  index: number,
  classNames: Set<string>
): string[] {
  const errors: string[] = [];
  const prefix = `Relationship[${index}]`;

  if (!rel.source || typeof rel.source !== 'string') {
    errors.push(`${prefix}: source is required`);
  } else if (!classNames.has(rel.source.toLowerCase())) {
    errors.push(
      `${prefix}: source "${rel.source}" does not match any defined class`
    );
  }

  if (!rel.target || typeof rel.target !== 'string') {
    errors.push(`${prefix}: target is required`);
  } else if (!classNames.has(rel.target.toLowerCase())) {
    errors.push(
      `${prefix}: target "${rel.target}" does not match any defined class`
    );
  }

  if (!rel.type || !VALID_RELATIONSHIP_TYPES.has(rel.type)) {
    errors.push(
      `${prefix}: type must be one of ASSOCIATION, INHERITANCE, COMPOSITION, AGGREGATION`
    );
  }

  return errors;
}

/**
 * Validates that attempt status transitions are valid.
 */
export function isValidStatusTransition(
  from: string,
  to: string
): boolean {
  const transitions: Record<string, string[]> = {
    DRAFT: ['SUBMITTED'],
    SUBMITTED: ['EVALUATING'],
    EVALUATING: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: [],
  };

  return (transitions[from] || []).includes(to);
}
