'use strict';

export type CatchCondition = (error: unknown) => boolean;
export type TryCatchResult<T> = [undefined, T] | [unknown];

export const isArrayThrown: CatchCondition = (error: unknown): boolean =>
  Array.isArray(error);

export const isBigIntThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'bigint';

export const isBooleanThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'boolean';

export const isErrorThrown: CatchCondition = (error: unknown): boolean =>
  error instanceof Error && Object.getPrototypeOf(error) === Error.prototype;

export const isFunctionThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'function';

export const isInstanceOfErrorThrown: CatchCondition = (
  error: unknown,
): boolean => error instanceof Error;

export const isNullThrown: CatchCondition = (error: unknown): boolean =>
  error === null;

export const isNumberThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'number';

export const isObjectThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  error.constructor === Object &&
  Object.getPrototypeOf(error) === Object.prototype;

export const isStringThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'string';

export const isSymbolThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'symbol';

export const isTypeOfObjectThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'object' && error !== null;

export const isUndefinedThrown: CatchCondition = (error: unknown): boolean =>
  typeof error === 'undefined';

export const createCatchCondition =
  <E extends new (...args: any[]) => any>(ClassName: E): CatchCondition =>
  (error: unknown): boolean =>
    error instanceof ClassName;

function returnCatchAbleErrorOrThrow(
  error: unknown,
  catchConditions: CatchCondition[],
): [unknown] {
  if (
    catchConditions.length === 0 ||
    catchConditions.some((cond) => cond(error))
  ) {
    return [error];
  }

  throw error;
}

// overloads to support both sync and async functions and return the correct type based on the input
export default function tryCatch<T>(
  fn: () => Promise<T>,
  catchConditions?: CatchCondition[],
): Promise<TryCatchResult<T>>;
export default function tryCatch<T>(
  fn: () => T,
  catchConditions?: CatchCondition[],
): TryCatchResult<T>;
export default function tryCatch<T>(
  fn: () => T | Promise<T>,
  catchConditions: CatchCondition[] = [],
): TryCatchResult<T> | Promise<TryCatchResult<T>> {
  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then((res): TryCatchResult<T> => [undefined, res])
        .catch(
          (maybeError: unknown): TryCatchResult<T> =>
            returnCatchAbleErrorOrThrow(maybeError, catchConditions),
        );
    }

    return [undefined, result];
  } catch (maybeError: unknown) {
    return returnCatchAbleErrorOrThrow(maybeError, catchConditions);
  }
}
