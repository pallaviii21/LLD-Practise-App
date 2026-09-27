import { RuleBasedEvaluator } from '../evaluators/rule-based.evaluator';
import { Problem, Submission, EvaluationConfig, Difficulty, Requirement } from '../domain/types';

// Helper to create a minimal problem with specific config
function createProblem(overrides: Partial<Problem> = {}): Problem {
  const evaluationConfig: EvaluationConfig = {
    requiredConcepts: ['ParkingLot', 'Vehicle', 'ParkingSpot', 'Ticket'],
    rules: [
      {
        id: 'rule-1',
        name: 'Required Concepts',
        description: 'Check required concepts',
        type: 'REQUIRED_CONCEPTS',
        params: { concepts: ['ParkingLot', 'Vehicle', 'ParkingSpot', 'Ticket'] },
      },
      {
        id: 'rule-2',
        name: 'Unique Class Names',
        description: 'All class names unique',
        type: 'UNIQUE_CLASS_NAMES',
        params: {},
      },
      {
        id: 'rule-3',
        name: 'Valid Relationships',
        description: 'All relationships valid',
        type: 'VALID_RELATIONSHIPS',
        params: {},
      },
      {
        id: 'rule-4',
        name: 'Non-Empty Fields',
        description: 'Fields not empty',
        type: 'NON_EMPTY_FIELDS',
        params: {},
      },
    ],
    criteria: [],
    ...overrides.evaluationConfig,
  };

  return {
    id: 'test-problem',
    title: 'Test Problem',
    slug: 'test-problem',
    description: 'Test description',
    difficulty: 'MEDIUM' as Difficulty,
    requirements: [
      { id: 'r1', description: 'Handle parking', priority: 'MUST_HAVE' as const },
    ] as Requirement[],
    constraints: [],
    submissionConfig: {
      requiredConcepts: ['ParkingLot'],
      minClasses: 3,
      minRelationships: 2,
      requireExplanation: true,
    },
    evaluationConfig,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('RuleBasedEvaluator', () => {
  let evaluator: RuleBasedEvaluator;

  beforeEach(() => {
    evaluator = new RuleBasedEvaluator();
  });

  // --- Required Concepts ---

  test('should report all concepts present when submission includes them all', async () => {
    const problem = createProblem();
    const submission: Submission = {
      classes: [
        { name: 'ParkingLot', responsibilities: ['manage'], methods: ['park()'] },
        { name: 'Vehicle', responsibilities: ['represent'], methods: ['getType()'] },
        { name: 'ParkingSpot', responsibilities: ['hold vehicle'], methods: ['occupy()'] },
        { name: 'Ticket', responsibilities: ['track'], methods: ['getDetails()'] },
      ],
      relationships: [
        { source: 'ParkingLot', target: 'ParkingSpot', type: 'COMPOSITION' },
      ],
      explanation: 'A well-designed parking lot system',
    };

    const result = await evaluator.evaluate(problem, submission);
    expect(result.strengths).toContain(
      'All required domain concepts are present (ParkingLot, Vehicle, ParkingSpot, Ticket)'
    );
  });

  test('should report missing concepts', async () => {
    const problem = createProblem();
    const submission: Submission = {
      classes: [
        { name: 'ParkingLot', responsibilities: ['manage'], methods: ['park()'] },
        { name: 'Vehicle', responsibilities: ['represent'], methods: ['getType()'] },
      ],
      relationships: [],
      explanation: 'Partial design',
    };

    const result = await evaluator.evaluate(problem, submission);
    const missingFeedback = result.feedbackItems.find(
      (f) => f.message.includes('Missing concepts')
    );
    expect(missingFeedback).toBeDefined();
    expect(missingFeedback!.message).toContain('ParkingSpot');
    expect(missingFeedback!.message).toContain('Ticket');
  });

  // --- Unique Class Names ---

  test('should detect duplicate class names', async () => {
    const problem = createProblem();
    const submission: Submission = {
      classes: [
        { name: 'Vehicle', responsibilities: ['a'], methods: ['b'] },
        { name: 'Vehicle', responsibilities: ['c'], methods: ['d'] },
        { name: 'ParkingLot', responsibilities: ['e'], methods: ['f'] },
        { name: 'ParkingSpot', responsibilities: ['g'], methods: ['h'] },
        { name: 'Ticket', responsibilities: ['i'], methods: ['j'] },
      ],
      relationships: [],
      explanation: 'Design with duplicates',
    };

    const result = await evaluator.evaluate(problem, submission);
    const duplicateFeedback = result.feedbackItems.find(
      (f) => f.message.includes('Duplicate class names')
    );
    expect(duplicateFeedback).toBeDefined();
    expect(duplicateFeedback!.status).toBe('MISSING');
  });

  // --- Valid Relationships ---

  test('should detect invalid relationship source', async () => {
    const problem = createProblem();
    const submission: Submission = {
      classes: [
        { name: 'ParkingLot', responsibilities: ['a'], methods: ['b'] },
        { name: 'Vehicle', responsibilities: ['c'], methods: ['d'] },
        { name: 'ParkingSpot', responsibilities: ['e'], methods: ['f'] },
        { name: 'Ticket', responsibilities: ['g'], methods: ['h'] },
      ],
      relationships: [
        { source: 'NonExistent', target: 'Vehicle', type: 'ASSOCIATION' },
      ],
      explanation: 'Design with bad relationship',
    };

    const result = await evaluator.evaluate(problem, submission);
    const invalidFeedback = result.feedbackItems.find(
      (f) => f.message.includes('NonExistent')
    );
    expect(invalidFeedback).toBeDefined();
    expect(invalidFeedback!.severity).toBe('ERROR');
  });

  // --- Non-Empty Fields ---

  test('should warn about classes without responsibilities', async () => {
    const problem = createProblem();
    const submission: Submission = {
      classes: [
        { name: 'ParkingLot', responsibilities: [], methods: ['park()'] },
        { name: 'Vehicle', responsibilities: ['x'], methods: ['y'] },
        { name: 'ParkingSpot', responsibilities: ['z'], methods: ['w'] },
        { name: 'Ticket', responsibilities: ['a'], methods: ['b'] },
      ],
      relationships: [],
      explanation: 'Design where one class has no responsibilities',
    };

    const result = await evaluator.evaluate(problem, submission);
    const emptyResp = result.feedbackItems.find(
      (f) => f.message.includes('no responsibilities')
    );
    expect(emptyResp).toBeDefined();
    expect(emptyResp!.severity).toBe('WARNING');
  });

  test('should warn about short explanation', async () => {
    const problem = createProblem();
    const submission: Submission = {
      classes: [
        { name: 'ParkingLot', responsibilities: ['a'], methods: ['b'] },
        { name: 'Vehicle', responsibilities: ['c'], methods: ['d'] },
        { name: 'ParkingSpot', responsibilities: ['e'], methods: ['f'] },
        { name: 'Ticket', responsibilities: ['g'], methods: ['h'] },
      ],
      relationships: [],
      explanation: 'Short',
    };

    const result = await evaluator.evaluate(problem, submission);
    const shortExplanation = result.feedbackItems.find(
      (f) => f.message.includes('explanation')
    );
    expect(shortExplanation).toBeDefined();
  });

  // --- Problem-Specific Rule Tests ---

  // Rate Limiter: should flag missing strategy concept
  test('Rate Limiter: should detect missing strategy concept', async () => {
    const problem = createProblem({
      evaluationConfig: {
        requiredConcepts: ['RateLimiter', 'Request', 'Client', 'RateLimitStrategy'],
        rules: [
          {
            id: 'rl-rule-1',
            name: 'Required Concepts',
            description: 'Check required concepts',
            type: 'REQUIRED_CONCEPTS',
            params: { concepts: ['RateLimiter', 'Request', 'Client', 'RateLimitStrategy'] },
          },
        ],
        criteria: [],
      },
    });

    const submission: Submission = {
      classes: [
        { name: 'RateLimiter', responsibilities: ['limit requests'], methods: ['checkLimit()'] },
        { name: 'Request', responsibilities: ['hold data'], methods: ['getData()'] },
      ],
      relationships: [],
      explanation: 'A rate limiter design',
    };

    const result = await evaluator.evaluate(problem, submission);
    const missing = result.feedbackItems.find(
      (f) => f.message.includes('Missing concepts')
    );
    expect(missing).toBeDefined();
    expect(missing!.message).toContain('Client');
    expect(missing!.message).toContain('RateLimitStrategy');
  });

  // Parking Lot: should flag missing ParkingFloor
  test('Parking Lot: should detect missing ParkingFloor concept', async () => {
    const problem = createProblem({
      evaluationConfig: {
        requiredConcepts: ['ParkingLot', 'ParkingFloor', 'ParkingSpot', 'Vehicle', 'Ticket'],
        rules: [
          {
            id: 'pl-rule-1',
            name: 'Required Concepts',
            description: 'Check required concepts',
            type: 'REQUIRED_CONCEPTS',
            params: { concepts: ['ParkingLot', 'ParkingFloor', 'ParkingSpot', 'Vehicle', 'Ticket'] },
          },
        ],
        criteria: [],
      },
    });

    const submission: Submission = {
      classes: [
        { name: 'ParkingLot', responsibilities: ['manage'], methods: ['park()'] },
        { name: 'Vehicle', responsibilities: ['represent'], methods: ['getType()'] },
        { name: 'Ticket', responsibilities: ['track'], methods: ['getDetails()'] },
      ],
      relationships: [],
      explanation: 'Parking lot design without floors',
    };

    const result = await evaluator.evaluate(problem, submission);
    const missing = result.feedbackItems.find(
      (f) => f.message.includes('Missing concepts')
    );
    expect(missing).toBeDefined();
    expect(missing!.message).toContain('ParkingFloor');
    expect(missing!.message).toContain('ParkingSpot');
  });

  // BookMyShow: should flag missing Booking concept
  test('BookMyShow: should detect missing Booking concept', async () => {
    const problem = createProblem({
      evaluationConfig: {
        requiredConcepts: ['User', 'Movie', 'Theatre', 'Screen', 'Show', 'Seat', 'Booking'],
        rules: [
          {
            id: 'bms-rule-1',
            name: 'Required Concepts',
            description: 'Check required concepts',
            type: 'REQUIRED_CONCEPTS',
            params: { concepts: ['User', 'Movie', 'Theatre', 'Screen', 'Show', 'Seat', 'Booking'] },
          },
        ],
        criteria: [],
      },
    });

    const submission: Submission = {
      classes: [
        { name: 'User', responsibilities: ['browse'], methods: ['login()'] },
        { name: 'Movie', responsibilities: ['show info'], methods: ['getDetails()'] },
        { name: 'Theatre', responsibilities: ['hold screens'], methods: ['getScreens()'] },
        { name: 'Seat', responsibilities: ['hold position'], methods: ['isAvailable()'] },
      ],
      relationships: [],
      explanation: 'BookMyShow design without booking',
    };

    const result = await evaluator.evaluate(problem, submission);
    const missing = result.feedbackItems.find(
      (f) => f.message.includes('Missing concepts')
    );
    expect(missing).toBeDefined();
    expect(missing!.message).toContain('Booking');
  });

  // Vending Machine: should flag missing State concept
  test('Vending Machine: should detect missing State concept', async () => {
    const problem = createProblem({
      evaluationConfig: {
        requiredConcepts: ['VendingMachine', 'Product', 'Inventory', 'Payment', 'State'],
        rules: [
          {
            id: 'vm-rule-1',
            name: 'Required Concepts',
            description: 'Check required concepts',
            type: 'REQUIRED_CONCEPTS',
            params: { concepts: ['VendingMachine', 'Product', 'Inventory', 'Payment', 'State'] },
          },
        ],
        criteria: [],
      },
    });

    const submission: Submission = {
      classes: [
        { name: 'VendingMachine', responsibilities: ['dispense'], methods: ['selectProduct()'] },
        { name: 'Product', responsibilities: ['hold info'], methods: ['getPrice()'] },
      ],
      relationships: [],
      explanation: 'Vending machine without state management',
    };

    const result = await evaluator.evaluate(problem, submission);
    const missing = result.feedbackItems.find(
      (f) => f.message.includes('Missing concepts')
    );
    expect(missing).toBeDefined();
    expect(missing!.message).toContain('Inventory');
    expect(missing!.message).toContain('Payment');
    expect(missing!.message).toContain('State');
  });
});
