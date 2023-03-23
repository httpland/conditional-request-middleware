// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  ascend,
  isBoolean,
  isNegativeNumber,
  isNull,
  isSuccessfulStatus,
  Method,
  Status,
  SuccessfulStatus,
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
