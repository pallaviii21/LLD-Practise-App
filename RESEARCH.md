# Research: LLD Practice for Engineering Interviews

## The Problem

Low-Level Design (LLD) is a core skill evaluated in software engineering interviews. Candidates are expected to:

- Model real-world systems using OOP principles
- Distribute responsibilities across well-defined classes
- Define clear relationships (inheritance, composition, etc.)
- Handle edge cases and concurrency concerns
- Explain design trade-offs

### Current Learning Landscape

1. **YouTube / Blog Tutorials**: Walk through canonical solutions but don't let learners practice or receive feedback.
2. **LeetCode / HackerRank**: Focus on algorithmic coding, not design.
3. **System Design Platforms (e.g., Educative, Grokking)**: Focus on High-Level Design (HLD), not LLD class-level design.
4. **Whiteboards in interviews**: The only place candidates actually practice LLD — but with no feedback loop.

### Gaps Identified

- **No structured practice tool** for LLD specifically
- **No feedback mechanism** that evaluates design quality, not just correctness
- **No multi-attempt improvement loop** — learn-by-doing is missing
- **Canonical solutions are presented as "the answer"**, discouraging exploration of valid alternatives

## Product Direction

Build a focused practice tool that:

1. Provides interview-style LLD problems
2. Accepts structured design submissions (not free-form text)
3. Evaluates against problem-specific criteria using deterministic rules + AI
4. Provides explainable, constructive feedback
5. Allows retry and comparison across attempts
6. Recognizes multiple valid approaches to the same problem

### Why Not a Full LMS?

The goal is a tight practice loop, not a content delivery platform. A learner should be able to:

1. Pick a problem (2 min)
2. Design a solution (20-30 min)
3. Submit and receive feedback (1 min)
4. Iterate (10-15 min per retry)

This is closer to a coding challenge platform than a course platform.

## Key Design Decisions

- **Structured submission over free-form text**: Makes evaluation possible and consistent
- **No UML editor**: Reduces complexity, avoids drag-and-drop pitfalls
- **Multiple valid solutions accepted**: AI is instructed to evaluate requirements coverage, not match a canonical answer
- **Deterministic + AI evaluation**: Ensures useful feedback even without an AI API key
- **Problem-driven evaluation config**: Each problem defines its own rules and criteria
