import { ModuleMocker } from 'jest-mock';
import { afterEach } from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import CONFIG from '../lib/config.js';
import resolver from '../lib/resolve.js';
import getTestPath from '../lib/get-test-path.js';

const moduleMocker = new ModuleMocker(global);

if (CONFIG.clearMocks) {
  afterEach(() => {
    moduleMocker.clearAllMocks();
    moduleMocker.resetAllMocks();
  });
}

export const fn = moduleMocker.fn.bind(moduleMocker);
export const spyOn = moduleMocker.spyOn.bind(moduleMocker);
export const resetAllMocks = moduleMocker.resetAllMocks.bind(moduleMocker);
export const clearAllMocks = moduleMocker.clearAllMocks.bind(moduleMocker);
export const restoreAllMocks = moduleMocker.restoreAllMocks.bind(moduleMocker);

export async function reimport (modulePath) {
  const testPath = getTestPath(1);
  let realPath;
  try {
    realPath = resolver.sync(path.dirname(testPath), modulePath);
  } catch (e) {
    throw new Error(e.message);
  }

  const url = `${pathToFileURL(realPath)}?ts=${Date.now()}`;
  return import(url);
}
