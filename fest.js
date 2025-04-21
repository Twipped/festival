#!/usr/bin/env node
/* eslint-disable no-param-reassign */

import { tap } from 'node:test/reporters';
import { run } from 'node:test';
import process from 'node:process';
import path from 'node:path';
import { glob } from 'glob';
import minimist from 'minimist';
import CONFIG from './lib/config.js';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const argv = minimist(process.argv.slice(2));

const patterns = argv._.map((p) => new RegExp(p));

const testFiles = await glob(CONFIG.include, {
  ignore: CONFIG.exclude,
  nodir: true,
});

const files = !patterns.length ? testFiles : testFiles.filter((fpath) => patterns.some((pattern) => fpath.match(pattern)));

process.execArgv.push('--import', path.resolve(__dirname, 'stages', 'init.js'), '--enable-source-maps');

run({
  files,
  watch: argv.watch,
  timeout: CONFIG.timeout,
  only: argv.only,
}).compose(tap).pipe(process.stdout);
