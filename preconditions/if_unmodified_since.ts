// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ConditionalHeader,
  filterKeys,
  isNull,
  isRepresentationHeader,
  not,
  RepresentationHeader,
  Status,
} from "../deps.ts";
import type { Precondition } from "../types.ts";
import { ifUnmodifiedSince } from "./utils.ts";

/** `If-Unmodified-Since` header field precondition. */
export class IfUnmodifiedSince implements Precondition {
  field = ConditionalHeader.IfUnmodifiedSince;

  evaluate(request: Request, response: Response): boolean | undefined {
    const fieldValue = request.headers.get(ConditionalHeader.IfUnmodifiedSince);
    const lastModified = response.headers.get(
      RepresentationHeader.LastModified,
    );

    // A recipient MUST ignore If-Unmodified-Since if the request contains
    // an If-Match header field
    if (
      request.headers.has(ConditionalHeader.IfMatch) ||
      isNull(fieldValue) ||
      isNull(lastModified)
    ) return;

    return ifUnmodifiedSince(fieldValue, lastModified);
  }

  respond(
    _: Request,
    response: Response,
    result: boolean,
  ): Response | undefined {
    if (result) return;

    const headers = filterKeys(response.headers, not(isRepresentationHeader));

    return new Response(null, { status: Status.PreconditionFailed, headers });
  }
}
