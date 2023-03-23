// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

export interface Precondition {
  readonly field: string;

  evaluate(
    request: Request,
    selectedRepresentation: Response,
  ): boolean | void | Promise<boolean | void>;

  respond(
    request: Request,
    selectedRepresentation: Response,
    result: boolean,
  ): Response | void;
}
