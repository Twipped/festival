export default function getTestPath (sliceLayer = 0) {
  // here we use a hack of v8 to access the filepath of the invoking test
  const { prepareStackTrace } = Error;
  Error.prepareStackTrace = (_, stack) => stack;
  const { stack } = new Error();
  Error.prepareStackTrace = prepareStackTrace;
  return stack[sliceLayer + 1].getFileName().slice(7);
}
