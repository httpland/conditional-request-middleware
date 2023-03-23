// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isSuccessfulStatus,
  Status,
  type SuccessfulStatus,
} from "https://deno.land/std@0.180.0/http/http_status.ts";
export {
  isBoolean,
  isNegativeNumber,
  isNull,
  isNumber,
  isValidDate,
} from "https://deno.land/x/isx@1.0.0-beta.24/mod.ts";
export {
  type Handler,
  type Middleware,
} from "https://deno.land/x/http_middleware@1.0.0/mod.ts";
export {
  ConditionalHeader,
  filterKeys,
  isRepresentationHeader,
  parseFieldValue,
  RangeHeader,
  RepresentationHeader,
} from "https://deno.land/x/http_utils@1.0.0-beta.14/header.ts";
export {
  isRetrieveMethod,
  Method,
} from "https://deno.land/x/http_utils@1.0.0-beta.14/method.ts";
export { ascend } from "https://deno.land/std@0.180.0/collections/_comparators.ts";

export function not<T extends readonly unknown[]>(
  fn: (...args: T) => boolean,
): (...args: T) => boolean {
  return (...args) => !fn(...args);
}

/**
 * Make an assertion that actual is not null or undefined.
 * If not then throw.
 */
export function assertExists<T>(
  actual: T,
  msg?: string,
): asserts actual is NonNullable<T> {
  if (actual === undefined || actual === null) {
    if (!msg) {
      msg = `actual: "${actual}" expected to not be null or undefined`;
    }
    throw new TypeError(msg);
  }
}