## Overview

This package provides a utility function called tryCatch which simplifies error handling by allowing you to specify conditions under which errors are caught. It also provides a set of pre-defined catch conditions and a factory function to create custom catch conditions based on class instances.

## Github Page

[https://github.com/piotr-jelinski/try-catch](https://github.com/piotr-jelinski/try-catch)

## Installation

```bash
npm install @pjelinski/try-catch
```

## Problem Statement

In JavaScript and TypeScript, managing error handling can become complex, especially when dealing with different error types and asynchronous operations. Standard `try...catch` blocks do not offer fine-grained control over which errors should be caught and handled versus which should propagate. This often leads to overly broad catch blocks or verbose error-checking logic within catch statements.

Furthermore, not all thrown values are instances of `Error`. JavaScript allows for the throwing of any value, including primitive types like strings, numbers, booleans, or even custom class instances. This can lead to unexpected behavior and errors slipping through unnoticed, resulting in runtime issues that are hard to debug and track down.

Another issue arises with variable scoping and returning values from within `try...catch...finally` blocks.

### Example:

```typescript
let something: SomeType;
try {
  // Declaring `something` here would limit its scope to the try block.
  // Execute some code that might throw an exception.
  something = someFunctionThatMayThrow();

  // If a return statement is placed here, and there's also a return statement in the finally block,
  // the return from this section will be overridden by the return in the finally block.
} catch (e: unknown) {
  // Handle the error; if `something` is declared within the try block, it won’t be accessible here.
  console.error(e);
} finally {
  // Perform cleanup or final actions.
  // If `something` was declared within the try block, it won’t be accessible here.
  // Also, if there’s a return statement in this block, it overrides any return in the try block.
}

// Returning here is possible, and `something` is available only because it's declared outside the try-catch block.
```

### Key Points:

- Declaring variables inside the try block limits their scope to the try block, making them unavailable in catch or finally blocks.
- Return statements inside a finally block can override return statements in the try block, which can cause unexpected control flow behavior.
- To ensure variables are accessible in all blocks (try, catch, and finally), you must declare them outside the try block.

This nuanced behavior often leads to confusing code and unexpected bugs, especially in scenarios involving asynchronous operations, cleanup logic, or complex return flows.

## Goals of the Package

The goal of this package is to provide a more structured and precise way of handling errors by:

- Allowing the definition of custom catch conditions to match specific error types.
- Providing built-in conditions to catch common thrown types, including arrays, numbers, strings, and plain objects.
- Supporting a factory method to easily create conditions for class-based custom errors.
- Offering a utility function `tryCatch` that catches errors based on the provided conditions, making error handling more predictable and reducing unnecessary code clutter in catch blocks.
- Simplifying the handling of values returned from try-catch blocks and reducing scoping issues for variables shared between try, catch, and finally sections.

This approach helps you focus on handling only the errors that are relevant to your logic while rethrowing other unexpected errors. It simplifies the process of matching and processing errors, both in synchronous and asynchronous contexts, and provides a consistent error-catching strategy throughout your codebase.

### Example:

```typescript
const [error, something] = tryCatch(() => {
  // this is what standard try block would contain
  // some code that can throw
  return somevalue;
});

if (error) {
  // this is what standard catch block would contain
  console.error(e);
  // we can return here and stop code from executing
}

// this is what standard finally block would contain
// handle something and/or return it
```

## Exported Types

```typescript
export type CatchCondition = (error: unknown) => boolean;
export type TryCatchResult<T> = [undefined, T] | [unknown];
```

## Exported Catch Conditions

The package includes the following built-in CatchCondition functions:

- isArrayThrown: Checks if the thrown error is an array.
- isBigIntThrown: Checks if the thrown error is a BigInt.
- isBooleanThrown: Checks if the thrown error is a boolean.
- isErrorThrown: Checks if the thrown error is a plain Error object (i.e., not a custom error class).
- isFunctionThrown: Checks if the thrown error is a function.
- isInstanceOfErrorThrown: Checks if the thrown error is an instance of Error or any class extending Error.
- isNullThrown: Checks if the thrown error is null.
- isNumberThrown: Checks if the thrown error is a number.
- isObjectThrown: Checks if the thrown error is a plain object (i.e., not an instance of a class).
- isStringThrown: Checks if the thrown error is a string.
- isSymbolThrown: Checks if the thrown error is a symbol.
- isTypeOfObjectThrown: Checks if the thrown error is an object of any type, excluding null.
- isUndefinedThrown: Checks if the thrown error is undefined.

Additionally, you can create custom catch conditions using the following factory function:

- createCatchCondition: Creates a CatchCondition that checks if the thrown error is an instance of a specified class.

## `tryCatch` Function

### Function Signature

```typescript
export default function tryCatch<T>(
  fn: () => Promise<T>,
  catchConditions?: CatchCondition[],
): Promise<TryCatchResult<T>>;

export default function tryCatch<T>(
  fn: () => T,
  catchConditions?: CatchCondition[],
): TryCatchResult<T>;
```

### Function Description

The tryCatch function accepts a synchronous or asynchronous function fn, executes it, and catches any thrown errors based on the provided catchConditions. If no catchConditions are provided, all thrown errors will be caught.

The function returns a result in the form of a tuple:

- If the function fn executes successfully, the returned tuple is [undefined, result], where result is the value returned by fn.
- If an error is caught, the returned tuple is [error].

If an error does not match any of the provided catchConditions, it is rethrown.

### Example Usage

Catching CustomError or Error

```typescript
import tryCatch, { isInstanceOfErrorThrown } from '@pjelinski/try-catch';

class CustomError extends Error {}

const [error] = tryCatch(() => {
  throw new CustomError('Something went wrong');
}, [isInstanceOfErrorThrown]);
if (error) {
  console.error('Caught CustomError', error);
}

const [error] = tryCatch(() => {
  throw new Error('Something went wrong');
}, [isInstanceOfErrorThrown]);
if (error) {
  console.error('Caught Error', error);
}
```

Not catching CustomError

```typescript
import tryCatch, { isErrorThrown } from '@pjelinski/try-catch';

class CustomError extends Error {}

try {
  tryCatch(() => {
    throw new CustomError('Something went wrong');
  }, [isErrorThrown]);
} catch (error: unknown) {
  console.error('Custom Error was not caught but thrown instead', error);
}
```

Catching strictly Error

```typescript
import tryCatch, { isErrorThrown } from '@pjelinski/try-catch';

const [error] = tryCatch(() => {
  throw new Error('Something went wrong');
}, [isErrorThrown]);
if (error) {
  console.error('Caught Error', error);
}
```

Factory Function Example

```typescript
import { createCatchCondition } from '@pjelinski/try-catch';

class MyCustomClass {}

const isMyCustomClassThrown = createCatchCondition(MyCustomClass);

const [error, result] = tryCatch(() => {
  throw new MyCustomClass();
}, [isMyCustomClassThrown]);

if (error) {
  console.log('Caught an instance of MyCustomClass');
}
```

## License

This project is licensed under the MIT License.
