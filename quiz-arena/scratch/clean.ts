import { PrismaClient } from "../src/generated/prisma/client";
const prisma = new PrismaClient();

async function cleanUp() {
  const deletedQuizzes = await prisma.quiz.deleteMany({
    where: {
      deletedAt: {
        not: null
      }
    }
  });
  console.log(`Deleted ${deletedQuizzes.count} soft-deleted quizzes.`);
}

cleanUp().catch(console.error).finally(() => prisma.$disconnect());
