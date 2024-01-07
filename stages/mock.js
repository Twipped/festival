import { ModuleMocker } from 'jest-mock';
import { afterEach } from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';

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

const mockCache = new Map();
export function mock (modulePath, factory) {
  const gateway = global.__zest_loader_gateway__;
  const testPath = getTestPath(1);
  let realPath;
  try {
    realPath = resolver.sync(path.dirname(testPath), modulePath);
  } catch (e) {
    throw new Error(e.message);
  }

  if (mockCache.has(realPath)) {
    throw new Error(`A mock for ${realPath} already exists.`);
  }

  // deepcode ignore InsecureHash: Shutup snyk, this isn't actually crypto
  const h = crypto.createHash('sha1').update(realPath);
  const hash = BigInt(`0x${h.digest('hex')}`).toString(36);
  const mockedKey = `__zestMock__${hash}`;
  mockCache.set(realPath, mockedKey);
  global[mockedKey] = factory();
  const exportNames = typeof global[mockedKey] === 'object' ? Object.keys(global[mockedKey]) : null;
  gateway.postMessage({
    command: 'addMock',
    arguments: [
      realPath,
      mockedKey,
      exportNames,
    ],
  });
}

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
