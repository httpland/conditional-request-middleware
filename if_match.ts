// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

// TODO(miyauci): External Packaging

import { type ETag, parseETag, parseListFields } from "./deps.ts";

export type IfMatch = Star | ETag[];
export type IfNoneMatch = IfMatch;
export type Star = "*";

/** Parses string into {@link IfMatch}({@link IfNoneMatch}).
 * @throws {SyntaxError} If the input is invalid.
 */
export function parse(input: string): IfMatch | IfNoneMatch {
  if (input === "*") return input;

  return parseListFields(input).map(parseETag);
}
