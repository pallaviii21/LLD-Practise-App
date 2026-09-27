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



## Key Design Decisions

- **Structured submission over free-form text**: Makes evaluation possible and consistent
- **No UML editor**: Reduces complexity, avoids drag-and-drop pitfalls
- **Multiple valid solutions accepted**: AI is instructed to evaluate requirements coverage, not match a canonical answer
- **Deterministic + AI evaluation**: Ensures useful feedback even without an AI API key
- **Problem-driven evaluation config**: Each problem defines its own rules and criteria

---

# Problem & Product Direction

Based on research into existing LLD (Low-Level Design) practice platforms, interview tools, and community discussions, the following details the product direction and how this platform addresses the core needs of learners.

## 1. Practice Workflow
**How does the learner start, work, submit, and retry?**

- **Start:** The learner browses a curated list of classic LLD problems (e.g., Parking Lot, Elevator System, Vending Machine). Problems are categorized by difficulty and clearly outline the functional requirements, constraints, and evaluation criteria.
- **Work:** Instead of writing raw code or drawing on a whiteboard, the learner uses a guided interface to define the system's architecture. They iteratively add classes, define responsibilities and methods, and establish relationships (e.g., inheritance, composition) between them.
- **Submit:** Once the design is mapped out, the learner submits the structured data for evaluation.
- **Retry:** After reviewing the feedback, the learner can immediately start a new attempt on the same problem, applying the suggestions to improve their design. Past attempts are saved in their History for reference.

## 2. Submission Format
**Is the solution text, code, UML, or something else?**

The submission format is **Structured Data (Form-based)**. The learner inputs Classes (Name, Responsibilities, Methods) and Relationships (Source, Target, Type).

**Why is the submission format like this?**
- **Why not pure code?** Writing compilable code takes too much time and shifts the focus away from architecture to syntax and implementation details.
- **Why not a UML editor?** Building and using a drag-and-drop UML diagrammer is highly complex. Learners often waste time aligning boxes and drawing arrows rather than focusing on the actual design principles.
- **Why structured forms?** It strikes the perfect balance. It forces the learner to think in terms of objects, responsibilities, and relationships without the overhead of drawing or coding. Furthermore, structured data is much easier to feed into an evaluation engine (both deterministic and AI) for highly accurate feedback.

## 3. Feedback Mechanism
**Is there a score, comments, rubric, reference solution, or AI feedback?**

The platform uses a **hybrid feedback model**:
- **Rubric-Based:** Every problem has a specific set of evaluation criteria (e.g., "Use of Strategy Pattern", "Separation of Concerns").
- **AI Feedback & Comments:** An LLM evaluates the structured submission against the rubric. It assigns a status (`GOOD`, `NEEDS_IMPROVEMENT`, `MISSING`) to each criterion and provides specific, constructive written feedback and actionable suggestions.
- **Deterministic Checks:** Hard rules (e.g., "Must have at least 3 classes") are checked deterministically to ensure baseline validity.
- **Reference Solutions:** Rather than forcing a single "canonical" solution, the AI is instructed to accept multiple valid architectural approaches, matching the reality of software engineering.

## 4. Learning Loop
**Does the product help the learner identify recurring weaknesses?**

Currently, the learning loop is driven by the **History** feature, which allows learners to look back at past attempts and see how their designs scored against specific rubrics.

**Future Direction for the Learning Loop:** 
To better identify recurring weaknesses, the platform could track criterion failures across *multiple different problems*. For example, if a learner consistently receives `NEEDS_IMPROVEMENT` on "Open-Closed Principle" criteria across three different problems, the platform could flag this as a global weakness and recommend targeted reading or specific problems to practice that concept.

## 5. Gaps & Simplifications
**What would you change or simplify?**

- **Simplify the Interface:** The current form-based entry for relationships can become tedious for very large systems. We could simplify this by parsing a custom, lightweight DSL (Domain Specific Language) like Mermaid.js text, allowing power users to type out relationships quickly while still providing structured data to the backend.
- **Gap - Missing Analytics:** As mentioned above, the platform lacks a global analytics dashboard for the learner to visualize their progress and recurring conceptual gaps.
- **Gap - Collaborative Practice:** Real interviews are interactive. A future simplification or pivot could involve a chatbot acting as the "interviewer," pushing back on design decisions in real-time before the final submission is graded.
