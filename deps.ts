// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export {
  isSuccessfulStatus,
  Status,
  type SuccessfulStatus,
} from "https://deno.land/std@0.181.0/http/http_status.ts";
export { distinct } from "https://deno.land/std@0.181.0/collections/distinct.ts";
export { isBoolean } from "https://deno.land/x/isx@1.1.1/is_boolean.ts";
export { isNull } from "https://deno.land/x/isx@1.1.1/is_null.ts";
export { isString } from "https://deno.land/x/isx@1.1.1/is_string.ts";
export { isNumber } from "https://deno.land/x/isx@1.1.1/is_number.ts";
export { isNegativeNumber } from "https://deno.land/x/isx@1.1.1/number/is_negative_number.ts";
export { toLowerCase } from "https://deno.land/x/prelude_js@1.0.0/to_lower_case.ts";
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
} from "https://deno.land/x/http_utils@1.0.0/header.ts";
export {
  isRetrieveMethod,
  Method,
} from "https://deno.land/x/http_utils@1.0.0/method.ts";
export {
  compareStrong,
  compareWeak,
  type ETag,
  type ETagFormat,
  parseETag,
} from "https://deno.land/x/etag_parser@1.1.0/mod.ts";
export { isErr, unsafe } from "https://deno.land/x/result_js@1.0.0/mod.ts";
export { ascend } from "https://deno.land/std@0.181.0/collections/_comparators.ts";
export { withContentRange } from "https://deno.land/x/range_request_middleware@1.2.0/transform.ts";
export {
  type BytesContext,
  BytesRange,
  type ComputeBoundary,
  type IntRange,
  type OtherRange,
  type Range,
  type RangeSet,
  type RangeSpec,
  type RangesSpecifier,
  type SuffixRange,
} from "https://deno.land/x/range_request_middleware@1.2.0/mod.ts";
export { default as parseHttpDate } from "https://esm.sh/http-dates@1.2.0";
export {
  parseAcceptRanges,
  type Token,
} from "https://deno.land/x/accept_ranges_parser@1.0.0/mod.ts";
export { parseListFields } from "https://deno.land/x/http_utils@1.2.0/list.ts";

export function not<T extends readonly unknown[]>(
  fn: (...args: T) => boolean,
): (...args: T) => boolean {
  return (...args) => !fn(...args);
}
