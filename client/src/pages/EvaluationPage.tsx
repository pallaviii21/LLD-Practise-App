import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Attempt,
  Problem,
  Evaluation,
  CriterionResult,
  FeedbackItem,
  FeedbackStatus,
} from '../types';
import { getAttempt, getProblem, createAttempt } from '../services/api';

export function EvaluationPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    getAttempt(attemptId)
      .then(async (attemptData) => {
        setAttempt(attemptData);
        const problemData = await getProblem(attemptData.problemId);
        setProblem(problemData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  const handleTryAgain = async () => {
    if (!problem) return;
    try {
      const newAttempt = await createAttempt(problem.id);
      navigate(`/practice/${newAttempt.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-[var(--color-text-secondary)]">
            Loading evaluation...
          </p>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-[var(--color-error)]">{error || 'Not found'}</p>
      </div>
    );
  }

  if (attempt.status === 'EVALUATING') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="w-12 h-12 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          Evaluating Your Design
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Running deterministic checks and AI evaluation...
        </p>
      </div>
    );
  }

  const evaluation = attempt.evaluation;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-sm mb-2 cursor-pointer bg-transparent border-none"
          >
            ← Back to Problems
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Evaluation Results
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {problem?.title} • Attempt submitted{' '}
            {attempt.submittedAt
              ? new Date(attempt.submittedAt).toLocaleDateString()
              : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/history')}
            className="px-5 py-2.5 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-lg text-sm font-medium transition-all cursor-pointer"
          >
            View History
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-8">
        <StatusBadge status={attempt.status} />
      </div>

      {evaluation && (
        <>
          {/* Summary */}
          <section className="mb-8">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
                Summary
              </h2>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {evaluation.summary}
              </p>
            </div>
          </section>

          {/* Strengths */}
          {evaluation.strengths.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
                Strengths
              </h2>
              <div className="bg-[var(--color-success-bg)] border border-emerald-500/20 rounded-xl p-6">
                <ul className="space-y-2">
                  {evaluation.strengths.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-emerald-400"
                    >
                      <span className="mt-0.5">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Criterion Results */}
          {evaluation.criterionResults.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                Criterion-by-Criterion Feedback
              </h2>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
                {evaluation.criterionResults.map((cr) => (
                  <CriterionCard key={cr.criterionId} result={cr} />
                ))}
              </div>
            </section>
          )}

          {/* Deterministic Feedback */}
          {evaluation.deterministicFeedback.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
                Deterministic Checks
              </h2>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
                <ul className="space-y-2">
                  {evaluation.deterministicFeedback.map((item, i) => (
                    <FeedbackItemCard key={i} item={item} />
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* AI Feedback */}
          {evaluation.aiFeedback && evaluation.aiFeedback.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                AI Feedback
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  AI-powered
                </span>
              </h2>
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
                <ul className="space-y-2">
                  {evaluation.aiFeedback.map((item, i) => (
                    <FeedbackItemCard key={i} item={item} />
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* AI Unavailable Notice */}
          {!evaluation.aiAvailable && (
            <section className="mb-8">
              <div className="bg-[var(--color-info-bg)] border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">
                  ℹ️ AI Evaluation Not Available
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  AI-powered feedback is not configured. The deterministic checks
                  above are still valid and useful. Set the{' '}
                  <code className="font-mono text-xs bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 rounded">
                    AI_API_KEY
                  </code>{' '}
                  environment variable to enable AI feedback.
                </p>
              </div>
            </section>
          )}
        </>
      )}

      {!evaluation && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <p className="text-[var(--color-text-secondary)]">
            No evaluation available. The evaluation may still be processing or
            may have failed.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 text-sm text-[var(--color-text-accent)] border border-indigo-500/20 rounded-lg cursor-pointer bg-transparent"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    DRAFT: { color: 'text-gray-400 bg-gray-400/10 border-gray-400/20', label: 'Draft' },
    SUBMITTED: { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', label: 'Submitted' },
    EVALUATING: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', label: 'Evaluating' },
    COMPLETED: { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', label: 'Completed' },
    FAILED: { color: 'text-red-400 bg-red-400/10 border-red-400/20', label: 'Evaluation Failed' },
  };

  const { color, label } = config[status] || config.DRAFT;

  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg border ${color}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {label}
    </span>
  );
}

function CriterionCard({ result }: { result: CriterionResult }) {
  const statusConfig: Record<FeedbackStatus, { bg: string; icon: string; border: string }> = {
    GOOD: { bg: 'bg-emerald-500/5', icon: '✓', border: 'border-emerald-500/20' },
    NEEDS_IMPROVEMENT: { bg: 'bg-amber-500/5', icon: '⚠', border: 'border-amber-500/20' },
    MISSING: { bg: 'bg-red-500/5', icon: '✕', border: 'border-red-500/20' },
  };

  const config = statusConfig[result.status] || statusConfig.NEEDS_IMPROVEMENT;

  return (
    <div className="pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          {result.criterionName}
        </h3>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${
            result.status === 'GOOD'
              ? 'text-emerald-500'
              : result.status === 'NEEDS_IMPROVEMENT'
              ? 'text-amber-500'
              : 'text-red-500'
          }`}
        >
          {result.status.replace('_', ' ')}
        </span>
      </div>
      {result.feedback && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-2 ml-7 leading-relaxed">
          {result.feedback}
        </p>
      )}
      {result.suggestion && (
        <div className="ml-7 mt-2 pl-3 border-l-2 border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-primary)] font-medium">
            Suggestion:
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {result.suggestion}
          </p>
        </div>
      )}
    </div>
  );
}

function FeedbackItemCard({ item }: { item: FeedbackItem }) {
  const severityIcon: Record<string, string> = {
    INFO: 'ℹ️',
    WARNING: '⚠️',
    ERROR: '❌',
  };

  return (
    <li className="text-sm text-[var(--color-text-secondary)] py-1 flex items-start gap-2">
      <span className="text-sm shrink-0 mt-0.5">{severityIcon[item.severity] || '•'}</span>
      <div>
        <span className="text-[var(--color-text-primary)] font-medium mr-2">
          {item.severity}:
        </span>
        {item.message}
        {item.suggestion && (
          <div className="mt-1 text-[var(--color-text-muted)] italic">
            Suggestion: {item.suggestion}
          </div>
        )}
      </div>
    </li>
  );
}
