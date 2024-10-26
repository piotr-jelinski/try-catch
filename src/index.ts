'use strict';

export type ErrorType = new (message?: string) => Error;
export type TryCatchResult<T, E extends ErrorType> =
  | [undefined, T]
  | [InstanceType<E>];

function returnCatchAbleErrorOrThrow<E extends ErrorType>(
  // this is an actual instance, so it has a constructor
  error: unknown,
  // this is but a list of types, no actual instances
  errToCatch?: E[],
): [InstanceType<E>] {
  if (
    // if you like to throw non Error values, just handle them yourself depending on the need :)
    error instanceof Error &&
    (!errToCatch ||
      errToCatch.length === 0 ||
      errToCatch.some(
        (e) => error instanceof e && error.constructor.name === e.name,
      ))
  ) {
    return [error as InstanceType<E>];
  }

  throw error;
}

// overloads to support both sync and async functions and return the correct type based on the input
export default function tryCatch<T, E extends ErrorType>(
  fn: () => Promise<T>,
  errToCatch?: E[],
): Promise<TryCatchResult<T, E>>;
export default function tryCatch<T, E extends ErrorType>(
  fn: () => T,
  errToCatch?: E[],
): TryCatchResult<T, E>;
export default function tryCatch<T, E extends ErrorType>(
  fn: () => T | Promise<T>,
  errToCatch?: E[],
): TryCatchResult<T, E> | Promise<TryCatchResult<T, E>> {
  try {
    const result = fn();

    if (result instanceof Promise) {
      return result
        .then((res): TryCatchResult<T, E> => [undefined, res])
        .catch(
          (err: unknown): TryCatchResult<T, E> =>
            returnCatchAbleErrorOrThrow<E>(err as Error, errToCatch),
        );
    }

    return [undefined, result];
  } catch (error: unknown) {
    return returnCatchAbleErrorOrThrow<E>(error as Error, errToCatch);
  }
}
