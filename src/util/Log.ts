declare global {
  var Log: LogTypes | undefined;
}

const Log = (function Log(): LogTypes {
  if (globalThis.Log) return globalThis.Log;
  else
    globalThis.Log = {
      info: (...args: unknown[]) =>
        console.info(`[${new Date().toISOString()}][INFO]\t`, ...args),
      error: (...args: unknown[]) =>
        console.error(`[${new Date().toISOString()}][ERROR]\t`, ...args),
      debug: (...args: unknown[]) =>
        console.debug(`[${new Date().toISOString()}][DEBUG]\t`, ...args),
    };
  return globalThis.Log;
})();

export type LogTypes = {
  [key in "info" | "error" | "debug"]: (...arg: unknown[]) => void;
};

export default Log;
