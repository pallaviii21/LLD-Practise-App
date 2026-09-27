import prisma from '../db/client';
import { Attempt, Submission, Evaluation, AttemptStatus } from '../domain/types';

export class AttemptRepository {
  async create(problemId: string): Promise<Attempt> {
    const record = await prisma.attempt.create({
      data: {
        problemId,
        status: 'DRAFT',
      },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<Attempt | null> {
    const record = await prisma.attempt.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByProblemId(problemId: string): Promise<Attempt[]> {
    const records = await prisma.attempt.findMany({
      where: { problemId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(this.toDomain);
  }

  async findAll(): Promise<Attempt[]> {
    const records = await prisma.attempt.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map(this.toDomain);
  }

  async updateDraft(id: string, submission: Submission): Promise<Attempt> {
    const record = await prisma.attempt.update({
      where: { id },
      data: {
        submission: submission as any,
      },
    });
    return this.toDomain(record);
  }

  async updateStatus(id: string, status: AttemptStatus): Promise<Attempt> {
    const data: any = { status };
    if (status === 'SUBMITTED') {
      data.submittedAt = new Date();
    }
    const record = await prisma.attempt.update({
      where: { id },
      data,
    });
    return this.toDomain(record);
  }

  async updateEvaluation(
    id: string,
    evaluation: Evaluation,
    status: AttemptStatus
  ): Promise<Attempt> {
    const record = await prisma.attempt.update({
      where: { id },
      data: {
        evaluation: evaluation as any,
        status,
      },
    });
    return this.toDomain(record);
  }

  private toDomain(record: any): Attempt {
    return {
      id: record.id,
      problemId: record.problemId,
      status: record.status as AttemptStatus,
      submission: record.submission as Submission | null,
      evaluation: record.evaluation as Evaluation | null,
      createdAt: record.createdAt,
      submittedAt: record.submittedAt,
      updatedAt: record.updatedAt,
    };
  }
}
