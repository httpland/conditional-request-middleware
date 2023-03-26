// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import { type Handler, type Middleware } from "./deps.ts";
import type { Precondition } from "./types.ts";
import {
  applyPrecondition,
  ascendPrecondition,
  isNotSelectionOrModificationMethod,
  isPreEvaluableStatus,
  withoutConditionHeaders,
} from "./utils.ts";
import { IfNoneMatch } from "./preconditions/if_none_match.ts";
import { IfMatch } from "./preconditions/if_match.ts";
import { IfModifiedSince } from "./preconditions/if_modified_since.ts";
import { IfUnmodifiedSince } from "./preconditions/if_unmodified_since.ts";
import { IfRange } from "./preconditions/if_range.ts";

/** Middleware options. */
export interface Options {
  /** Precondition list. */
  readonly preconditions?: Iterable<Precondition>;
}

/** Create HTTP conditional requests middleware.
 *
 * @example
 * ```ts
 * import { conditionalRequest } from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
 * import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
 * import { assertSpyCalls, spy } from "https://deno.land/std/testing/mock.ts";
 *
 * const selectedRepresentation = new Response("<body>", {
 *   headers: { etag: "<etag>" },
 * });
 * const selectRepresentation = spy(() => selectedRepresentation);
 * const middleware = conditionalRequest(selectRepresentation);
 * const request = new Request("<uri>", {
 *   headers: { "if-none-match": "<etag>" },
 * });
 * const handler = spy(() => selectedRepresentation);
 *
 * const response = await middleware(request, handler);
 *
 * assertSpyCalls(handler, 0);
 * assertSpyCalls(selectRepresentation, 1);
 * assertEquals(response.status, 304);
 * ```
 */
export function conditionalRequest(
  selectRepresentation: Handler,
  options?: Options,
): Middleware {
  // TODO(miyauci): use `toSort`
  const preconditions = Array.from(
    options?.preconditions ??
      [
        new IfMatch(),
        new IfNoneMatch(),
        new IfModifiedSince(),
        new IfUnmodifiedSince(),
        new IfRange(),
      ],
  ).sort(ascendPrecondition);

  const curried = _handler.bind(null, selectRepresentation, preconditions);

  return curried;
}

/** Handle preconditions with all contexts.
 * @internal
 */
export async function _handler(
  selectRepresentation: Handler,
  preconditions: readonly Precondition[],
  request: Request,
  next: Handler,
): Promise<Response> {
  /** Likewise, a server MUST ignore the conditional request header fields defined by this specification when received with a request method that does not involve the selection or modification of a selected representation, such as CONNECT, OPTIONS, or TRACE. */
  if (isNotSelectionOrModificationMethod(request.method)) {
    return next(request);
  }

  function hasPreconditionHeader(precondition: Precondition): boolean {
    return request.headers.has(precondition.field);
  }

  const targetPreconditions = preconditions.filter(hasPreconditionHeader);

  if (!targetPreconditions.length) return next(request);

  const headers = withoutConditionHeaders(
    request.headers,
    preconditions.map(({ field }) => field),
  );

  const selectedRepresentation = await selectRepresentation(
    new Request(request, { headers }),
  );

  /** A server MUST ignore all received preconditions if its response to the same request without those conditions, prior to processing the request content, would have been a status code other than a 2xx (Successful) or 412 (Precondition Failed).
   */
  if (!isPreEvaluableStatus(selectedRepresentation.status)) {
    return next(request);
  }

  for (const precondition of targetPreconditions) {
    const maybeResponse = await applyPrecondition(
      request,
      selectedRepresentation,
      precondition,
    );

    if (!maybeResponse) continue;

    return maybeResponse;
  }

  return next(request);
}
