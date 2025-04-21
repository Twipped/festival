import { cosmiconfig } from 'cosmiconfig';
import { minimatch } from 'minimatch';
import { dirname } from 'node:path';

let config = {};
let configDir = process.cwd();
try {
  const result = await cosmiconfig('festival', {
    searchStrategy: 'global',
  }).search();
  if (result) {
    config = result.config;
    configDir = dirname(result.filepath);
  }
} catch (e) {
  console.warn(e);
}

const {
  clearMocks = true,
  cwd = configDir,
  exclude = [
    '**/@(fixture*(s)|dist)/**',
    '**/node_modules/**',
  ],
  include = [
    '**/@(test?(s)|__test?(s)__)/**/*.@(js|cjs|mjs|tap|cts|jsx|mts|ts|tsx)',
    '**/*.@(test?(s)|spec).@(js|cjs|mjs|tap|cts|jsx|mts|ts|tsx)',
    '**/test?(s).@(js|cjs|mjs|tap|cts|jsx|mts|ts|tsx)',
  ],
  jsdomUrl = 'http://localhost',
  browser = false,
  reporter = 'tap',
  setup = [],
  timeout = 10000,
} = config || {};

export function isTestFile (filepath) {
  const included = include.some((pattern) => minimatch(filepath, pattern));
  const excluded = exclude.some((pattern) => minimatch(filepath, pattern));
  return included && !excluded;
}

export default {
  clearMocks,
  cwd,
  exclude,
  include,
  jsdomUrl,
  browser,
  reporter,
  setup,
  timeout,
};
