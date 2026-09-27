import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Problem } from '../types';
import { getProblem, createAttempt } from '../services/api';

export function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getProblem(id)
      .then(setProblem)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = async () => {
    if (!problem) return;
    try {
      const attempt = await createAttempt(problem.id);
      navigate(`/practice/${attempt.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-[var(--color-error)]">
          {error || 'Problem not found'}
        </p>
      </div>
    );
  }

  const difficultyColor: Record<string, string> = {
    EASY: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    MEDIUM: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    HARD: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <button
          onClick={() => navigate('/')}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-sm mb-4 inline-flex items-center gap-1 cursor-pointer bg-transparent border-none"
        >
          ← Back to Problems
        </button>
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-semibold text-[var(--color-text-primary)]">
            Designing a {problem.title} System
          </h1>
          <span
            className={`text-sm font-medium px-4 py-2 rounded-lg border ${difficultyColor[problem.difficulty]}`}
          >
            {problem.difficulty}
          </span>
        </div>
      </div>

      <div className="border-b border-[var(--color-border)] mb-8" />

      {/* Requirements */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)] mb-4 pb-2 border-b border-[var(--color-border)]">
          Requirements
        </h2>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          {problem.requirements.map((req) => (
            <li key={req.id} className="text-[var(--color-text-primary)] text-base leading-relaxed">
              {req.description}
            </li>
          ))}
        </ol>
      </section>

      {/* Constraints */}
      {problem.constraints.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Constraints
          </h2>
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
            <ul className="list-disc list-inside space-y-2">
              {problem.constraints.map((c, i) => (
                <li
                  key={i}
                  className="text-[var(--color-text-secondary)] text-sm leading-relaxed"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Evaluation Criteria */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          Evaluation Areas
        </h2>
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
          <p className="text-[var(--color-text-muted)] text-sm mb-4">
            You will be evaluated on:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {problem.evaluationConfig.criteria.map((criterion) => (
              <div
                key={criterion.id}
                className="flex items-center gap-3 bg-[var(--color-bg-tertiary)] rounded-lg px-4 py-3"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {criterion.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {criterion.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Concepts */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
          Key Concepts
        </h2>
        <div className="flex flex-wrap gap-2">
          {problem.submissionConfig.requiredConcepts.map((concept) => (
            <span
              key={concept}
              className="font-mono text-sm px-4 py-2 rounded-lg bg-[var(--color-accent-glow)] text-[var(--color-text-accent)] border border-indigo-500/20"
            >
              {concept}
            </span>
          ))}
        </div>
      </section>

      {/* Start Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleStart}
          className="px-8 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#1a1a1a] font-bold rounded-md transition-all duration-200 shadow-md cursor-pointer text-lg"
        >
          Start Practicing →
        </button>
      </div>
    </div>
  );
}

function PriorityIndicator({
  priority,
}: {
  priority: 'MUST_HAVE' | 'SHOULD_HAVE' | 'NICE_TO_HAVE';
}) {
  const config = {
    MUST_HAVE: { color: 'bg-red-400', label: 'Must' },
    SHOULD_HAVE: { color: 'bg-amber-400', label: 'Should' },
    NICE_TO_HAVE: { color: 'bg-emerald-400', label: 'Nice' },
  };

  const { color, label } = config[priority];

  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md shrink-0 ${color}/10 text-[var(--color-text-muted)]`}
    >
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
