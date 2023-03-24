// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  BytesRange,
  ConditionalHeader,
  isErr,
  isNull,
  Method,
  type Range,
  RangeHeader,
  RepresentationHeader,
  unsafe,
  withContentRange,
} from "../deps.ts";
import { Precondition } from "../types.ts";
import { ifRange } from "./utils.ts";

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

  /** An origin server MUST ignore an If-Range header field received in a request for a target resource that does not support Range requests. */
  // TODO:(miyauci) Check accept-ranges is none or not.

  const v = {
    etag: response.headers.get(RepresentationHeader.ETag),
    lastModified: response.headers.get(RepresentationHeader.LastModified),
  };

  const result = unsafe(() => ifRange(ifRangeValue, v));

  if (isErr(result)) return;

  return result.value;
}

/** `If-Range` header field precondition. */
export class IfRange implements Precondition {
  #ranges: Iterable<Range>;
  field = ConditionalHeader.IfRange;
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
