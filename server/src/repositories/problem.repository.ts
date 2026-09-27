import prisma from '../db/client';
import { Problem } from '../domain/types';

export class ProblemRepository {
  async findAll(): Promise<Problem[]> {
    const problems = await prisma.problem.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return problems.map(this.toDomain);
  }

  async findById(id: string): Promise<Problem | null> {
    const problem = await prisma.problem.findUnique({
      where: { id },
    });
    return problem ? this.toDomain(problem) : null;
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const problem = await prisma.problem.findUnique({
      where: { slug },
    });
    return problem ? this.toDomain(problem) : null;
  }

  private toDomain(record: any): Problem {
    return {
      id: record.id,
      title: record.title,
      slug: record.slug,
      description: record.description,
      difficulty: record.difficulty,
      requirements: record.requirements as Problem['requirements'],
      constraints: record.constraints as string[],
      submissionConfig: record.submissionConfig as Problem['submissionConfig'],
      evaluationConfig: record.evaluationConfig as Problem['evaluationConfig'],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
