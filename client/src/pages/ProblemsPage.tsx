import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProblemSummary, Difficulty } from '../types';
import { getProblems, createAttempt } from '../services/api';

export function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProblems()
      .then(setProblems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStartPractice = async (problemId: string) => {
    try {
      const attempt = await createAttempt(problemId);
      navigate(`/practice/${attempt.id}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[var(--color-text-secondary)]">Loading problems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-[var(--color-error-bg)] border border-[var(--color-error)]/30 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-[var(--color-error)] font-medium">Error: {error}</p>
          <p className="text-[var(--color-text-muted)] text-sm mt-2">Make sure the server is running on port 3001</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center py-16 mb-8 min-h-[250px]">
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-4">
          LLD Practice App
        </h1>
        <p className="max-w-xl text-[var(--color-text-secondary)] text-base">
          Master object-oriented design through structured practice. Choose a problem,
          design your solution, and receive detailed feedback on your approach.
        </p>
      </div>

      {/* Problem Cards */}
      <div className="flex justify-center w-full mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
          {problems.map((problem) => (
            <ProblemCard
              key={problem.id}
              problem={problem}
              onStart={() => handleStartPractice(problem.id)}
              onViewDetails={() => navigate(`/problems/${problem.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProblemCard({
  problem,
  onStart,
  onViewDetails,
}: {
  problem: ProblemSummary;
  onStart: () => void;
  onViewDetails: () => void;
}) {
  return (
    <div className="p-8 min-h-[180px] m-[1px] bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-3xl flex flex-col group relative hover:border-[var(--color-border-hover)] transition-all duration-300 shadow-sm hover:shadow-md">
      {/* Accent */}
      <div className="absolute top-[0px] left-[5px] right-[5px] h-2 rounded-t-[23px] bg-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">
        {problem.title}
      </h2>

      <div className="flex items-center text-xs font-semibold mb-3">
        <span className={`${problem.difficulty === 'EASY' ? 'text-emerald-400' :
          problem.difficulty === 'MEDIUM' ? 'text-orange-400' :
            'text-red-400'
          }`}>
          {problem.difficulty}
        </span>
        <span className="text-[var(--color-text-muted)] ml-2 font-normal">
          • {problem.criteriaCount} criteria
        </span>
      </div>

      <p className="text-xs text-[var(--color-text-secondary)] mb-4 line-clamp-3 leading-relaxed">
        {problem.description}
      </p>

      {/* Concepts */}
      <div className="flex flex-wrap gap-2 mb-6">
        {problem.requiredConcepts.map((concept) => (
          <span
            key={concept}
            className="px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] text-sm rounded-xl border border-[var(--color-border)]"
          >
            {concept}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between pt-5 border-t border-[var(--color-border)]">
        <button
          onClick={onViewDetails}
          className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer bg-transparent border-none"
        >
          View Details
        </button>
        <button
          onClick={onStart}
          className="px-8 py-3 bg-white hover:bg-gray-200 text-black text-sm font-bold rounded-2xl border border-gray-300 transition-colors cursor-pointer shadow-sm hover:shadow-md"
        >
          Practice Now
        </button>
      </div>
    </div>
  );
}
