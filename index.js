import {
  after as _after,
  afterEach as _afterEach,
  before as _before,
  beforeEach as _beforeEach,
  describe as _describe,
  it as _it,
  test as _test,
} from 'node:test';
import { expect } from 'expect';
import { bind as bindEach } from 'jest-each';
import { asyncStore, currentTestContext as getCurrentTestContext } from './lib/test-context.js';
import {
  fn,
  spyOn,
  resetAllMocks,
  clearAllMocks,
  restoreAllMocks,
  reimport,
  mock,
} from './stages/mock.js';
import getTestPath from './lib/get-test-path.js';
import { toMatchSnapshot } from './lib/snapshots.js';

function bindContext (origin) {
  function contextBoundOrigin (...args) {
    const testFunction = args.pop();

    const testPath = getTestPath(1);

    async function contextBoundTestFn (...testArgs) {
      // eslint-disable-next-line consistent-this
      const context = this;
      context.path = testPath;
      return asyncStore.run(context, () => {
        expect.setState({ testPath, testTitle: context.name });
        return testFunction(...testArgs);
      });
    }
    args.push(contextBoundTestFn);
    return origin(...args);
  }
  Object.assign(contextBoundOrigin, origin);
  return contextBoundOrigin;
}

const after = _after;
const before = _before;
const afterAll = _after;
const beforeAll = _before;
const beforeEach = _beforeEach;
const afterEach = _afterEach;
const describe = bindContext(_describe);
const it = bindContext(_it);
const test = bindContext(_test);

describe.only = bindContext(_describe.only);
describe.skip = bindContext(_describe.skip);
it.only = bindContext(_it.only);
it.skip = bindContext(_it.skip);
test.only = bindContext(_test.only);
test.skip = bindContext(_test.skip);

describe.each = bindEach(describe, false);
describe.skip.each = bindEach(describe.skip, false);
describe.only.each = bindEach(describe.only, false);
test.each = bindEach(test, false);
test.skip.each = bindEach(test.skip, false);
test.only.each = bindEach(test.only, false);
it.each = bindEach(it, false);
it.skip.each = bindEach(it.skip, false);
it.only.each = bindEach(it.only, false);

expect.extend({ toMatchSnapshot });

export {
  describe,
  it,
  test,
  after,
  before,
  afterAll,
  beforeAll,
  beforeEach,
  afterEach,
  getCurrentTestContext,
  fn,
  spyOn,
  mock,
  resetAllMocks,
  clearAllMocks,
  restoreAllMocks,
  reimport,
  expect,
};

export default {
  describe,
  it,
  test,
  after,
  before,
  afterAll,
  beforeAll,
  beforeEach,
  afterEach,
  getCurrentTestContext,
  fn,
  spyOn,
  mock,
  resetAllMocks,
  clearAllMocks,
  restoreAllMocks,
  reimport,
  expect,
};
