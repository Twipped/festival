/* eslint-disable no-underscore-dangle */
/* eslint-disable jsdoc/require-jsdoc */
import { register } from 'node:module';
import { MessageChannel } from 'node:worker_threads';
import { pathToFileURL } from 'node:url';
import CONFIG from '../lib/config.js';

const __filename = (new URL(import.meta.url)).pathname;

const { port1, port2 } = new MessageChannel();

global.__zest_loader_gateway__ = port1;

process.env.IS_ZEST = true;

// register(import.meta.resolve('./lib/resolver.js'));
register(import.meta.resolve('../lib/loader.js'), {
  parentURL: pathToFileURL(__filename),
  data: { port: port2 },
  transferList: [ port2 ],
});

if (CONFIG.react) {
  await import('./jsdom.js');
}

await import('./setup.js');
