// Hack needed to avoid JSON-Serialization validation error from Next.js https://github.com/zeit/next.js/discussions/11209
// >>> Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value all together.
// Apparently `yarn patch` doesn't even fix this... so we have to handle it at runtime
export const deleteUndefined = <T>(obj: T): T => {
  if (isRecord(obj)) {
    Object.keys(obj).forEach((key: string) => {
      if (obj[key] && typeof obj[key] === "object") {
        deleteUndefined(obj[key]);
      } else if (typeof obj[key] === "undefined") {
        delete obj[key];
      }
    });
  }
  return obj;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};
