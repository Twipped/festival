import { isBuiltin } from 'node:module';
import { dirname } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import resolver from './resolve.js';

const baseURL = pathToFileURL(`${cwd()}/`).href;

export async function resolve (specifier, context, next) {
  const { parentURL = baseURL } = context;

  if (isBuiltin(specifier)) {
    return next(specifier, context);
  }
  if (specifier.startsWith('file://')) {
    // eslint-disable-next-line no-param-reassign
    specifier = fileURLToPath(specifier);
  }
  const parentPath = parentURL.slice(7);

  let url;
  try {
    const resolution = await resolver(dirname(parentPath), specifier);
    process.stdout.write(`SPECIFIER: ${specifier}\tRESOLVED: ${resolution}\n`);

    url = pathToFileURL(resolution).href;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      // Match Node's error code
      error.code = 'ERR_MODULE_NOT_FOUND';
    }
    throw error;
  }

  return next(url, context);
}
