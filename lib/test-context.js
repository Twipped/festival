import { AsyncLocalStorage } from 'node:async_hooks';

/** @typedef {Exclude<Parameters<typeof import('node:test').test>[0], undefined>} TestFn */
/** @typedef {Parameters<TestFn>[0]} TestContext */

/**
 * @typedef {}
 */

export const asyncStore = new AsyncLocalStorage();

/**
 * Retrieves the testing context of the current evaluating test.
 * @returns {TestContext}
 */
export function currentTestContext () {
  return asyncStore.getStore();
}
