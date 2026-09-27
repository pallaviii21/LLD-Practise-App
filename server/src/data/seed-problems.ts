import {
  Problem,
  Difficulty,
  Requirement,
  SubmissionConfig,
  EvaluationConfig,
  EvaluationRule,
  EvaluationCriterion,
} from '../domain/types';

type SeedProblem = Omit<Problem, 'createdAt' | 'updatedAt'>;

// ============================================================
// 1. RATE LIMITER
// ============================================================

const rateLimiter: SeedProblem = {
  id: 'rate-limiter',
  title: 'Rate Limiter',
  slug: 'rate-limiter',
  description: `Design a Rate Limiter system that controls the rate of requests a client can make to an API or service.

Your rate limiter should be able to:
- Track request counts per client/user
- Enforce configurable rate limits (e.g., 100 requests per minute)
- Handle requests that exceed the limit by rejecting them gracefully
- Support different rate limiting strategies/algorithms
- Consider thread safety and concurrent request handling

Think about how real-world systems like API gateways, load balancers, and cloud services implement rate limiting. Your design should be flexible enough to support different algorithms while maintaining a clean, extensible architecture.

Consider the trade-offs between different approaches: memory usage, accuracy, burst handling, and distributed scenarios.`,
  difficulty: 'MEDIUM' as Difficulty,
  requirements: [
    { id: 'rl-req-1', description: 'Limit the number of requests a client/user can make within a time window', priority: 'MUST_HAVE' as const },
    { id: 'rl-req-2', description: 'Support configurable rate limits (requests per time unit)', priority: 'MUST_HAVE' as const },
    { id: 'rl-req-3', description: 'Define a clear time window mechanism (fixed, sliding, token-based, etc.)', priority: 'MUST_HAVE' as const },
    { id: 'rl-req-4', description: 'Handle rejected requests with appropriate response', priority: 'MUST_HAVE' as const },
    { id: 'rl-req-5', description: 'Allow different rate limiting algorithms/strategies to be plugged in', priority: 'MUST_HAVE' as const },
    { id: 'rl-req-6', description: 'Consider concurrent request handling and thread safety', priority: 'SHOULD_HAVE' as const },
    { id: 'rl-req-7', description: 'Explain trade-offs of the chosen approach', priority: 'SHOULD_HAVE' as const },
    { id: 'rl-req-8', description: 'Consider how configuration could be changed at runtime', priority: 'NICE_TO_HAVE' as const },
  ] as Requirement[],
  constraints: [
    'Focus on the core rate limiting domain — do not design the entire API gateway',
    'You may choose any rate limiting algorithm (Fixed Window, Sliding Window, Token Bucket, Leaky Bucket, etc.)',
    'Do not implement actual networking or HTTP handling',
    'Consider how the design would work with multiple clients',
  ],
  submissionConfig: {
    requiredConcepts: ['RateLimiter', 'Request', 'Client', 'RateLimitStrategy'],
    minClasses: 3,
    minRelationships: 2,
    requireExplanation: true,
  } as SubmissionConfig,
  evaluationConfig: {
    requiredConcepts: ['RateLimiter', 'Request', 'Client', 'RateLimitStrategy'],
    rules: [
      { id: 'rl-rule-1', name: 'Required Concepts', description: 'Check that all required domain concepts are present', type: 'REQUIRED_CONCEPTS' as const, params: { concepts: ['RateLimiter', 'Request', 'Client', 'RateLimitStrategy'] } },
      { id: 'rl-rule-2', name: 'Unique Class Names', description: 'All class names must be unique', type: 'UNIQUE_CLASS_NAMES' as const, params: {} },
      { id: 'rl-rule-3', name: 'Valid Relationships', description: 'All relationship sources and targets must exist', type: 'VALID_RELATIONSHIPS' as const, params: {} },
      { id: 'rl-rule-4', name: 'Non-Empty Fields', description: 'Required fields must not be empty', type: 'NON_EMPTY_FIELDS' as const, params: {} },
      { id: 'rl-rule-5', name: 'Strategy Abstraction', description: 'Check that rate limiting strategy is modeled as an abstraction', type: 'CONCEPT_RESPONSIBILITIES' as const, params: { concept: 'RateLimitStrategy', expectedResponsibilities: ['algorithm', 'limit', 'check', 'allow'] } },
    ] as EvaluationRule[],
    criteria: [
      { id: 'rl-crit-1', name: 'Algorithm Choice', description: 'The design should clearly define or allow for a rate limiting algorithm', evaluationType: 'AI' as const, weight: 20 },
      { id: 'rl-crit-2', name: 'Concurrency Considerations', description: 'The design should address concurrent request handling', evaluationType: 'AI' as const, weight: 20 },
      { id: 'rl-crit-3', name: 'Responsibility Distribution', description: 'Responsibilities should be well-distributed across classes', evaluationType: 'AI' as const, weight: 20 },
      { id: 'rl-crit-4', name: 'Extensibility', description: 'The design should be extensible to support different strategies', evaluationType: 'AI' as const, weight: 20 },
      { id: 'rl-crit-5', name: 'Edge Cases', description: 'The design should handle edge cases like burst traffic, limit exceeded, etc.', evaluationType: 'AI' as const, weight: 10 },
      { id: 'rl-crit-6', name: 'Requirement Coverage', description: 'The design should address the stated requirements', evaluationType: 'AI' as const, weight: 10 },
    ] as EvaluationCriterion[],
  } as EvaluationConfig,
};

// ============================================================
// 2. PARKING LOT
// ============================================================

const parkingLot: SeedProblem = {
  id: 'parking-lot',
  title: 'Parking Lot',
  slug: 'parking-lot',
  description: `Design a Parking Lot management system that can handle vehicle entry, parking allocation, and exit operations.

Your system should model a multi-floor parking lot with different types of parking spots for different vehicle types. When a vehicle arrives, the system should find an appropriate spot, generate a ticket, and handle the exit process including fee calculation.

Think about how real parking garages operate — they have multiple floors, different spot sizes, entry/exit gates, and ticket systems. Your design should be clean enough that a new parking allocation strategy (e.g., nearest-to-elevator, spread-across-floors) could be added without changing core classes.

Consider edge cases like: what happens when the lot is full? What if a specific floor is full but others have space? How do you handle different vehicle sizes?`,
  difficulty: 'MEDIUM' as Difficulty,
  requirements: [
    { id: 'pl-req-1', description: 'Support multiple parking floors', priority: 'MUST_HAVE' as const },
    { id: 'pl-req-2', description: 'Support multiple parking spots per floor', priority: 'MUST_HAVE' as const },
    { id: 'pl-req-3', description: 'Support different vehicle types (motorcycle, car, truck/bus)', priority: 'MUST_HAVE' as const },
    { id: 'pl-req-4', description: 'Handle vehicle entry and assign an appropriate spot', priority: 'MUST_HAVE' as const },
    { id: 'pl-req-5', description: 'Handle vehicle exit and free the spot', priority: 'MUST_HAVE' as const },
    { id: 'pl-req-6', description: 'Generate a parking ticket on entry', priority: 'MUST_HAVE' as const },
    { id: 'pl-req-7', description: 'Find an appropriate parking spot based on vehicle type', priority: 'MUST_HAVE' as const },
    { id: 'pl-req-8', description: 'Handle parking lot full scenario', priority: 'MUST_HAVE' as const },
    { id: 'pl-req-9', description: 'Design should allow different parking allocation strategies', priority: 'SHOULD_HAVE' as const },
    { id: 'pl-req-10', description: 'Consider fee calculation based on duration', priority: 'NICE_TO_HAVE' as const },
  ] as Requirement[],
  constraints: [
    'Focus on the parking lot domain — do not build payment processing',
    'You may assume a single entry/exit gate for simplicity',
    'Do not implement actual persistence or database logic',
    'Vehicle types can be simplified to a small set',
  ],
  submissionConfig: {
    requiredConcepts: ['ParkingLot', 'ParkingFloor', 'ParkingSpot', 'Vehicle', 'Ticket'],
    minClasses: 4,
    minRelationships: 3,
    requireExplanation: true,
  } as SubmissionConfig,
  evaluationConfig: {
    requiredConcepts: ['ParkingLot', 'ParkingFloor', 'ParkingSpot', 'Vehicle', 'Ticket'],
    rules: [
      { id: 'pl-rule-1', name: 'Required Concepts', description: 'Check that all required domain concepts are present', type: 'REQUIRED_CONCEPTS' as const, params: { concepts: ['ParkingLot', 'ParkingFloor', 'ParkingSpot', 'Vehicle', 'Ticket'] } },
      { id: 'pl-rule-2', name: 'Unique Class Names', description: 'All class names must be unique', type: 'UNIQUE_CLASS_NAMES' as const, params: {} },
      { id: 'pl-rule-3', name: 'Valid Relationships', description: 'All relationship sources and targets must exist', type: 'VALID_RELATIONSHIPS' as const, params: {} },
      { id: 'pl-rule-4', name: 'Non-Empty Fields', description: 'Required fields must not be empty', type: 'NON_EMPTY_FIELDS' as const, params: {} },
      { id: 'pl-rule-5', name: 'Vehicle-Spot Modeling', description: 'Check that vehicle and spot types are properly modeled', type: 'CONCEPT_RESPONSIBILITIES' as const, params: { concept: 'ParkingSpot', expectedResponsibilities: ['vehicle', 'type', 'available', 'occupy', 'free'] } },
    ] as EvaluationRule[],
    criteria: [
      { id: 'pl-crit-1', name: 'Responsibility Distribution', description: 'Responsibilities should be well-distributed across classes', evaluationType: 'AI' as const, weight: 20 },
      { id: 'pl-crit-2', name: 'Vehicle/Spot Modeling', description: 'Vehicle types and spot types should be properly modeled', evaluationType: 'AI' as const, weight: 20 },
      { id: 'pl-crit-3', name: 'Parking Allocation Strategy', description: 'The design should support flexible parking allocation strategies', evaluationType: 'AI' as const, weight: 20 },
      { id: 'pl-crit-4', name: 'Extensibility', description: 'The design should be extensible for new vehicle types, floors, strategies', evaluationType: 'AI' as const, weight: 15 },
      { id: 'pl-crit-5', name: 'Requirement Coverage', description: 'The design should address the stated requirements', evaluationType: 'AI' as const, weight: 15 },
      { id: 'pl-crit-6', name: 'Edge Cases', description: 'Handles lot full, floor full, invalid vehicle type, etc.', evaluationType: 'AI' as const, weight: 10 },
    ] as EvaluationCriterion[],
  } as EvaluationConfig,
};

// ============================================================
// 3. BOOKMYSHOW
// ============================================================

const bookMyShow: SeedProblem = {
  id: 'bookmyshow',
  title: 'BookMyShow',
  slug: 'bookmyshow',
  description: `Design a movie ticket booking system similar to BookMyShow.

Your system should allow users to browse movies, view available shows across theatres and screens, select seats, and book tickets. The design must handle the critical challenge of concurrent booking — two users should not be able to successfully book the same seat for the same show.

Think about the real-world flow: a user searches for a movie, sees which theatres are showing it, picks a showtime, selects seats from a seat map, and completes the booking. During this process, selected seats should be temporarily locked so other users can't book them.

Consider the full booking lifecycle: browsing → selecting → locking → confirming → or cancelling. What happens if a user abandons their selection? How do locked seats get released?`,
  difficulty: 'HARD' as Difficulty,
  requirements: [
    { id: 'bms-req-1', description: 'Users can browse available movies', priority: 'MUST_HAVE' as const },
    { id: 'bms-req-2', description: 'Movies have shows (specific time slots)', priority: 'MUST_HAVE' as const },
    { id: 'bms-req-3', description: 'Shows belong to screens within theatres', priority: 'MUST_HAVE' as const },
    { id: 'bms-req-4', description: 'Users can select seats for a show', priority: 'MUST_HAVE' as const },
    { id: 'bms-req-5', description: 'Users can book selected seats', priority: 'MUST_HAVE' as const },
    { id: 'bms-req-6', description: 'The same seat cannot be successfully booked by two users', priority: 'MUST_HAVE' as const },
    { id: 'bms-req-7', description: 'Consider temporary seat locking during selection', priority: 'SHOULD_HAVE' as const },
    { id: 'bms-req-8', description: 'Support booking cancellation', priority: 'SHOULD_HAVE' as const },
    { id: 'bms-req-9', description: 'Support multiple theatres and screens', priority: 'MUST_HAVE' as const },
    { id: 'bms-req-10', description: 'Consider seat lock expiry for abandoned selections', priority: 'NICE_TO_HAVE' as const },
  ] as Requirement[],
  constraints: [
    'Focus on the booking domain — do not design payment processing or user authentication',
    'Do not implement actual concurrency primitives — describe how concurrency would be handled',
    'You may simplify the seat layout (rows and columns)',
    'Do not design the movie catalog management system',
  ],
  submissionConfig: {
    requiredConcepts: ['User', 'Movie', 'Theatre', 'Screen', 'Show', 'Seat', 'Booking'],
    minClasses: 5,
    minRelationships: 4,
    requireExplanation: true,
  } as SubmissionConfig,
  evaluationConfig: {
    requiredConcepts: ['User', 'Movie', 'Theatre', 'Screen', 'Show', 'Seat', 'Booking'],
    rules: [
      { id: 'bms-rule-1', name: 'Required Concepts', description: 'Check that all required domain concepts are present', type: 'REQUIRED_CONCEPTS' as const, params: { concepts: ['User', 'Movie', 'Theatre', 'Screen', 'Show', 'Seat', 'Booking'] } },
      { id: 'bms-rule-2', name: 'Unique Class Names', description: 'All class names must be unique', type: 'UNIQUE_CLASS_NAMES' as const, params: {} },
      { id: 'bms-rule-3', name: 'Valid Relationships', description: 'All relationship sources and targets must exist', type: 'VALID_RELATIONSHIPS' as const, params: {} },
      { id: 'bms-rule-4', name: 'Non-Empty Fields', description: 'Required fields must not be empty', type: 'NON_EMPTY_FIELDS' as const, params: {} },
      { id: 'bms-rule-5', name: 'Booking Lifecycle', description: 'Check that Booking has lifecycle-related responsibilities', type: 'CONCEPT_RESPONSIBILITIES' as const, params: { concept: 'Booking', expectedResponsibilities: ['seat', 'user', 'show', 'status', 'confirm', 'cancel'] } },
    ] as EvaluationRule[],
    criteria: [
      { id: 'bms-crit-1', name: 'Entity Modeling', description: 'Entities should be well-defined with clear responsibilities', evaluationType: 'AI' as const, weight: 15 },
      { id: 'bms-crit-2', name: 'Responsibility Distribution', description: 'Responsibilities should be properly distributed', evaluationType: 'AI' as const, weight: 15 },
      { id: 'bms-crit-3', name: 'Seat Availability', description: 'The design should handle seat availability checking', evaluationType: 'AI' as const, weight: 15 },
      { id: 'bms-crit-4', name: 'Concurrent Booking', description: 'The design should address concurrent booking scenarios', evaluationType: 'AI' as const, weight: 15 },
      { id: 'bms-crit-5', name: 'Seat Locking', description: 'Temporary seat locking should be considered in the design', evaluationType: 'AI' as const, weight: 15 },
      { id: 'bms-crit-6', name: 'Booking Lifecycle', description: 'The booking lifecycle should be clearly modeled', evaluationType: 'AI' as const, weight: 10 },
      { id: 'bms-crit-7', name: 'Extensibility', description: 'The design should be extensible', evaluationType: 'AI' as const, weight: 10 },
      { id: 'bms-crit-8', name: 'Edge Cases', description: 'Edge cases like lock expiry, double booking, full show', evaluationType: 'AI' as const, weight: 5 },
    ] as EvaluationCriterion[],
  } as EvaluationConfig,
};

// ============================================================
// 4. VENDING MACHINE
// ============================================================

const vendingMachine: SeedProblem = {
  id: 'vending-machine',
  title: 'Vending Machine',
  slug: 'vending-machine',
  description: `Design a Vending Machine system that handles product selection, payment, and dispensing.

Your vending machine should manage an inventory of products, accept payments, dispense items, and handle change. Think about the states a vending machine goes through during a transaction: idle → product selected → payment received → dispensing → returning change → back to idle.

The design should handle various scenarios: What if the product is out of stock? What if the payment is insufficient? What if the user cancels mid-transaction? What if the machine can't make exact change?

A well-designed vending machine should clearly separate concerns: inventory management, payment processing, state management, and product dispensing should not be tangled together.`,
  difficulty: 'EASY' as Difficulty,
  requirements: [
    { id: 'vm-req-1', description: 'Display available products with prices', priority: 'MUST_HAVE' as const },
    { id: 'vm-req-2', description: 'Allow user to select a product', priority: 'MUST_HAVE' as const },
    { id: 'vm-req-3', description: 'Check product inventory/availability', priority: 'MUST_HAVE' as const },
    { id: 'vm-req-4', description: 'Accept payment (coins/notes)', priority: 'MUST_HAVE' as const },
    { id: 'vm-req-5', description: 'Handle insufficient payment', priority: 'MUST_HAVE' as const },
    { id: 'vm-req-6', description: 'Dispense the selected product', priority: 'MUST_HAVE' as const },
    { id: 'vm-req-7', description: 'Return change when applicable', priority: 'MUST_HAVE' as const },
    { id: 'vm-req-8', description: 'Handle out-of-stock products', priority: 'MUST_HAVE' as const },
    { id: 'vm-req-9', description: 'Support transaction cancellation and refund', priority: 'SHOULD_HAVE' as const },
    { id: 'vm-req-10', description: 'Return to idle state after transaction completes', priority: 'MUST_HAVE' as const },
  ] as Requirement[],
  constraints: [
    'Focus on the vending machine domain — do not build a retail POS system',
    'You may simplify payment to a few denominations',
    'State management is important but a State Pattern is not mandatory',
    'Do not implement actual hardware interaction',
  ],
  submissionConfig: {
    requiredConcepts: ['VendingMachine', 'Product', 'Inventory', 'Payment', 'State'],
    minClasses: 3,
    minRelationships: 2,
    requireExplanation: true,
  } as SubmissionConfig,
  evaluationConfig: {
    requiredConcepts: ['VendingMachine', 'Product', 'Inventory', 'Payment', 'State'],
    rules: [
      { id: 'vm-rule-1', name: 'Required Concepts', description: 'Check that all required domain concepts are present', type: 'REQUIRED_CONCEPTS' as const, params: { concepts: ['VendingMachine', 'Product', 'Inventory', 'Payment', 'State'] } },
      { id: 'vm-rule-2', name: 'Unique Class Names', description: 'All class names must be unique', type: 'UNIQUE_CLASS_NAMES' as const, params: {} },
      { id: 'vm-rule-3', name: 'Valid Relationships', description: 'All relationship sources and targets must exist', type: 'VALID_RELATIONSHIPS' as const, params: {} },
      { id: 'vm-rule-4', name: 'Non-Empty Fields', description: 'Required fields must not be empty', type: 'NON_EMPTY_FIELDS' as const, params: {} },
      { id: 'vm-rule-5', name: 'State Management', description: 'Check that state management is modeled', type: 'CONCEPT_RESPONSIBILITIES' as const, params: { concept: 'State', expectedResponsibilities: ['idle', 'select', 'payment', 'dispense', 'transition'] } },
    ] as EvaluationRule[],
    criteria: [
      { id: 'vm-crit-1', name: 'State Management', description: 'States and transitions should be clearly defined', evaluationType: 'AI' as const, weight: 25 },
      { id: 'vm-crit-2', name: 'State Transitions', description: 'Valid state transitions should be modeled', evaluationType: 'AI' as const, weight: 20 },
      { id: 'vm-crit-3', name: 'Inventory Responsibility', description: 'Inventory management should be a clear responsibility', evaluationType: 'AI' as const, weight: 15 },
      { id: 'vm-crit-4', name: 'Payment Handling', description: 'Payment acceptance, validation, and change should be handled', evaluationType: 'AI' as const, weight: 15 },
      { id: 'vm-crit-5', name: 'Responsibility Distribution', description: 'Responsibilities should be well-distributed', evaluationType: 'AI' as const, weight: 10 },
      { id: 'vm-crit-6', name: 'Extensibility', description: 'Design should allow adding new products, payment methods', evaluationType: 'AI' as const, weight: 10 },
      { id: 'vm-crit-7', name: 'Edge Cases', description: 'Handles out-of-stock, insufficient payment, cancellation', evaluationType: 'AI' as const, weight: 5 },
    ] as EvaluationCriterion[],
  } as EvaluationConfig,
};

export const seedProblems: SeedProblem[] = [
  rateLimiter,
  parkingLot,
  bookMyShow,
  vendingMachine,
];
