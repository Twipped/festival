import path from 'node:path';
import { SnapshotState, toMatchSnapshot as toMatchSnapshotOriginal } from 'jest-snapshot';
import { currentTestContext } from './test-context.js';

/**
 * Expect matcher for evaluating a snapshot
 * @type {typeof import('jest-snapshot').toMatchSnapshot}
 */
export function toMatchSnapshot (...args) {
  const { path: testPath, name } = currentTestContext();
  const snapshotFile = path.resolve(
    path.dirname(testPath),
    '__snapshots__',
    `${path.basename(testPath, path.extname(testPath))}.snap.cjs` // snapshotter produces commonjs files
  );

  const snapshotState = new SnapshotState(snapshotFile, {
    updateSnapshot: process.env.SNAPSHOT ? 'all' : 'new',
  });

  const result = toMatchSnapshotOriginal.call({
    snapshotState,
    currentTestName: name,
  }, ...args);

  // Write the new snapshot to disk, if its needed
  snapshotState.save();

  return result;
}
