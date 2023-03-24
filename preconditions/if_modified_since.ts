// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ConditionalHeader,
  filterKeys,
  isErr,
  isNull,
  isRetrieveMethod,
  not,
  RepresentationHeader,
  Status,
  unsafe,
} from "../deps.ts";
import { isBannedHeader } from "../utils.ts";
import { ifModifiedSince } from "./utils.ts";
import type { Precondition } from "../types.ts";

/** `If-Modified-Since` header field precondition.
 *
 * @example
 * ```ts
 * import { IfModifiedSince } from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 *
 * const precondition = new IfModifiedSince();
 * const request = new Request("<uri>", {
 *   headers: { "if-modified-since": "<after:HTTP-date>" },
 * });
 * const selectedRepresentation = new Response("<content>", {
 *   headers: { "last-modified": "<before:HTTP-date>" },
 * });
 * declare const evalResult: false;
 *
 * assertEquals(precondition.field, "if-modified-since");
 * assertEquals(
 *   precondition.evaluate(request, selectedRepresentation),
 *   evalResult,
 * );
 * assertEquals(
 *   precondition.respond(request, selectedRepresentation, evalResult)?.status,
 *   304,
 * );
 * ```
 */
export class IfModifiedSince implements Precondition {
  field = ConditionalHeader.IfModifiedSince;

  evaluate(request: Request, response: Response): boolean | void {
    const fieldValue = request.headers.get(ConditionalHeader.IfModifiedSince);
    const lastModified = response.headers.get(
      RepresentationHeader.LastModified,
    );

    if (
      isNull(fieldValue) ||
      // A recipient MUST ignore If-Modified-Since if the request contains an
      // If-None-Match header field
      !isRetrieveMethod(request.method) ||
      // A recipient MUST ignore the If-Modified-Since header field if the
      // request method is neither GET nor HEAD
      request.headers.has(ConditionalHeader.IfNoneMatch) ||
      isNull(lastModified)
    ) return;

    const result = unsafe(() => ifModifiedSince(fieldValue, lastModified));

    if (isErr(result)) return;

    return result.value;
  }

  respond(_: Request, response: Response, result: boolean): Response | void {
    if (result) return;

    const headers = filterKeys(response.headers, not(isBannedHeader));

    return new Response(null, { status: Status.NotModified, headers });
  }
}
