/* eslint-disable no-underscore-dangle */
/* eslint-disable jsdoc/require-jsdoc */
import CONFIG from '../lib/config.js';

process.env.IS_FEST = true;

if (CONFIG.browser) {
  await import('./jsdom.js');
}

await import('./setup.js');
