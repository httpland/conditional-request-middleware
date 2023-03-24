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
import { ifNoneMatch, isBannedHeader } from "./utils.ts";

/** `If-None-Match` header field precondition. */
export class IfNoneMatch implements Precondition {
  field = ConditionalHeader.IfNoneMatch;

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
