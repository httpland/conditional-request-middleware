// Copyright 2023-latest the httpland authors. All rights reserved. MIT license.
// This module is browser compatible.

/** Precondition API. */
export interface Precondition {
  /** Precondition header field name. */
  readonly field: string;

  /** Definition of precondition evaluation.
   * If return value is void, it represents ignore this precondition.
   */
  evaluate(
    request: Request,
    selectedRepresentation: Response,
  ): boolean | void | Promise<boolean | void>;

  /** Called after {@link Precondition.evaluate}.
   * If return response, it must not perform the requested method.
   * If return value is void, it represents ignore this precondition.
   */
  respond(
    request: Request,
    selectedRepresentation: Response,
    result: boolean,
  ): Response | void | Promise<Response | void>;
}
