'use strict';

import tryCatch, { ErrorType } from '../src';

describe('tryCatch', () => {
  class CustomError extends Error {}

  const expectError = <E extends Error>(
    error: unknown,
    expectedMessage: string,
    errorClass: ErrorType = Error,
  ) => {
    expect(error).toBeInstanceOf(errorClass);
    expect((error as E).message).toBe(expectedMessage);
  };

  describe('sync', () => {
    const syncReturnOrThrow = (
      i: number = 0,
      errorClass: ErrorType = Error,
    ) => {
      if (i === 0) {
        throw new errorClass(errorClass.name);
      }

      return i;
    };

    it('catches generic Error when no specific error type is provided', () => {
      const [err] = tryCatch(syncReturnOrThrow);

      expectError(err, 'Error');
    });

    it('catches generic Error with an empty error list', () => {
      const [err] = tryCatch(syncReturnOrThrow, []);

      expectError(err, 'Error');

      const [err2] = tryCatch(syncReturnOrThrow, []);

      expectError(err2, 'Error');
    });

    it('catches only matching Error type when error list provided', () => {
      const [err] = tryCatch(
        () => syncReturnOrThrow(0, CustomError),
        [CustomError],
      );

      expectError(err, 'CustomError', CustomError);

      expect(() => tryCatch(syncReturnOrThrow, [CustomError])).toThrow('Error');
      expect(() =>
        tryCatch(() => syncReturnOrThrow(0, CustomError), [Error]),
      ).toThrow('CustomError');

      expect(() => tryCatch(syncReturnOrThrow, [Error])).not.toThrow();
      expect(() =>
        tryCatch(() => syncReturnOrThrow(0, CustomError), [CustomError]),
      ).not.toThrow();
    });

    it("returns the function's return value when no error is thrown", () => {
      const [err, value] = tryCatch(() => syncReturnOrThrow(1));

      expect(err).toBeUndefined();
      expect(value).toBe(1);
    });
  });

  describe('async', () => {
    const asyncReturnOrThrow = async (
      i: number = 0,
      errorClass: ErrorType = Error,
    ) => {
      if (i === 0) {
        throw new errorClass(errorClass.name);
      }

      return i;
    };

    it('catches generic Error when no specific error type is provided', async () => {
      const [err] = await tryCatch(asyncReturnOrThrow);

      expectError(err, 'Error');
    });

    it('catches generic Error with an empty error list', async () => {
      const [err] = await tryCatch(asyncReturnOrThrow, []);

      expectError(err, 'Error');

      const [err2] = await tryCatch(asyncReturnOrThrow, []);

      expectError(err2, 'Error');
    });

    it('catches only matching Error type when error list provided', async () => {
      const [err] = await tryCatch(
        () => asyncReturnOrThrow(0, CustomError),
        [CustomError],
      );

      expectError(err, 'CustomError', CustomError);

      await expect(tryCatch(asyncReturnOrThrow, [CustomError])).rejects.toThrow(
        'Error',
      );
      await expect(
        tryCatch(() => asyncReturnOrThrow(0, CustomError), [Error]),
      ).rejects.toThrow('CustomError');

      await expect(tryCatch(asyncReturnOrThrow, [Error])).resolves.toEqual([
        new Error('Error'),
      ]);
      await expect(
        tryCatch(() => asyncReturnOrThrow(0, CustomError), [CustomError]),
      ).resolves.toEqual([new CustomError('CustomError')]);
    });

    it("returns the function's resolved value when no error is thrown", async () => {
      const [err, value] = await tryCatch(() => asyncReturnOrThrow(1));

      expect(err).toBeUndefined();
      expect(value).toBe(1);
    });
  });
});
