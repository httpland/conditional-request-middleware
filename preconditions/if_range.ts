// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  BytesRange,
  ConditionalHeader,
  isErr,
  isNull,
  isString,
  Method,
  type Range,
  RangeHeader,
  RepresentationHeader,
  unsafe,
  withContentRange,
} from "../deps.ts";
import { Precondition } from "../types.ts";
import { ifRange } from "./utils.ts";
import { hasToken } from "../utils.ts";

const enum RangeUnit {
  None = "none",
}

export function evaluateIfRange(
  request: Request,
  response: Response,
): boolean | undefined {
  const ifRangeValue = request.headers.get(ConditionalHeader.IfRange);

  /** A server MUST ignore an If-Range header field received in a request that does not contain a Range header field. */
  if (
    request.method !== Method.Get ||
    isNull(ifRangeValue) ||
    !request.headers.has(RangeHeader.Range)
  ) return;

  const acceptRanges = response.headers.get(RangeHeader.AcceptRanges);

  /** An origin server MUST ignore an If-Range header field received in a request for a target resource that does not support Range requests. */
  if (isString(acceptRanges) && hasToken(acceptRanges, RangeUnit.None)) return;

  const headers = {
    etag: response.headers.get(RepresentationHeader.ETag),
    lastModified: response.headers.get(RepresentationHeader.LastModified),
  };

  const result = unsafe(() => ifRange(ifRangeValue, headers));

  if (isErr(result)) return;

  return result.value;
}

/** `If-Range` header field precondition.
 *
 * @example
 * ```ts
 * import { IfRange } from "https://deno.land/x/conditional_request_middleware@$VERSION/preconditions/if_range.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 *
 * const precondition = new IfRange();
 * const request = new Request("<uri>", {
 *   headers: { "if-range": "<strong:etag>", range: "<range-unit>=<range-set>" },
 * });
 * const selectedRepresentation = new Response("<content>", {
 *   headers: { etag: "<strong:etag>" },
 * });
 * declare const evalResult: false;
 *
 * assertEquals(precondition.field, "if-range");
 * assertEquals(
 *   precondition.evaluate(request, selectedRepresentation),
 *   evalResult,
 * );
 * assertEquals(
 *   (await precondition.respond(request, selectedRepresentation, evalResult))
 *     ?.status,
 *   206,
 * );
 * ```
 */
export class IfRange implements Precondition {
  #ranges: Iterable<Range>;
  field: `${ConditionalHeader.IfRange}` = ConditionalHeader.IfRange;
  evaluate = evaluateIfRange;

  constructor(ranges?: Iterable<Range>) {
    this.#ranges = ranges ?? [new BytesRange()];
  }

  respond(
    request: Request,
    response: Response,
    result: boolean,
  ): Response | Promise<Response> {
    const rangeValue = request.headers.get(RangeHeader.Range);

    if (!result || isNull(rangeValue)) return response;

    return withContentRange(response, { rangeValue, ranges: this.ranges });
  }

  get ranges(): Iterable<Range> {
    return this.#ranges;
  }
}
