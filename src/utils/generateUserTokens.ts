// src/utils/generateUserTokens.ts

import logger from '@/utils/logger.server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';

async function generateTokens() {
  try {
    const usersWithoutToken = await prisma.user.findMany({
      where: {
        token: undefined,
      },
      select: { id: true, email: true },
    });

    if (usersWithoutToken.length === 0) {
      logger.info('No users found without tokens.');
      return;
    }

    const CONCURRENCY_LIMIT = 10;
    const limit = pLimit(CONCURRENCY_LIMIT);

    const updatePromises = usersWithoutToken.map((user) =>
      limit(async () => {
        const newToken = uuidv4();
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { token: newToken },
          });
          logger.info(`Assigned token to user ${user.email}`);
        } catch (error) {
          logger.error(`Failed to assign token to user ${user.email}`, {
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      })
    );

    await Promise.all(updatePromises);
    logger.info('Token generation completed.');
  } catch (error) {
    logger.error('Error generating tokens', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

generateTokens().catch((error) => {
  logger.error('Unhandled error in generateTokens:', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  process.exit(1);
});
