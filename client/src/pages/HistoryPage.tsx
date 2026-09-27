import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Attempt, ProblemSummary } from '../types';
import { getAttempts, getProblems, createAttempt } from '../services/api';

export function HistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [problems, setProblems] = useState<Map<string, ProblemSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getAttempts(), getProblems()])
      .then(([attemptsData, problemsData]) => {
        setAttempts(attemptsData);
        const map = new Map<string, ProblemSummary>();
        problemsData.forEach((p) => map.set(p.id, p));
        setProblems(map);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRetry = async (problemId: string) => {
    try {
      const attempt = await createAttempt(problemId);
      navigate(`/practice/${attempt.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
        Attempt History
      </h1>
      <p className="text-[var(--color-text-secondary)] mb-8">
        Review your previous attempts and track your progress.
      </p>

      {error && (
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)]/30 rounded-lg p-4 mb-6">
          <p className="text-[var(--color-error)] text-sm">{error}</p>
        </div>
      )}

      {attempts.length === 0 ? (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <p className="text-[var(--color-text-muted)] mb-4">
            No attempts yet. Start practicing!
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[#1a1a1a] font-bold rounded-xl cursor-pointer"
          >
            Browse Problems
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt, index) => {
            const problem = problems.get(attempt.problemId);
            // Count attempt number for this problem
            const problemAttempts = attempts.filter(
              (a) => a.problemId === attempt.problemId
            );
            const attemptNumber =
              problemAttempts.length -
              problemAttempts.indexOf(attempt);

            return (
              <div
                key={attempt.id}
                className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-border-hover)] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center text-lg font-bold text-[var(--color-text-muted)]">
                      #{attemptNumber}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                        {problem?.title || 'Unknown Problem'}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {new Date(attempt.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                        {attempt.submission &&
                          ` • ${attempt.submission.classes.length} classes`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <AttemptStatusBadge status={attempt.status} />
                    <div className="flex gap-3">
                      {(attempt.status === 'COMPLETED' ||
                        attempt.status === 'FAILED') && (
                        <button
                          onClick={() =>
                            navigate(`/evaluation/${attempt.id}`)
                          }
                          className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] border border-[var(--color-border)] rounded-xl hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer"
                        >
                          Review
                        </button>
                      )}
                      {attempt.status === 'DRAFT' && (
                        <button
                          onClick={() =>
                            navigate(`/practice/${attempt.id}`)
                          }
                          className="px-5 py-2.5 text-sm font-medium text-[var(--color-text-accent)] border border-indigo-500/20 rounded-xl hover:border-indigo-500/40 hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer"
                        >
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AttemptStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    DRAFT: {
      color: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
      label: 'Draft',
    },
    SUBMITTED: {
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      label: 'Submitted',
    },
    EVALUATING: {
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      label: 'Evaluating',
    },
    COMPLETED: {
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      label: 'Completed',
    },
    FAILED: {
      color: 'text-red-400 bg-red-400/10 border-red-400/20',
      label: 'Failed',
    },
  };

  const { color, label } = config[status] || config.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-lg border ${color}`}
    >
      <span className="w-2 h-2 rounded-full bg-current" />
      {label}
    </span>
  );
}
