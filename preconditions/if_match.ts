// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ConditionalHeader,
  filterKeys,
  isErr,
  isNull,
  isRepresentationHeader,
  not,
  RepresentationHeader,
  Status,
  unsafe,
} from "../deps.ts";
import type { Precondition } from "../types.ts";
import { ifMatch } from "./utils.ts";

/** `If-Match` header field precondition. */
export class IfMatch implements Precondition {
  field = ConditionalHeader.IfMatch;

  evaluate(request: Request, response: Response): boolean | undefined {
    const fieldValue = request.headers.get(ConditionalHeader.IfMatch);
    const etagValue = response.headers.get(RepresentationHeader.ETag);

    if (isNull(fieldValue) || isNull(etagValue)) return;

    const result = unsafe(() => ifMatch(fieldValue, etagValue));

    if (isErr(result)) return;

    return result.value;
  }

  respond(
    _: unknown,
    response: Response,
    result: boolean,
  ): undefined | Response {
    if (result) return;

    const headers = filterKeys(response.headers, not(isRepresentationHeader));

    return new Response(null, { status: Status.PreconditionFailed, headers });
  }
}
