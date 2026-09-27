import { Problem } from '../domain/types';
import { ProblemRepository } from '../repositories/problem.repository';

export class ProblemService {
  private repository: ProblemRepository;

  constructor(repository: ProblemRepository) {
    this.repository = repository;
  }

  async getAllProblems(): Promise<Problem[]> {
    return this.repository.findAll();
  }

  async getProblemById(id: string): Promise<Problem | null> {
    return this.repository.findById(id);
  }

  async getProblemBySlug(slug: string): Promise<Problem | null> {
    return this.repository.findBySlug(slug);
  }
}
