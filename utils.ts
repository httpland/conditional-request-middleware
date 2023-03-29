// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ascend,
  distinct,
  filterKeys,
  isBoolean,
  isConditionalHeader,
  isNegativeNumber,
  isNull,
  isSuccessfulStatus,
  Method,
  not,
  parseAcceptRanges,
  RepresentationHeader,
  Status,
  SuccessfulStatus,
  type Token,
  toLowerCase,
} from "./deps.ts";
import type { Precondition } from "./types.ts";

export function isNotSelectionOrModificationMethod(method: string): boolean {
  return ([Method.Connect, Method.Options, Method.Trace] as string[]).includes(
    method,
  );
}

type PreEvaluableStatus = SuccessfulStatus | Status.PreconditionFailed;

export function isPreEvaluableStatus(
  status: number,
): status is PreEvaluableStatus {
  return isSuccessfulStatus(status) || Status.PreconditionFailed === status;
}

enum PreconditionPriority {
  "if-match",
  "if-unmodified-since",
  "if-none-match",
  "if-modified-since",
  "if-range",
}

export type Ord = 1 | 0 | -1;

export function toPriority(input: string): number {
  input = input.toLowerCase();

  const Order = Object.values(PreconditionPriority);

  const result = Order.indexOf(input);

  return isNegativeNumber(result) ? Infinity : result;
}

export function ascendPrecondition(
  left: Precondition,
  right: Precondition,
): Ord {
  return ascendPreconditionHeader(left.field, right.field);
}

export function ascendPreconditionHeader(
  left: string,
  right: string,
): Ord {
  const l = toPriority(left);
  const r = toPriority(right);

  return ascend(l, r);
}

export async function applyPrecondition(
  request: Request,
  response: Response,
  precondition: Precondition,
): Promise<Response | void> {
  const fieldValue = request.headers.get(precondition.field);

  if (isNull(fieldValue)) return;

  const evalResult = await precondition.evaluate(request, response);

  if (!isBoolean(evalResult)) return;

  return precondition.respond(request, response, evalResult);
}

export function isBannedHeader(fieldName: string): boolean {
  return ([
    RepresentationHeader.ContentEncoding,
    RepresentationHeader.ContentLanguage,
    RepresentationHeader.ContentLength,
    RepresentationHeader.ContentType,
  ] as string[]).includes(fieldName);
}

/** Return no precondition header. */
export function withoutConditionHeaders(
  headers: Headers,
  additionalConditionHeaders: readonly string[] = [],
): Headers {
  additionalConditionHeaders = distinct(additionalConditionHeaders)
    .map(toLowerCase);

  function isBannedHeader(key: string): boolean {
    return isConditionalHeader(key) ||
      additionalConditionHeaders.includes(key);
  }

  const newHeaders = filterKeys(headers, not(isBannedHeader));

  return newHeaders;
}

/** Whether the input has {@link Token} or not.
 * If the input is invalid [`Accept-Ranges`](https://www.rfc-editor.org/rfc/rfc9110.html#section-14.3-2) then `false`.
 */
export function hasToken(input: string, token: Token): boolean {
  try {
    return parseAcceptRanges(input).includes(token);
  } catch {
    return false;
  }
}
