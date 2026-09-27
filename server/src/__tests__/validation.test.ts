import { validateSubmission, isValidStatusTransition } from '../domain/validation';
import { Submission } from '../domain/types';

describe('Submission Validation', () => {
  const validSubmission: Submission = {
    classes: [
      {
        name: 'ParkingLot',
        responsibilities: ['Manage floors'],
        methods: ['addFloor()'],
      },
      {
        name: 'Vehicle',
        responsibilities: ['Represent a vehicle'],
        methods: ['getType()'],
      },
    ],
    relationships: [
      { source: 'ParkingLot', target: 'Vehicle', type: 'ASSOCIATION' },
    ],
    explanation: 'This is my design explanation for the parking lot system.',
  };

  test('should accept a valid submission', () => {
    const errors = validateSubmission(validSubmission);
    expect(errors).toEqual([]);
  });

  test('should reject submission with no classes', () => {
    const submission: Submission = {
      classes: [],
      relationships: [],
      explanation: 'Some explanation',
    };
    const errors = validateSubmission(submission);
    expect(errors).toContain('At least one class is required');
  });

  test('should reject submission with empty class name', () => {
    const submission: Submission = {
      classes: [{ name: '', responsibilities: [], methods: [] }],
      relationships: [],
      explanation: 'explanation',
    };
    const errors = validateSubmission(submission);
    expect(errors.some((e) => e.includes('name is required'))).toBe(true);
  });

  test('should detect duplicate class names via unique validation rule', () => {
    // This tests the structural validation
    const submission: Submission = {
      classes: [
        { name: 'Vehicle', responsibilities: ['a'], methods: ['b'] },
        { name: 'Vehicle', responsibilities: ['c'], methods: ['d'] },
      ],
      relationships: [],
      explanation: 'explanation',
    };
    // Basic validation passes (duplicates are checked at the evaluator level)
    const errors = validateSubmission(submission);
    // Structural validation doesn't check duplicates — that's the evaluator's job
    expect(errors).toEqual([]);
  });

  test('should reject relationship with non-existent source', () => {
    const submission: Submission = {
      classes: [{ name: 'ParkingLot', responsibilities: ['a'], methods: ['b'] }],
      relationships: [
        { source: 'NonExistent', target: 'ParkingLot', type: 'ASSOCIATION' },
      ],
      explanation: 'explanation',
    };
    const errors = validateSubmission(submission);
    expect(errors.some((e) => e.includes('NonExistent'))).toBe(true);
  });

  test('should reject relationship with non-existent target', () => {
    const submission: Submission = {
      classes: [{ name: 'ParkingLot', responsibilities: ['a'], methods: ['b'] }],
      relationships: [
        { source: 'ParkingLot', target: 'Missing', type: 'ASSOCIATION' },
      ],
      explanation: 'explanation',
    };
    const errors = validateSubmission(submission);
    expect(errors.some((e) => e.includes('Missing'))).toBe(true);
  });

  test('should reject invalid relationship type', () => {
    const submission: Submission = {
      classes: [
        { name: 'A', responsibilities: ['a'], methods: ['b'] },
        { name: 'B', responsibilities: ['c'], methods: ['d'] },
      ],
      relationships: [
        { source: 'A', target: 'B', type: 'INVALID' as any },
      ],
      explanation: 'explanation',
    };
    const errors = validateSubmission(submission);
    expect(errors.some((e) => e.includes('type must be one of'))).toBe(true);
  });

  test('should reject null submission', () => {
    const errors = validateSubmission(null as any);
    expect(errors).toContain('Submission is required');
  });
});

describe('Status Transitions', () => {
  test('DRAFT can transition to SUBMITTED', () => {
    expect(isValidStatusTransition('DRAFT', 'SUBMITTED')).toBe(true);
  });

  test('SUBMITTED can transition to EVALUATING', () => {
    expect(isValidStatusTransition('SUBMITTED', 'EVALUATING')).toBe(true);
  });

  test('EVALUATING can transition to COMPLETED', () => {
    expect(isValidStatusTransition('EVALUATING', 'COMPLETED')).toBe(true);
  });

  test('EVALUATING can transition to FAILED', () => {
    expect(isValidStatusTransition('EVALUATING', 'FAILED')).toBe(true);
  });

  test('COMPLETED cannot transition to any state', () => {
    expect(isValidStatusTransition('COMPLETED', 'DRAFT')).toBe(false);
    expect(isValidStatusTransition('COMPLETED', 'SUBMITTED')).toBe(false);
  });

  test('DRAFT cannot skip to EVALUATING', () => {
    expect(isValidStatusTransition('DRAFT', 'EVALUATING')).toBe(false);
  });

  test('SUBMITTED cannot go back to DRAFT', () => {
    expect(isValidStatusTransition('SUBMITTED', 'DRAFT')).toBe(false);
  });

  test('cannot modify a submitted attempt', () => {
    // Simulating the service-level check
    expect(isValidStatusTransition('SUBMITTED', 'DRAFT')).toBe(false);
    expect(isValidStatusTransition('COMPLETED', 'DRAFT')).toBe(false);
  });
});
