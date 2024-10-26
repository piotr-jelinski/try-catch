# Try-Catch Utils

A TypeScript utility to handle errors for both synchronous and asynchronous functions without needing try-catch blocks.

## Github Page

[https://github.com/piotr-jelinski/try-catch](https://github.com/piotr-jelinski/try-catch)

## Installation

```bash
npm install @pjelinski/try-catch
```

## Usage

### Importing

Utility function

```typescript
import tryCatch from '@pjelinski/try-catch';
```

Types

```typescript
import { ErrorType, TryCatchResult } from '@pjelinski/try-catch';
```

### Synchronous Functions

The `tryCatch` function can be used to safely execute synchronous functions, catching errors as needed.

```typescript
class CustomError extends Error {}

// Catching a general Error
const [err1] = tryCatch((): void => {
  throw new Error('Message');
});
console.error(err1.message); // "Message"

// Catching only a specific CustomError.
const [err2] = tryCatch((): void => {
  throw new CustomError('Custom message');
}), [CustomError]);
console.error(err2.message); // "Custom message"

// Any error of a different type will not be caught; instead, it will be re-thrown.
// This will throw Error
tryCatch((): void => {
  throw new Error('Message');
}), [CustomError]);

// This will throw CustomError
tryCatch((): void => {
  throw new CustomError('Custom message');
}), [Error]);

// Returning value without error
const [err3, value] = tryCatch(() => 1);
console.log(value); // 1

```

### Asynchronous Functions

The utility also works with asynchronous functions, returning promises that can be awaited.

```typescript
class CustomError extends Error {}

// Catching a general Error in an async function
const [asyncErr1] = await tryCatch(() => Promise.reject(new Error('Message')));
console.error(asyncErr1.message); // "Message"

// Catching only a specific CustomError.
const [asyncErr2] = await tryCatch(() => Promise.reject(new CustomError('Custom message')), [CustomError]);
console.error(asyncErr2.message); // "Custom message"

// Any error of a different type will not be caught; instead, it will be re-thrown.
// This will throw Error.
await tryCatch(() => Promise.reject(new Error('Message'))), [CustomError]);

// This will throw CustomError
await tryCatch(() => Promise.reject(new CustomError('Custom message')), [Error]);

// Returning value without error in an async function
const [asyncErr3, asyncValue] = await tryCatch(() => Promise.resolve(1));
console.log(asyncValue); // 1
```

### Handling Non-Error Values in Throws

Thrown values such as numbers, strings, objects, or any other type that is not an instance of Error will not be caught; you must handle them yourself.

## License

This project is licensed under the MIT License.
