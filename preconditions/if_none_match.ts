// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ConditionalHeader,
  filterKeys,
  isErr,
  isNull,
  isRepresentationHeader,
  isRetrieveMethod,
  not,
  RepresentationHeader,
  Status,
  unsafe,
} from "../deps.ts";
import type { Precondition } from "../types.ts";
import { ifNoneMatch } from "./utils.ts";
import { isBannedHeader } from "../utils.ts";

/** `If-None-Match` header field precondition.
 *
 * @example
 * ```ts
 * import { IfNoneMatch } from "https://deno.land/x/conditional_request_middleware@$VERSION/preconditions/if_none_match.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 *
 * const precondition = new IfNoneMatch();
 * const request = new Request("<uri>", {
 *   headers: { "if-none-match": "<weak:etag>" },
 * });
 * const selectedRepresentation = new Response("<content>", {
 *   headers: { etag: "<weak:etag>" },
 * });
 * declare const evalResult: false;
 *
 * assertEquals(precondition.field, "if-none-match");
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
export class IfNoneMatch implements Precondition {
  field: `${ConditionalHeader.IfNoneMatch}` = ConditionalHeader.IfNoneMatch;

  evaluate(request: Request, response: Response): boolean | undefined {
    const fieldValue = request.headers.get(ConditionalHeader.IfNoneMatch);
    const etagValue = response.headers.get(RepresentationHeader.ETag);

    if (isNull(fieldValue) || isNull(etagValue)) return;

    const result = unsafe(() => ifNoneMatch(fieldValue, etagValue));

    if (isErr(result)) return;

    return result.value;
  }

  respond(
    request: Request,
    response: Response,
    result: boolean,
  ): Response | undefined {
    if (result) return;

    if (isRetrieveMethod(request.method)) {
      const headers = filterKeys(response.headers, not(isBannedHeader));

      return new Response(null, { status: Status.NotModified, headers });
    }

    const headers = filterKeys(response.headers, not(isRepresentationHeader));

    return new Response(null, { status: Status.PreconditionFailed, headers });
  }
}
