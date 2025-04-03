// run-fetch.ts

import { processCatalogue } from './src/utils/fetchCatalogue';
import { processNetworks } from './src/utils/fetchNetworks';

(async () => {
  try {
    console.log('Running fetchCatalogue...');
    await processCatalogue();
    console.log('Catalogue fetched and saved successfully.');

    console.log('Running fetchNetworks...');
    await processNetworks();
    console.log('Networks fetched and saved successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Error running fetch scripts:', error);
    process.exit(1);
  }
})();
