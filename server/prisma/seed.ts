import prisma from '../src/db/client';
import { seedProblems } from '../src/data/seed-problems';

async function main() {
  console.log('🌱 Seeding database...');

  for (const problem of seedProblems) {
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: {
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        requirements: problem.requirements as any,
        constraints: problem.constraints as any,
        submissionConfig: problem.submissionConfig as any,
        evaluationConfig: problem.evaluationConfig as any,
      },
      create: {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        description: problem.description,
        difficulty: problem.difficulty,
        requirements: problem.requirements as any,
        constraints: problem.constraints as any,
        submissionConfig: problem.submissionConfig as any,
        evaluationConfig: problem.evaluationConfig as any,
      },
    });
    console.log(`  ✅ ${problem.title}`);
  }

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
