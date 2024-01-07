/* eslint-disable no-param-reassign */
import babel from '@babel/core';
import path from 'node:path';
import { isBuiltin } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import resolver from './resolve.js';
// import { isTestFile } from './config.js';

const { loadOptionsAsync, transformAsync } = babel;
// const __filename = new URL(import.meta.url).pathname;
// const __dirname = path.dirname(__filename);
// const babelImportsPlugin = path.resolve(__dirname, 'babel-plugin-imports.js');

function isBabelConfigFile (filename) {
  const basename = path.basename(filename);
  return (
    basename === '.babelrc.js'
    || basename === '.babelrc.mjs'
    || basename === 'babel.config.js'
    || basename === 'babel.config.mjs'
    || basename === '.babelrc'
    || basename === '.babelrc.cjs'
    || basename === 'babel.config.cjs'
  );
}

// The formats that babel can compile
// It cannot compile wasm/json
const supportedModuleFormats = [ 'module' ];

function useLoader (url) {
  return !/node_modules/.test(url) && !/node:/.test(url);
}

// let timestamp = process.hrtime.bigint();
const mocks = new Map();
const Mocker = {
  addMock (original, globalName, exportNames) {
    let source = `module.exports = global.${globalName};`;

    if (exportNames) {
      source = 'Object.defineProperty(exports, "__esModule", {value: true});';
      for (const name of exportNames) {
        source += `exports['${name}'] = global.${globalName}['${name}'];\n`;
      }
    }

    // process.stdout.write(`MOCK: ${original.padEnd(50)}\n  NAME: ${globalName}\n`);

    mocks.set(original, source);
    // timestamp = process.hrtime.bigint();
  },
  clearAllMocks () {
    mocks.clear();
    // timestamp = process.hrtime.bigint();
  },
};

export async function initialize ({ port } = {}) {
  port.on('message', (message) => {
    const { command, arguments: args = [] } = message;
    Mocker[command](...args);
  });
}

const baseURL = pathToFileURL(`${process.cwd()}/`).href;

export async function resolve (specifier, context, next) {
  const { parentURL = baseURL } = context;

  // process.stdout.write(`SPECIFIER: ${specifier.padEnd(50)}\n  PARENT: ${parentURL}\n`);

  if (isBuiltin(specifier) || specifier === import.meta.url) {
    return next(specifier, context);
  }
  if (specifier.startsWith('file://')) {
    const url = new URL(specifier);
    url.searchParams.delete('ts');

    // eslint-disable-next-line no-param-reassign
    specifier = fileURLToPath(url);
  }
  const parentPath = parentURL.slice(7);

  let url,
    resolution;
  try {
    resolution = await resolver(path.dirname(parentPath), specifier);
    url = pathToFileURL(resolution).href;
  } catch (error) {
    process.stdout.write('  FAILED\n');
    if (error.code === 'MODULE_NOT_FOUND') {
      // Match Node's error code
      error.code = 'ERR_MODULE_NOT_FOUND';
    }
    throw error;
  }
  // url += `?ts=${timestamp.toString(36)}`;

  // process.stdout.write(`  RESOLVED: ${url}\n`);
  return next(url, context);
}

const moduleCache = new Map();
export async function load (url, context, next) {
  const modulePath = new URL(url).pathname;

  if (mocks.has(modulePath)) {
    // process.stdout.write(`SPECIFIER: ${url.padEnd(50)}\n  MODULEPATH: ${modulePath}\n  HAS: ${mocks.has(modulePath)}\n`);
    return { source: mocks.get(modulePath), format: 'commonjs', shortCircuit: true };
  }

  if (!useLoader(url)) {
    return next(url, context, next);
  }

  const { source, format } = await next(url, context, next);

  // NodeJS' implementation of defaultLoad returns a source of `null` for CommonJS modules.
  // So we just skip compilation when it's commonjs until a future day when NodeJS (might) support that.
  // Also, we skip compilation of wasm and json modules by babel, since babel isn't needed or possible
  // in those situations
  if (!source || (format && !supportedModuleFormats.includes(format))) {
    return { source, format };
  }

  const filename = fileURLToPath(url);
  // Babel config files can themselves be ES modules,
  // but we cannot transform those since doing so would cause an infinite loop.
  if (isBabelConfigFile(filename)) {
    return {
      source,
      format: /\.(c|m)?js$/.test(filename) ? 'module' : 'json',
    };
  }

  if (moduleCache.has(filename)) {
    return {
      source: moduleCache.get(filename),
      format: 'module',
    };
  }

  // const isTest = isTestFile(filename);
  const options = await loadOptionsAsync({
    sourceType: format || 'module',
    root: process.cwd(),
    filename,
    rootMode: 'root',
    sourceMaps: 'inline',
    configFile: false,
    presets: [
      [ '@babel/preset-react', {
        runtime: 'automatic',
      } ],
    ],
    // plugins: isTest ? [ babelImportsPlugin ] : [],
  });
  const transformed = await transformAsync(source, options);
  moduleCache.set(filename, transformed.code);

  // if (isTest) {
  //   process.stdout.write(`FILENAME: ${filename}\nCODE:\n ${transformed.code}\n\n`);
  // }

  return {
    source: transformed.code,
    format: 'module',
  };
}
