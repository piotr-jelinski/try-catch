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
    expect((error as E).constructor.name).toBe(errorClass.name);
    expect((error as E).message).toBe(expectedMessage);
  };

  describe('sync', () => {
    it('catches generic Error when no specific error type is provided', () => {
      const [err] = tryCatch((): void => {
        throw new Error('Error Message');
      });

      expectError(err, 'Error Message');
    });

    it('catches generic Error with an empty error list', () => {
      const [err] = tryCatch((): void => {
        throw new Error('Error Message');
      }, []);

      expectError(err, 'Error Message');

      const [err2] = tryCatch((): void => {
        throw new CustomError('Custom Error Message');
      }, []);

      expectError(err2, 'Custom Error Message', CustomError);
    });

    it('catches matching Error type when error list provided', () => {
      const [err1] = tryCatch((): void => {
        throw new CustomError('Custom Error Message');
      }, [CustomError]);

      expectError(err1, 'Custom Error Message', CustomError);
      expect(() =>
        tryCatch((): void => {
          throw new CustomError('Custom Error Message');
        }, [CustomError]),
      ).not.toThrow();

      const [err2] = tryCatch((): void => {
        throw new Error('Error Message');
      }, [Error]);

      expectError(err2, 'Error Message', Error);
      expect(() =>
        tryCatch((): void => {
          throw new Error('Error Message');
        }, [Error]),
      ).not.toThrow();
    });

    it('rethrows errors not on the catch list', () => {
      expect(() =>
        tryCatch((): void => {
          throw new Error('Error Message');
        }, [CustomError]),
      ).toThrow('Error Message');
      expect(() =>
        tryCatch((): void => {
          throw new CustomError('Custom Error Message');
        }, [Error]),
      ).toThrow('Custom Error Message');
    });

    it('rethrows if something else than Error was thrown', () => {
      expect(() =>
        tryCatch((): void => {
          throw 1;
        }),
      ).toThrow();
      expect(() =>
        tryCatch((): void => {
          throw 'string';
        }),
      ).toThrow();
      expect(() =>
        tryCatch((): void => {
          throw true;
        }),
      ).toThrow();
      expect(() =>
        tryCatch((): void => {
          throw {};
        }),
      ).toThrow();
      expect(() =>
        tryCatch((): void => {
          throw null;
        }),
      ).toThrow();
    });

    it("returns the function's return value when no error is thrown", () => {
      const [err, value] = tryCatch(() => 1);

      expect(err).toBeUndefined();
      expect(value).toBe(1);
    });
  });

  describe('async', () => {
    it('catches generic Error when no specific error type is provided', async () => {
      const [err] = await tryCatch(() =>
        Promise.reject(new Error('Error Message')),
      );

      expectError(err, 'Error Message');
    });

    it('catches generic Error with an empty error list', async () => {
      const [err] = await tryCatch(
        () => Promise.reject(new Error('Error Message')),
        [],
      );

      expectError(err, 'Error Message');

      const [err2] = await tryCatch(
        () => Promise.reject(new CustomError('Custom Error Message')),
        [],
      );

      expectError(err2, 'Custom Error Message', CustomError);
    });

    it('catches matching Error type when error list provided', async () => {
      const [err1] = await tryCatch(
        () => Promise.reject(new CustomError('Custom Error Message')),
        [CustomError],
      );

      expectError(err1, 'Custom Error Message', CustomError);
      await expect(
        tryCatch(
          () => Promise.reject(new CustomError('Custom Error Message')),
          [CustomError],
        ),
      ).resolves.toEqual([new CustomError('Custom Error Message')]);

      const [err2] = await tryCatch(
        () => Promise.reject(new Error('Error Message')),
        [Error],
      );

      expectError(err2, 'Error Message', Error);
      await expect(
        tryCatch(() => Promise.reject(new Error('Error Message')), [Error]),
      ).resolves.toEqual([new Error('Error Message')]);
    });

    it('rethrows errors not on the catch list', async () => {
      await expect(
        tryCatch(
          () => Promise.reject(new Error('Error Message')),
          [CustomError],
        ),
      ).rejects.toThrow('Error Message');
      await expect(
        tryCatch(
          () => Promise.reject(new CustomError('Custom Error Message')),
          [Error],
        ),
      ).rejects.toThrow('Custom Error Message');
    });

    it('rejects if something else than Error was thrown', async () => {
      await expect(() =>
        tryCatch(async () => {
          throw 1;
        }),
      ).rejects.toEqual(1);
      await expect(() =>
        tryCatch(async () => {
          throw 'string';
        }),
      ).rejects.toEqual('string');
      await expect(() =>
        tryCatch(async () => {
          throw true;
        }),
      ).rejects.toEqual(true);
      await expect(() =>
        tryCatch(async () => {
          throw {};
        }),
      ).rejects.toEqual({});
      await expect(() =>
        tryCatch(async () => {
          throw null;
        }),
      ).rejects.toEqual(null);
    });

    it("returns the function's resolved value when no error is thrown", async () => {
      const [err, value] = await tryCatch(() => Promise.resolve(1));

      expect(err).toBeUndefined();
      expect(value).toBe(1);
    });
  });
});
