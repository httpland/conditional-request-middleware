import { ETag, parseETag, RepresentationHeader } from "../deps.ts";

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

  return ifMatch.some((etag) => matchStrong(etag, etagObj));
}

/** Match `If-None-Match` field and `ETag` field.
 * @throws {SyntaxError} If the input is invalid syntax.
 */
export function ifNoneMatch(fieldValue: string, etag: string): boolean {
  const ifNoneMatch = parse(fieldValue);
  const etagObj = parseETag(etag);

  if (isStar(ifNoneMatch)) return false;

  return ifNoneMatch.every((tag) => !matchWeak(tag, etagObj));
}

export function matchWeak(left: ETag, right: ETag): boolean {
  return left.tag === right.tag;
}

export function matchStrong(left: ETag, right: ETag): boolean {
  return isStrong(left) && isStrong(right) && left.tag === right.tag;
}

export function isStrong(etag: ETag): boolean {
  return !etag.weak;
}

/**
 * @throws {SyntaxError} If the input is invalid.
 */
export function ifModifiedSince(
  fieldValue: string,
  lastModified: string,
): boolean {
  // A recipient MUST ignore the If-Modified-Since header field if the
  // received field-value is not a valid HTTP-date
  const date = parseHTTPDate(fieldValue.trim());

  if (Number.isNaN(date)) {
    throw TypeError("field value is invalid <HTTP-date> format.");
  }

  const lastMod = parseHTTPDate(lastModified.trim());

  if (isNaN(lastMod)) {
    throw TypeError("last-modified is invalid <HTTP-date> format.");
  }

  // The origin server SHOULD NOT perform the requested
  // method if the selected representation's last modification date is
  // earlier than or equal to the date provided in the field-value;
  return lastMod > date;
}

/**
 * @throws {SyntaxError} If the input is invalid.
 */
export function ifUnmodifiedSince(
  fieldValue: string,
  lastModified: string,
): boolean {
  // A recipient MUST ignore the If-Modified-Since header field if the
  // received field-value is not a valid HTTP-date
  const date = parseHTTPDate(fieldValue.trim());

  if (isNaN(date)) {
    throw TypeError("field value is invalid <HTTP-date> format.");
  }

  const lastMod = parseHTTPDate(lastModified.trim());

  if (isNaN(lastMod)) {
    throw TypeError("last-modified is invalid <HTTP-date> format.");
  }

  // The origin server MUST NOT perform the requested method
  // if the selected representation's last modification date is more
  // recent than the date provided in the field-value;
  return lastMod <= date;
}

/** Whether the input is `*` or not. */
function isStar(input: unknown): input is Star {
  return input === "*";
}

export function isBannedHeader(fieldName: string): boolean {
  return ([
    RepresentationHeader.ContentEncoding,
    RepresentationHeader.ContentLanguage,
    RepresentationHeader.ContentLength,
    RepresentationHeader.ContentType,
  ] as string[]).includes(fieldName);
}

export type Star = "*";
export type IfNoneMatch = Star | ETag[];
export type IfMatch = IfNoneMatch;

/**
 * @throws {SyntaxError} If the input is invalid.
 */
export function parse(input: string): IfMatch | IfNoneMatch {
  input = input.trim();

  if (isStar(input)) return input;

  return input
    .split(",")
    .map(parseETag);
}

export function parseHTTPDate(input: string): number {
  // TODO:(miyauci) Compliant with [RFC 9110, 5.6.7. Date/Time Formats](https://www.rfc-editor.org/rfc/rfc9110.html#section-5.6.7)
  return Date.parse(input);
}
