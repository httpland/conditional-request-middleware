// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

import {
  compareStrong,
  compareWeak,
  isErr,
  isString,
  parseETag,
  parseHttpDate,
  unsafe,
} from "../deps.ts";
import { parse } from "../if_match.ts";

const enum Msg {
  InvalidField = "field value is invalid <HTTP-date> format.",
  InvalidLastModified = "last-modified is invalid <HTTP-date> format.",
}

/** Match `If-Match` field and `ETag` field.
 * @throws {SyntaxError} If the input is invalid syntax.
 */
export function ifMatch(
  fieldValue: string,
  etag: string,
): boolean {
  const ifMatch = parse(fieldValue);
  const etagObj = parseETag(etag);

  if (isStar(ifMatch)) return true;

  return ifMatch.some((etag) => compareStrong(etag, etagObj));
}

/** Match `If-None-Match` field and `ETag` field.
 * @throws {SyntaxError} If the input is invalid syntax.
 */
export function ifNoneMatch(fieldValue: string, etag: string): boolean {
  const ifNoneMatch = parse(fieldValue);
  const etagObj = parseETag(etag);

  if (isStar(ifNoneMatch)) return false;

  return ifNoneMatch.every((tag) => !compareWeak(tag, etagObj));
}

/** Match `If-Modified-Since` field and `Last-Modified` field.
 * @throws {SyntaxError} If the input is invalid.
 */
export function ifModifiedSince(
  fieldValue: string,
  lastModified: string,
): boolean {
  const dateContainer = unsafe(() => parseHttpDate(fieldValue));

  if (isErr(dateContainer)) {
    throw SyntaxError(Msg.InvalidField);
  }

  const date = dateContainer.value;
  const lastModContainer = unsafe(() => parseHttpDate(lastModified));

  if (isErr(lastModContainer)) {
    throw SyntaxError(Msg.InvalidLastModified);
  }

  const lastMod = lastModContainer.value;

  // The origin server SHOULD NOT perform the requested
  // method if the selected representation's last modification date is
  // earlier than or equal to the date provided in the field-value;
  return lastMod > date;
}

/** Match `If-Unmodified-Since` field and `Last-Modified` field.
 * @throws {SyntaxError} If the input is invalid.
 */
export function ifUnmodifiedSince(
  fieldValue: string,
  lastModified: string,
): boolean {
  const dateContainer = unsafe(() => parseHttpDate(fieldValue));

  if (isErr(dateContainer)) {
    throw SyntaxError(Msg.InvalidField);
  }

  const lastModContainer = unsafe(() => parseHttpDate(lastModified));

  if (isErr(lastModContainer)) {
    throw SyntaxError(Msg.InvalidLastModified);
  }

  const date = dateContainer.value;
  const lastMod = lastModContainer.value;

  // The origin server MUST NOT perform the requested method
  // if the selected representation's last modification date is more
  // recent than the date provided in the field-value;
  return lastMod <= date;
}

export interface IfRangeHeaders {
  readonly etag?: string | null;
  readonly lastModified?: string | null;
}

/** Match `If-Range` field `ETag` and `Last-Modified` field.
 * @throws {SyntaxError} If the input is invalid.
 */
export function ifRange(fieldValue: string, headers: IfRangeHeaders): boolean {
  const { etag, lastModified } = headers;
  if (isMaybeETagFormat(fieldValue)) {
    if (!isString(etag)) throw Error();

    const left = parseETag(fieldValue);
    const right = parseETag(etag);

    return compareStrong(left, right);
  }

  if (!isString(lastModified)) throw Error();

  const leftContainer = unsafe(() => parseHttpDate(fieldValue));

  if (isErr(leftContainer)) {
    throw SyntaxError(Msg.InvalidField);
  }

  const rightContainer = unsafe(() => parseHttpDate(lastModified));

  if (isErr(rightContainer)) {
    throw SyntaxError(Msg.InvalidLastModified);
  }

  const left = leftContainer.value;
  const right = rightContainer.value;

  return left.getTime() === right.getTime();
}

function isMaybeETagFormat(input: string): boolean {
  return input.slice(0, 3).includes(`"`);
}

/** Whether the input is `*` or not. */
function isStar(input: unknown): input is Star {
  return input === "*";
}

export type Star = "*";
