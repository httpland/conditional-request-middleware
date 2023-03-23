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
import { ifModifiedSince, isBannedHeader } from "./utils.ts";
import type { Precondition } from "../types.ts";

/** `If-Modified-Since` header field precondition. */
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
