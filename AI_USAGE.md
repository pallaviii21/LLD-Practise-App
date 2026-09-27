# AI Usage Documentation

This document records meaningful AI-assisted decisions made during the development of the LLD Practice Platform.

---

## 1. Evaluation Architecture Pattern

**What AI suggested:** Use a Strategy pattern with a pipeline of evaluators, where each evaluator is a plugin that can be composed at runtime.

**What was accepted:** The evaluator interface pattern and the `EvaluationService` accepting a list of evaluators via constructor injection. This enables adding new evaluators without modifying the service.

**What was rejected:** AI suggested using event-driven evaluation with a message bus between evaluators. This was rejected because it adds unnecessary complexity for an MVP. Sequential evaluation is simpler and sufficient.

**Why:** The pipeline approach provides extensibility without the overhead of event systems. For a 2-day MVP, simplicity wins.

---

## 2. AI Prompt Structure

**What AI suggested:** Include a detailed rubric in the prompt with explicit scoring guidelines, ask the AI to score each criterion on a 1-10 scale, and include example good/bad solutions.

**What was accepted:** The structured prompt format with problem description, requirements, submission details, and evaluation criteria. Also accepted the explicit instruction that "there can be multiple valid LLD solutions."

**What was rejected:** Numeric scoring (1-10) was rejected in favor of categorical status (GOOD / NEEDS_IMPROVEMENT / MISSING). Example solutions were not included in the prompt to avoid biasing the AI toward specific patterns.

**Why:** Categorical feedback is more actionable than numeric scores. Including example solutions would contradict the principle that multiple valid designs should be accepted.

---

## 3. Deterministic Rule Types

**What AI suggested:** Build a full rule engine with composable predicates, allowing rules like `AND(hasClass("ParkingLot"), hasMethod("ParkingLot", "parkVehicle"))`.

**What was accepted:** The typed rule system (REQUIRED_CONCEPTS, UNIQUE_CLASS_NAMES, VALID_RELATIONSHIPS, etc.) where each rule type is a generic function that reads parameters from the problem configuration.

**What was rejected:** The composable predicate engine was too complex for the MVP. Individual rule types are simpler to understand, test, and debug.

**Why:** Each rule type handles one concern clearly. Composable rules could be added later as a `COMPOSITE_RULE` type without changing the architecture.

---

## 4. Database Schema Design

**What AI suggested:** Fully normalized schema with separate tables for Requirements, EvaluationCriteria, ClassDefinitions, Relationships, FeedbackItems, etc.

**What was accepted:** Using PostgreSQL JSON columns for submission, evaluation, and configuration data. Two tables (problems, attempts) keep the schema simple.

**What was rejected:** Full normalization was rejected because it would require complex joins and migrations for data that is always read/written as a unit. For this MVP, JSON columns provide the right balance of simplicity and queryability.

**Why:** Over-normalization would triple the table count and complicate every query without meaningful benefit for a single-user MVP. The spec explicitly recommends JSON fields.

---

## 5. Frontend Structured Editor

**What AI suggested:** Build a drag-and-drop UML diagram editor with a visual canvas, allowing users to draw classes and connections visually.

**What was accepted:** A form-based structured editor with sections for classes, responsibilities, methods, relationships, and explanation. This provides structure without the complexity of a visual editor.

**What was rejected:** The visual UML editor was rejected due to the significant engineering effort required (canvas rendering, layout algorithms, connection routing, state management) within a 2-day timeline.

**Why:** The form-based editor achieves the core goal — structured, evaluable submissions — with a fraction of the development effort. A UML editor could be a future enhancement.
