// src/utils/scheduler.ts

import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { processCatalogue } from './fetchCatalogue';
import { processNetworks } from './fetchNetworks';
import logger from './logger.server';
import deleteTemporaryUsers from './delete-temp-users';

const logPath = path.join(process.cwd(), 'log', 'server.log');

cron.schedule('0 1 * * 6', async () => {
  try {
    await processCatalogue();
    await processNetworks();
  } catch (error) {
    logger.error('Error in weekly cron job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

cron.schedule('0 0 * * *', async () => {
  try {
    await deleteTemporaryUsers();
  } catch (error) {
    logger.error('Error in daily cron job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

cron.schedule('5 0 * * *', () => {
  fs.unlink(logPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      logger.error('Error deleting log file', { error: err.message });
    }
  });
});
