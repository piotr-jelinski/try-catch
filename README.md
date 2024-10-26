# Try-Catch Utils

A TypeScript utility to handle errors for both synchronous and asynchronous functions without needing try-catch blocks.

## Installation

```bash
npm install TO_BE_DETERMINED
```

## Usage

### Synchronous Functions

The `tryCatch` function can be used to safely execute synchronous functions, catching errors as needed.

```typescript
import tryCatch, { ErrorType } from "TO_BE_DETERMINED";

class CustomError extends Error {}

const syncReturnOrThrow = (i: number = 0, errorClass: ErrorType = Error) => {
  if (i === 0) {
    throw new errorClass(errorClass.name);
  }

  return i;
};

// Catching a general Error
const [err1] = tryCatch(syncReturnOrThrow);
if (err1) {
  console.error(err1.message); // "Error"
}

// Catching only a specific CustomError. Any error of a different type will not be caught; instead, it will be re-thrown.
const [err2] = tryCatch(() => syncReturnOrThrow(0, CustomError)), [CustomError]);
if (err2) {
  console.error(err2.message); // "CustomError"
}

// This will throw Error.
tryCatch(() => syncReturnOrThrow(0, Error)), [CustomError]);

// This will too
tryCatch(() => syncReturnOrThrow(0, CustomError)), [Error]);

// Returning value without error
const [err3, value] = tryCatch(() => syncReturnOrThrow(1));
console.log(value); // 1

```

### Asynchronous Functions

The utility also works with asynchronous functions, returning promises that can be awaited.

```typescript
import tryCatch, { ErrorType } from "TO_BE_DETERMINED";

const asyncReturnOrThrow = async (i: number = 0, errorClass: ErrorType = Error) => {
  if (i === 0) {
    throw new errorClass(errorClass.name);
  }

  return i;
};

// Catching a general Error in an async function
const [asyncErr1] = await tryCatch(asyncReturnOrThrow);
if (asyncErr1) {
  console.error(asyncErr1.message); // "Error"
}

// Catching only a specific CustomError. Any error of a different type will not be caught; instead, it will be re-thrown.
const [asyncErr2] = await tryCatch(() => asyncReturnOrThrow(0, CustomError), [CustomError]);
if (asyncErr2) {
  console.error(asyncErr2.message); // "CustomError"
}

// This will throw Error.
await tryCatch(() => asyncReturnOrThrow(0, Error)), [CustomError]);

// This will too.
await tryCatch(() => asyncReturnOrThrow(0, CustomError)), [Error]);

// Returning value without error in an async function
const [asyncErr3, asyncValue] = await tryCatch(() => asyncReturnOrThrow(1));
console.log(asyncValue); // 1
```

## License

This project is licensed under the MIT License.
