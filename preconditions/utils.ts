import {
  ETag,
  isString,
  isValidDate,
  parseETag,
  parseHttpDate,
  RepresentationHeader,
} from "../deps.ts";

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
  const date = parseHttpDate(fieldValue.trim());

  if (!isValidDate(date)) {
    throw TypeError("field value is invalid <HTTP-date> format.");
  }

  const lastMod = parseHttpDate(lastModified.trim());

  if (!isValidDate(lastMod)) {
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
  const date = parseHttpDate(fieldValue.trim());

  if (!isValidDate(date)) {
    throw TypeError("field value is invalid <HTTP-date> format.");
  }

  const lastMod = parseHttpDate(lastModified.trim());

  if (!isValidDate(lastMod)) {
    throw TypeError("last-modified is invalid <HTTP-date> format.");
  }

  // The origin server MUST NOT perform the requested method
  // if the selected representation's last modification date is more
  // recent than the date provided in the field-value;
  return lastMod <= date;
}

export interface IfRangeHeaders {
  readonly etag?: string | null;
  readonly lastModified?: string | null;
}

/**
 * @throws {SyntaxError} If the input is invalid.
 */
export function ifRange(fieldValue: string, headers: IfRangeHeaders): boolean {
  const { etag, lastModified } = headers;
  if (isMaybeETagFormat(fieldValue)) {
    if (!isString(etag)) throw Error();

    const left = parseETag(fieldValue);
    const right = parseETag(etag);

    return matchStrong(left, right);
  }

  if (!isString(lastModified)) throw Error();

  const left = parseHttpDate(fieldValue);

  if (!isValidDate(left)) {
    throw TypeError("field value is invalid <HTTP-date> format.");
  }

  const right = parseHttpDate(lastModified);

  if (!isValidDate(right)) {
    throw TypeError("last-modified is invalid <HTTP-date> format.");
  }

  return left.getTime() === right.getTime();
}

function isMaybeETagFormat(input: string): boolean {
  return input.slice(0, 3).includes(`"`);
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
