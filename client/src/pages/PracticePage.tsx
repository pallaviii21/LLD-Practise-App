import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Attempt,
  Problem,
  Submission,
  ClassDefinition,
  Relationship,
  RelationshipType,
} from '../types';
import {
  getAttempt,
  getProblem,
  saveDraft as saveDraftApi,
  submitAttempt as submitAttemptApi,
} from '../services/api';

const EMPTY_SUBMISSION: Submission = {
  classes: [],
  relationships: [],
  explanation: '',
};

export function PracticePage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [submission, setSubmission] = useState<Submission>(EMPTY_SUBMISSION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    if (!attemptId) return;
    Promise.all([getAttempt(attemptId)])
      .then(async ([attemptData]) => {
        setAttempt(attemptData);
        if (attemptData.submission) {
          setSubmission(attemptData.submission);
        }
        const problemData = await getProblem(attemptData.problemId);
        setProblem(problemData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const handleSaveDraft = useCallback(async () => {
    if (!attemptId) return;
    setSaving(true);
    setSaveStatus('');
    try {
      const updated = await saveDraftApi(attemptId, submission);
      setAttempt(updated);
      setSaveStatus('Draft saved ✓');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, [attemptId, submission]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId) return;
    
    // Validate before submission
    if (submission.classes.length === 0) {
      setError('Add at least one class before submitting');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // Save draft first
      await saveDraftApi(attemptId, submission);
      // Then submit
      const result = await submitAttemptApi(attemptId);
      setAttempt(result);
      navigate(`/evaluation/${attemptId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, submission, navigate]);

  // --- Class management ---
  const addClass = () => {
    setSubmission((prev) => ({
      ...prev,
      classes: [
        ...prev.classes,
        { name: '', responsibilities: [''], methods: [''] },
      ],
    }));
  };

  const updateClass = (index: number, cls: ClassDefinition) => {
    setSubmission((prev) => ({
      ...prev,
      classes: prev.classes.map((c, i) => (i === index ? cls : c)),
    }));
  };

  const removeClass = (index: number) => {
    setSubmission((prev) => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== index),
    }));
  };

  // --- Relationship management ---
  const addRelationship = () => {
    setSubmission((prev) => ({
      ...prev,
      relationships: [
        ...prev.relationships,
        { source: '', target: '', type: 'ASSOCIATION' as RelationshipType },
      ],
    }));
  };

  const updateRelationship = (index: number, rel: Relationship) => {
    setSubmission((prev) => ({
      ...prev,
      relationships: prev.relationships.map((r, i) =>
        i === index ? rel : r
      ),
    }));
  };

  const removeRelationship = (index: number) => {
    setSubmission((prev) => ({
      ...prev,
      relationships: prev.relationships.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!attempt || !problem) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-[var(--color-error)]">{error || 'Not found'}</p>
      </div>
    );
  }

  if (attempt.status !== 'DRAFT') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-semibold mb-4">
          This attempt has already been submitted
        </h2>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/evaluation/${attemptId}`)}
            className="px-6 py-2.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#1a1a1a] font-bold rounded-lg cursor-pointer"
          >
            View Evaluation
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg font-medium cursor-pointer"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  const classNames = submission.classes
    .map((c) => c.name)
    .filter((n) => n.trim());

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(`/problems/${problem.id}`)}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-sm mb-1 cursor-pointer bg-transparent border-none"
          >
            ← {problem.title}
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Design Your Solution
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && (
            <span className="text-sm text-emerald-400">{saveStatus}</span>
          )}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-8 py-3 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)] rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#1a1a1a] rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Evaluating...' : 'Submit for Evaluation'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)]/30 rounded-lg p-4 mb-6">
          <p className="text-[var(--color-error)] text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-xs text-[var(--color-text-muted)] mt-1 cursor-pointer bg-transparent border-none underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main layout: Problem + Editor side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-[480px_1fr] gap-8">
        {/* Left: Problem Reference */}
        <div className="space-y-8 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-2">
          
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-1">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 uppercase tracking-wider pb-2 border-b border-[var(--color-border)]">
              Problem Statement
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line leading-relaxed">
              {problem.description}
            </p>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-1">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 uppercase tracking-wider pb-2 border-b border-[var(--color-border)]">
              Requirements
            </h3>
            <ol className="list-decimal list-inside space-y-3 ml-1">
              {problem.requirements.map((req) => (
                <li
                  key={req.id}
                  className="text-sm text-[var(--color-text-secondary)] leading-relaxed"
                >
                  {req.description}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-1">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 uppercase tracking-wider pb-2 border-b border-[var(--color-border)]">
              Required Concepts
            </h3>
            <div className="flex flex-wrap gap-2 mt-4">
              {problem.submissionConfig.requiredConcepts.map((concept) => {
                const found = submission.classes.some(
                  (c) =>
                    c.name.toLowerCase().includes(concept.toLowerCase()) ||
                    concept.toLowerCase().includes(c.name.toLowerCase())
                );
                return (
                  <span
                    key={concept}
                    className={`text-sm font-mono px-3 py-1.5 rounded-md border ${
                      found
                        ? 'bg-[var(--color-accent)] text-[#1a1a1a] border-[var(--color-accent)] font-bold'
                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                    }`}
                  >
                    {found ? '✓' : '○'} {concept}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-1">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 uppercase tracking-wider pb-2 border-b border-[var(--color-border)]">
              Evaluation Areas
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-1">
              {problem.evaluationConfig.criteria.map((c) => (
                <li
                  key={c.id}
                  className="text-sm text-[var(--color-text-muted)]"
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="space-y-6">
          {/* Classes */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Classes / Interfaces
              </h2>
              <button
                onClick={addClass}
                className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent-glow)] text-[var(--color-text-accent)] border border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-pointer font-medium"
              >
                + Add Class
              </button>
            </div>

            {submission.classes.length === 0 && (
              <div className="bg-[var(--color-bg-card)] border border-dashed border-[var(--color-border)] rounded-xl p-8 text-center">
                <p className="text-[var(--color-text-muted)] text-sm">
                  No classes yet. Click "Add Class" to start designing.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {submission.classes.map((cls, index) => (
                <ClassEditor
                  key={index}
                  cls={cls}
                  index={index}
                  onChange={(updated) => updateClass(index, updated)}
                  onRemove={() => removeClass(index)}
                />
              ))}
            </div>
          </section>

          {/* Relationships */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Relationships
              </h2>
              <button
                onClick={addRelationship}
                className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent-glow)] text-[var(--color-text-accent)] border border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-pointer font-medium"
              >
                + Add Relationship
              </button>
            </div>

            {submission.relationships.length === 0 && (
              <div className="bg-[var(--color-bg-card)] border border-dashed border-[var(--color-border)] rounded-xl p-6 text-center">
                <p className="text-[var(--color-text-muted)] text-sm">
                  Define how your classes relate to each other.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {submission.relationships.map((rel, index) => (
                <RelationshipEditor
                  key={index}
                  rel={rel}
                  classNames={classNames}
                  onChange={(updated) => updateRelationship(index, updated)}
                  onRemove={() => removeRelationship(index)}
                />
              ))}
            </div>
          </section>

          {/* Design Explanation */}
          <section>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
              Design Explanation
            </h2>
            <textarea
              defaultValue={submission.explanation}
              onBlur={(e) =>
                setSubmission((prev) => ({
                  ...prev,
                  explanation: e.target.value,
                }))
              }
              placeholder="Explain your design decisions, trade-offs, and how your design addresses the requirements..."
              className="w-full h-40 p-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] text-sm resize-y focus:outline-none focus:border-[var(--color-border-focus)] transition-colors placeholder:text-[var(--color-text-muted)]"
            />
          </section>
        </div>
      </div>
    </div>
  );
}

// --- Class Editor Component ---

function ClassEditor({
  cls,
  index,
  onChange,
  onRemove,
}: {
  cls: ClassDefinition;
  index: number;
  onChange: (cls: ClassDefinition) => void;
  onRemove: () => void;
}) {
  const addItem = (field: 'responsibilities' | 'methods') => {
    onChange({ ...cls, [field]: [...cls[field], ''] });
  };

  const updateItem = (
    field: 'responsibilities' | 'methods',
    i: number,
    value: string
  ) => {
    onChange({
      ...cls,
      [field]: cls[field].map((item, idx) => (idx === i ? value : item)),
    });
  };

  const removeItem = (field: 'responsibilities' | 'methods', i: number) => {
    onChange({
      ...cls,
      [field]: cls[field].filter((_, idx) => idx !== i),
    });
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 group">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-mono font-medium text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] px-3 py-1.5 rounded-md">
          #{index + 1}
        </span>
        <input
          type="text"
          defaultValue={cls.name}
          onBlur={(e) => onChange({ ...cls, name: e.target.value })}
          placeholder="ClassName"
          className="flex-1 bg-transparent border-b border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-lg focus:outline-none focus:border-[var(--color-border-focus)] transition-colors placeholder:text-[var(--color-text-muted)] font-mono pb-1"
        />
        <button
          onClick={onRemove}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-sm cursor-pointer bg-transparent border-none opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove class"
        >
          ✕
        </button>
      </div>

      {/* Responsibilities */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Responsibilities
          </label>
          <button
            onClick={() => addItem('responsibilities')}
            className="text-xs text-[var(--color-text-accent)] hover:text-[var(--color-accent-hover)] cursor-pointer bg-transparent border-none"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {cls.responsibilities.map((resp, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={resp}
                onBlur={(e) =>
                  updateItem('responsibilities', i, e.target.value)
                }
                placeholder="e.g., Manage parking spots"
                className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] transition-colors placeholder:text-[var(--color-text-muted)]"
              />
              <button
                onClick={() => removeItem('responsibilities', i)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Methods */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
            Methods
          </label>
          <button
            onClick={() => addItem('methods')}
            className="text-xs text-[var(--color-text-accent)] hover:text-[var(--color-accent-hover)] cursor-pointer bg-transparent border-none"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {cls.methods.map((method, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                defaultValue={method}
                onBlur={(e) => updateItem('methods', i, e.target.value)}
                placeholder="e.g., parkVehicle(vehicle: Vehicle): Ticket"
                className="flex-1 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] font-mono focus:outline-none focus:border-[var(--color-border-focus)] transition-colors placeholder:text-[var(--color-text-muted)]"
              />
              <button
                onClick={() => removeItem('methods', i)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-xs cursor-pointer bg-transparent border-none"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Relationship Editor Component ---

const RELATIONSHIP_TYPES: { value: RelationshipType; label: string; desc: string }[] = [
  { value: 'ASSOCIATION', label: 'Association', desc: 'uses / knows about' },
  { value: 'INHERITANCE', label: 'Inheritance', desc: 'extends / implements' },
  { value: 'COMPOSITION', label: 'Composition', desc: 'owns (strong lifecycle)' },
  { value: 'AGGREGATION', label: 'Aggregation', desc: 'has (weak lifecycle)' },
];

function RelationshipEditor({
  rel,
  classNames,
  onChange,
  onRemove,
}: {
  rel: Relationship;
  classNames: string[];
  onChange: (rel: Relationship) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-3 flex-wrap group">
      {/* Source */}
      <select
        value={rel.source}
        onChange={(e) => onChange({ ...rel, source: e.target.value })}
        className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] min-w-[140px] cursor-pointer"
      >
        <option value="">Source class</option>
        {classNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {/* Arrow + Type */}
      <div className="flex items-center gap-2">
        <span className="text-[var(--color-text-muted)]">→</span>
        <select
          value={rel.type}
          onChange={(e) =>
            onChange({ ...rel, type: e.target.value as RelationshipType })
          }
          className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] cursor-pointer"
        >
          {RELATIONSHIP_TYPES.map((rt) => (
            <option key={rt.value} value={rt.value}>
              {rt.label} ({rt.desc})
            </option>
          ))}
        </select>
        <span className="text-[var(--color-text-muted)]">→</span>
      </div>

      {/* Target */}
      <select
        value={rel.target}
        onChange={(e) => onChange({ ...rel, target: e.target.value })}
        className="bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-focus)] min-w-[140px] cursor-pointer"
      >
        <option value="">Target class</option>
        {classNames.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <button
        onClick={onRemove}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] text-sm cursor-pointer bg-transparent border-none opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
        title="Remove relationship"
      >
        ✕
      </button>
    </div>
  );
}
