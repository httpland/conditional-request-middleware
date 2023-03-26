// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isSuccessfulStatus,
  Status,
  type SuccessfulStatus,
} from "https://deno.land/std@0.180.0/http/http_status.ts";
export { distinct } from "https://deno.land/std@0.181.0/collections/distinct.ts";
export {
  isBoolean,
  isNegativeNumber,
  isNull,
  isNumber,
  isString,
  isValidDate,
} from "https://deno.land/x/isx@1.0.0-beta.24/mod.ts";
export {
  type Handler,
  type Middleware,
} from "https://deno.land/x/http_middleware@1.0.0/mod.ts";
export {
  ConditionalHeader,
  filterKeys,
  isConditionalHeader,
  isRepresentationHeader,
  RangeHeader,
  RepresentationHeader,
} from "https://deno.land/x/http_utils@1.0.0-beta.14/header.ts";
export {
  isRetrieveMethod,
  Method,
} from "https://deno.land/x/http_utils@1.0.0-beta.14/method.ts";
export {
  type ETag,
  type ETagFormat,
  parse as parseETag,
} from "https://deno.land/x/etag_parser@1.0.0/mod.ts";
export { isErr, unsafe } from "https://deno.land/x/result_js@1.0.0/mod.ts";
export { ascend } from "https://deno.land/std@0.180.0/collections/_comparators.ts";
export { withContentRange } from "https://deno.land/x/range_request_middleware@1.0.0/transform.ts";
export {
  BytesRange,
  type Range,
} from "https://deno.land/x/range_request_middleware@1.0.0/mod.ts";
export { default as parseHttpDate } from "https://esm.sh/http-dates@1.2.0";

export function not<T extends readonly unknown[]>(
  fn: (...args: T) => boolean,
): (...args: T) => boolean {
  return (...args) => !fn(...args);
}
