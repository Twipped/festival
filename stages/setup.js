import resolver from '../lib/resolve.js';
import CONFIG from '../lib/config.js';

/* eslint-disable no-await-in-loop */
for (const p of CONFIG.setup) {
  const rp = await resolver(CONFIG.cwd, p);
  await import(rp);
}
