// src/utils/delete-temp-users.ts

import { prisma } from '../lib/prisma';
import logger from '../utils/logger.server';

async function deleteTemporaryUsers() {
  try {
    // Define the "older than 6 hours" threshold
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - 6);

    // Find users that match deletion criteria
    const usersToDelete = await prisma.user.findMany({
      where: {
        OR: [
          { email: null },  // NULL emails
          { email: "" },    // Empty string emails
        ],
        createdAt: { lt: thresholdDate },
      },
    });

    logger.info(`Found ${usersToDelete.length} temporary user(s) to delete.`);

    // Proceed only if users exist
    if (usersToDelete.length > 0) {
      const result = await prisma.user.deleteMany({
        where: {
          OR: [
            { email: null },
            { email: "" },
          ],
          createdAt: { lt: thresholdDate },
        },
      });

      logger.info(`Deleted ${result.count} temporary user(s) older than 6 hours.`);
    } else {
      logger.info("No temporary users found for deletion.");
    }

  } catch (error) {
    logger.error("Error deleting temporary users:", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    // Ensure Prisma properly disconnects
    await prisma.$disconnect();
  }
}

// Run the function when executed
deleteTemporaryUsers();

export default deleteTemporaryUsers;
