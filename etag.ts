// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

// TODO(miyauci): External Packaging

import { type ETag } from "./deps.ts";

export interface StrongETag extends ETag {
  readonly weak: false;
}

export function matchWeak(left: ETag, right: ETag): boolean {
  return left.tag === right.tag;
}

export function matchStrong(left: ETag, right: ETag): boolean {
  return isStrongETag(left) && isStrongETag(right) && left.tag === right.tag;
}

export function isStrongETag(etag: ETag): etag is StrongETag {
  return !etag.weak;
}
