import {
  ProblemSummary,
  Problem,
  Attempt,
  Submission,
  Evaluation,
} from '../types';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || `Request failed with status ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// --- Problems ---

export async function getProblems(): Promise<ProblemSummary[]> {
  return fetchJSON('/problems');
}

export async function getProblem(id: string): Promise<Problem> {
  return fetchJSON(`/problems/${id}`);
}

// --- Attempts ---

export async function createAttempt(problemId: string): Promise<Attempt> {
  return fetchJSON('/attempts', {
    method: 'POST',
    body: JSON.stringify({ problemId }),
  });
}

export async function getAttempts(problemId?: string): Promise<Attempt[]> {
  const query = problemId ? `?problemId=${problemId}` : '';
  return fetchJSON(`/attempts${query}`);
}

export async function getAttempt(id: string): Promise<Attempt> {
  return fetchJSON(`/attempts/${id}`);
}

export async function saveDraft(
  id: string,
  submission: Submission
): Promise<Attempt> {
  return fetchJSON(`/attempts/${id}/draft`, {
    method: 'PUT',
    body: JSON.stringify({ submission }),
  });
}

export async function submitAttempt(id: string): Promise<Attempt> {
  return fetchJSON(`/attempts/${id}/submit`, {
    method: 'POST',
  });
}

export async function getEvaluation(id: string): Promise<Evaluation> {
  return fetchJSON(`/attempts/${id}/evaluation`);
}
