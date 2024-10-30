'use strict';

import tryCatch, {
  isArrayThrown,
  isBigIntThrown,
  isBooleanThrown,
  isFunctionThrown,
  isErrorThrown,
  isNullThrown,
  isNumberThrown,
  isObjectThrown,
  isStringThrown,
  isSymbolThrown,
  isUndefinedThrown,
  makeIsInstanceOfThrown,
  isInstanceOfErrorThrown,
  isTypeOfObjectThrown,
} from '../src';

describe('tryCatch', () => {
  class CustomError extends Error {}
  class CustomClass {}
  const isInstanceOfThrown = makeIsInstanceOfThrown(CustomClass);

  const all = [
    {
      name: 'Array',
      throws: [1, 'a', true],
      check: isArrayThrown,
      catches: ['Array'],
    },
    {
      name: 'BigInt',
      throws: BigInt(1),
      check: isBigIntThrown,
      catches: ['BigInt'],
    },
    {
      name: 'Boolean',
      throws: true,
      check: isBooleanThrown,
      catches: ['Boolean'],
    },
    {
      name: 'CustomClass',
      throws: new CustomClass(),
      check: isInstanceOfThrown,
      catches: ['CustomClass'],
    },
    {
      name: 'CustomError',
      throws: new CustomError('Custom Error Message'),
      check: isInstanceOfErrorThrown,
      catches: ['CustomError', 'Error'],
    },
    {
      name: 'Error',
      throws: new Error('Error Message'),
      check: isErrorThrown,
      catches: ['Error'],
    },
    {
      name: 'Function',
      throws: (): void => {},
      check: isFunctionThrown,
      catches: ['Function'],
    },
    { name: 'Null', throws: null, check: isNullThrown, catches: ['Null'] },
    {
      name: 'Number',
      throws: 1,
      check: isNumberThrown,
      catches: ['Number'],
    },
    {
      name: 'Object',
      throws: {},
      check: isObjectThrown,
      catches: ['Object'],
    },
    {
      name: 'String',
      throws: 'string',
      check: isStringThrown,
      catches: ['String'],
    },
    {
      name: 'Symbol',
      throws: Symbol(),
      check: isSymbolThrown,
      catches: ['Symbol'],
    },
    {
      name: 'TypeOfObject',
      throws: new Date(),
      check: isTypeOfObjectThrown,
      catches: [
        'Array',
        'CustomClass',
        'CustomError',
        'Error',
        'Object',
        'TypeOfObject',
      ],
    },
    {
      name: 'Undefined',
      throws: undefined,
      check: isUndefinedThrown,
      catches: ['Undefined'],
    },
  ];

  describe('sync', () => {
    for (let thing of all) {
      describe(`when ${thing.name} is thrown`, () => {
        it('catches when no catchConditions provided', () => {
          const [err] = tryCatch((): void => {
            throw thing.throws;
          });

          expect(thing.check(err)).toBe(true);
          expect(err).toBe(thing.throws);
        });

        it('catches matching thrown type when catchConditions provided', () => {
          const [err] = tryCatch((): void => {
            throw thing.throws;
          }, [thing.check]);

          expect(thing.check(err)).toBe(true);
          expect(err).toBe(thing.throws);
          expect(() =>
            tryCatch((): void => {
              throw thing.throws;
            }, [thing.check]),
          ).not.toThrow();
        });

        for (let otherThing of all) {
          if (otherThing.catches.includes(thing.name)) {
            it(`catches it when catchConditions contain ${otherThing.name}`, () => {
              expect(() =>
                tryCatch((): void => {
                  throw thing.throws;
                }, [otherThing.check]),
              ).not.toThrow();
            });
          } else {
            it(`rethrows it when catchConditions contain ${otherThing.name}`, () => {
              expect(() =>
                tryCatch((): void => {
                  throw thing.throws;
                }, [otherThing.check]),
              ).toThrow();
            });
          }
        }
      });
    }

    it("returns the function's return value when no error is thrown", () => {
      const [err, value] = tryCatch(() => 1);

      expect(err).toBeUndefined();
      expect(value).toBe(1);
    });
  });

  describe('async', () => {
    for (let thing of all) {
      describe(`when ${thing.name} is thrown`, () => {
        it('catches when no catchConditions provided', async () => {
          const [err] = await tryCatch(async () => {
            throw thing.throws;
          });

          expect(thing.check(err)).toBe(true);
          expect(err).toBe(thing.throws);
        });

        it('catches matching thrown type when catchConditions provided', async () => {
          const [err] = await tryCatch(async () => {
            throw thing.throws;
          }, [thing.check]);

          expect(thing.check(err)).toBe(true);
          expect(err).toBe(thing.throws);

          await expect(
            tryCatch(async () => {
              throw thing.throws;
            }, [thing.check]),
          ).resolves.toEqual([thing.throws]);
        });

        for (let otherThing of all) {
          if (otherThing.catches.includes(thing.name)) {
            it(`catches it when catchConditions contain ${otherThing.name}`, async () => {
              await expect(
                tryCatch(async () => {
                  throw thing.throws;
                }, [otherThing.check]),
              ).resolves.toEqual([thing.throws]);
            });
          } else {
            it(`rethrows it when catchConditions contain ${otherThing.name}`, async () => {
              await expect(
                tryCatch(async () => {
                  throw thing.throws;
                }, [otherThing.check]),
              ).rejects.toEqual(thing.throws);
            });
          }
        }
      });
    }

    it("returns the function's resolved value when no error is thrown", async () => {
      const [err, value] = await tryCatch(async () => 1);

      expect(err).toBeUndefined();
      expect(value).toBe(1);
    });
  });
});
