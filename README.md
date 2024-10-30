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

- `isArrayThrown`: Checks if the thrown error is an array.
- `isBigIntThrown`: Checks if the thrown error is a BigInt.
- `isBooleanThrown`: Checks if the thrown error is a boolean.
- `isErrorThrown`: Checks if the thrown error is a plain Error object (i.e., not a custom error class).
- `isFunctionThrown`: Checks if the thrown error is a function.
- `isInstanceOfErrorThrown`: Checks if the thrown error is an instance of Error or any class extending Error.
- `isNullThrown`: Checks if the thrown error is null.
- `isNumberThrown`: Checks if the thrown error is a number.
- `isObjectThrown`: Checks if the thrown error is a plain object (i.e., not an instance of a class).
- `isStringThrown`: Checks if the thrown error is a string.
- `isSymbolThrown`: Checks if the thrown error is a symbol.
- `isTypeOfObjectThrown`: Checks if the thrown error is an object of any type, excluding null.
- `isUndefinedThrown`: Checks if the thrown error is undefined.

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

Catching All kinds of Error

```typescript
import tryCatch from '@pjelinski/try-catch';

class CustomError extends Error {}

const [error, result] = tryCatch(() => {
  if (Math.random() < 0.5) {
    throw new CustomError('Something went wrong');
  }

  return 'Success!';
});

if (error) {
  console.error('Caught CustomError', error);
  // stop code from executing
}
// handle result

const [error, result] = tryCatch(() => {
  if (Math.random() < 0.5) {
    throw new Error('Something went wrong');
  }

  return 'Success!';
});
if (error) {
  console.error('Caught Error', error);
  // stop code from executing
}
// handle result

const [error, result] = tryCatch(() => {
  if (Math.random() < 0.5) {
    throw 'Error';
  }

  return 'Success!';
});
if (error) {
  console.error('Caught Error', error);
  // stop code from executing
}
// handle result

class MyClass = {}

const [error, result] = tryCatch(() => {
  if (Math.random() < 0.5) {
    throw new MyClass();
  }

  return 'Success!';
});
if (error) {
  console.error('Caught Error', error);
  // stop code from executing
}
// handle result
```

Not specific type of error only

```typescript
import tryCatch, {
  isErrorThrown,
  isInstanceOfErrorThrown,
} from '@pjelinski/try-catch';

class CustomError extends Error {}

try {
  tryCatch(() => {
    throw new CustomError('Something went wrong');
  }, [isErrorThrown]);
} catch (error: unknown) {
  console.error('CustomError was not caught but thrown instead', error);
}

const [error] = tryCatch(() => {
  throw new Error('Something went wrong');
}, [isErrorThrown]);
if (error) {
  console.error('Caught Error', error);
}

const [error] = tryCatch(() => {
  throw new CustomError('Something went wrong');
}, [isInstanceOfErrorThrown]);
if (error) {
  console.error('Caught CustomError', error);
}
```

Factory Function Example

```typescript
import { createCatchCondition } from '@pjelinski/try-catch';

class MyCustomClass {}

const isMyCustomClassThrown = createCatchCondition(MyCustomClass);

const [error] = tryCatch(() => {
  throw new MyCustomClass();
}, [isMyCustomClassThrown]);

if (error) {
  console.log('Caught an instance of MyCustomClass');
}

try {
  tryCatch(() => {
    throw new Error('Something went wrong');
  }, [isMyCustomClassThrown]);
} catch (error: unknown) {
  console.error('Error was not caught but thrown instead', error);
}
```

Catching async function call

```typescript
const [error, result] = await tryCatch(async () => {
  return await someAsyncFunctionThatMayThrow();
});

if (error) {
  console.log('Caught an error', error);
}

// handle result
```

## Changelog

v2.x

- **Updated error-catching approach:** The implementation now uses `CatchCondition[]` instead of the previous `ErrorType[]`, enabling more flexible and granular error matching.
- **New built-in catch conditions:** Added conditions for catching thrown values such as arrays, primitive types (number, boolean, string, etc.), functions, and null/undefined.
- **Custom error matching:** Introduced `createCatchCondition` to easily create custom conditions for class-based errors.
- **Improved return handling:** Return values are now accessible consistently across all blocks (try, catch, and finally) due to external variable declaration.
- **Code cleanup and refactoring:** The codebase was restructured for enhanced readability and maintainability.

## Version History

v1.x

- Initial implementation using `ErrorType[]` to catch errors of specific types.
- Supported both synchronous and asynchronous functions with basic error handling.
- Lacked flexibility in catching non-`Error` values and primitive types.
- Scoping issues in error handling and variable declaration inside try-catch-finally blocks.

v2.x

- Replaced `ErrorType[]` with `CatchCondition[]`, offering more precise error handling based on custom conditions.
- Added built-in conditions to catch arrays, primitive values, functions, null/undefined, and more.
- Introduced `createCatchCondition` utility for creating custom class-based error-catching logic.
- Simplified error handling by ensuring consistent access to return values across all blocks.
- Enhanced code structure and modularity for better maintainability.

## Breaking Changes

The new implementation of `tryCatch` replaces the old `ErrorType[]` approach with a more flexible array of `CatchCondition[]` functions. This change introduces the following key improvements:

1. **Enhanced Error Matching Flexibility:** Catch conditions allow fine-grained control to handle any type of thrown value, including primitives, arrays, plain objects, and custom classes. This eliminates the previous limitation of handling only specific `Error` classes and makes error matching more versatile.

2. **Simplified API and Improved Consistency:** By using catch conditions instead of error classes, the API is streamlined, reducing complexity while improving predictability. This change ensures that error handling is consistently applied across various thrown types without requiring additional logic or manual error checks.

These changes result in a more powerful and user-friendly error handling experience, allowing developers to create customized conditions for any thrown value while maintaining a clear and concise API.

## License

This project is licensed under the MIT License.
