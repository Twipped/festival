import { JSDOM, VirtualConsole } from 'jsdom';

import CONFIG from '../lib/config.js';

const virtualConsole = new VirtualConsole();
virtualConsole.sendTo(console, { omitJSDOMErrors: true });
virtualConsole.on('jsdomError', (error) => {
  console.error(error);
});

const dom = new JSDOM('<!DOCTYPE html>', {
  pretendToBeVisual: true,
  runScripts: 'dangerously',
  url: CONFIG.jsdomUrl,
  virtualConsole,
});

// We need to add everything on JSDOM's window object to global scope.
// We don't add anything starting with _, or anything that's already there.
Object.getOwnPropertyNames(dom.window)
  .filter((k) => !k.startsWith('_') && !(k in global))
  .forEach((k) => { global[k] = dom.window[k]; });

global.document = dom.window.document;
global.window = dom.window;

global.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
