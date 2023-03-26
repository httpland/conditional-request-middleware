# conditional-request-middleware

HTTP conditional request middleware.

Compliant with
[RFC 9110, 13. Conditional Requests](https://www.rfc-editor.org/rfc/rfc9110#section-13)

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno)](https://deno.land/x/conditional_request_middleware)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/conditional_request_middleware/mod.ts)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/httpland/conditional-request-middleware)](https://github.com/httpland/conditional-request-middleware/releases)
[![codecov](https://codecov.io/gh/httpland/conditional-request-middleware/branch/main/graph/badge.svg)](https://codecov.io/gh/httpland/conditional-request-middleware)
[![GitHub](https://img.shields.io/github/license/httpland/conditional-request-middleware)](https://github.com/httpland/conditional-request-middleware/blob/main/LICENSE)

[![test](https://github.com/httpland/conditional-request-middleware/actions/workflows/test.yaml/badge.svg)](https://github.com/httpland/conditional-request-middleware/actions/workflows/test.yaml)
[![NPM](https://nodei.co/npm/@httpland/conditional-request-middleware.png?mini=true)](https://nodei.co/npm/@httpland/conditional-request-middleware/)

## Middleware

For a definition of Universal HTTP middleware, see the
[http-middleware](https://github.com/httpland/http-middleware) project.

## Usage

To evaluate precondition, you need to provide
[select representation](#select-representation) function to retrieve the
[selected representation](https://www.rfc-editor.org/rfc/rfc9110#selected.representation).

The following example evaluates the `If-None-Match` precondition and handle
response.

```ts
import {
  conditionalRequest,
  type Handler,
} from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
import {
  assertEquals,
  assertFalse,
} from "https://deno.land/std/testing/asserts.ts";
import { assertSpyCalls, spy } from "https://deno.land/std/testing/mock.ts";

const selectRepresentation = spy((request: Request) => {
  return new Response("<body>", { headers: { etag: "<etag>" } });
});
const middleware = conditionalRequest(selectRepresentation);
const request = new Request("<uri>", {
  headers: { "if-none-match": "<etag>" },
});
declare const _handler: Handler;
const handler = spy(_handler);

const response = await middleware(request, handler);

assertSpyCalls(handler, 0);
assertSpyCalls(selectRepresentation, 1);
assertEquals(response.status, 304);
assertFalse(response.body);
```

## Select representation

The evaluation of the pre-conditions is always done on the selected
representation.

You must provide a function to retrieve the representation.

Selecting representation is the following interface:

```ts
interface SelectRepresentation {
  (request: Request): Response | Promise<Response>;
}
```

It is executed prior to the handler when a request with a precondition header is
received.

The `Request` object passed to select representation has fileted the conditional
header.

It satisfies the following requirement.

> A server MUST ignore all received preconditions if its response to the same
> request without those conditions, prior to processing the request content,
> would have been a status code other than a 2xx (Successful) or 412
> (Precondition Failed).

## Preconditions

Middleware supports all preconditions compliant with
[RFC 9110, 13.1. Preconditions](https://www.rfc-editor.org/rfc/rfc9110#section-13.1)
by default.

If you want to adapt only some of the preconditions, give a list of them.

Example of middleware that handles only `If-None-Match` and `If-Modified-Since`
headers:

```ts
import {
  conditionalRequest,
  type Handler,
  IfModifiedSince,
  IfNoneMatch,
} from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";

declare const selectRepresentation: Handler;

const middleware = conditionalRequest(selectRepresentation, {
  preconditions: [new IfNoneMatch(), new IfModifiedSince()],
});
```

Don't worry about the order of preconditions. They will be sorted appropriately
based on the
[13.2.2. Precedence of Preconditions](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.2.2).

### Middleware default

The Middleware factory default values are as follows:

```ts
import {
  BytesRange,
  conditionalRequest,
  type Handler,
  IfMatch,
  IfModifiedSince,
  IfNoneMatch,
  IfRange,
  IfUnmodifiedSince,
} from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";

declare const selectRepresentation: Handler;
const DEFAULT_PRECONDITIONS = [
  new IfMatch(),
  new IfNoneMatch(),
  new IfModifiedSince(),
  new IfUnmodifiedSince(),
  new IfRange([new BytesRange()]),
];

const middleware = conditionalRequest(selectRepresentation, {
  preconditions: DEFAULT_PRECONDITIONS,
});
```

## Precondition

`Precondition` is following structured object.

```ts
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
```

`Precondition` abstracts the evaluation of a precondition and its response.

Provide all preconditions compliant with
[RFC 9110, 13.1. Preconditions](https://www.rfc-editor.org/rfc/rfc9110#section-13.1)

- [If-Match](#ifmatch)
- [If-None-Match](#ifnonematch)
- [If-Modified-Since](#ifmodifiedsince)
- [If-Unmodified-Since](#ifunmodifiedsince)
- [If-Range](#ifrange)

If you implement a `Precondition` that is not in the specification, make sure
[extensibility of preconditions](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1-3).

### IfMatch

`If-Match` header field precondition.

```ts
import { IfMatch } from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const precondition = new IfMatch();
const request = new Request("<uri>", {
  headers: { "if-match": "<strong:etag>" },
});
const selectedRepresentation = new Response("<content>", {
  headers: { etag: "<weak:etag>" },
});
declare const evalResult: false;

assertEquals(precondition.field, "if-match");
assertEquals(
  precondition.evaluate(request, selectedRepresentation),
  evalResult,
);
assertEquals(
  precondition.respond(request, selectedRepresentation, evalResult)?.status,
  412,
);
```

#### Effects

Precondition will effect following:

If evaluation is `false`:

- HTTP content
- HTTP response status
  - [412 (Precondition Failed)](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.13)
- HTTP headers
  - [Representation headers](https://www.rfc-editor.org/rfc/rfc9110.html#section-8)

### IfNoneMatch

`If-None-Match` header field precondition.

```ts
import { IfNoneMatch } from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const precondition = new IfNoneMatch();
const request = new Request("<uri>", {
  headers: { "if-none-match": "<weak:etag>" },
});
const selectedRepresentation = new Response("<content>", {
  headers: { etag: "<weak:etag>" },
});
declare const evalResult: false;

assertEquals(precondition.field, "if-none-match");
assertEquals(
  precondition.evaluate(request, selectedRepresentation),
  evalResult,
);
assertEquals(
  precondition.respond(request, selectedRepresentation, evalResult)?.status,
  304,
);
```

#### Effects

Precondition will effect following:

If evaluation is `false`:

- HTTP content
- HTTP response status
  - [304 (Not Modified)](https://www.rfc-editor.org/rfc/rfc9110#section-15.4.5)
  - [412 (Precondition Failed)](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.13)
- HTTP headers
  - [Representation headers](https://www.rfc-editor.org/rfc/rfc9110.html#section-8)

### IfModifiedSince

`If-Modified-Since` header field precondition.

```ts
import { IfModifiedSince } from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const precondition = new IfModifiedSince();
const request = new Request("<uri>", {
  headers: { "if-modified-since": "<after:HTTP-date>" },
});
const selectedRepresentation = new Response("<content>", {
  headers: { "last-modified": "<before:HTTP-date>" },
});
declare const evalResult: false;

assertEquals(precondition.field, "if-modified-since");
assertEquals(
  precondition.evaluate(request, selectedRepresentation),
  evalResult,
);
assertEquals(
  precondition.respond(request, selectedRepresentation, evalResult)?.status,
  304,
);
```

#### Effects

Precondition will effect following:

If evaluation is `false`:

- HTTP content
- HTTP response status
  - [304 (Not Modified)](https://www.rfc-editor.org/rfc/rfc9110#section-15.4.5)
- HTTP headers
  - Content-Type
  - Content-Encoding
  - Content-Length
  - Content-Language

### IfUnmodifiedSince

`If-Unmodified-Since` header field precondition.

```ts
import { IfUnmodifiedSince } from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const precondition = new IfUnmodifiedSince();
const request = new Request("<uri>", {
  headers: { "if-unmodified-since": "<before:HTTP-date>" },
});
const selectedRepresentation = new Response("<content>", {
  headers: { "last-modified": "<after:HTTP-date>" },
});
declare const evalResult: false;

assertEquals(precondition.field, "if-unmodified-since");
assertEquals(
  precondition.evaluate(request, selectedRepresentation),
  evalResult,
);
assertEquals(
  precondition.respond(request, selectedRepresentation, evalResult)?.status,
  412,
);
```

#### Effects

Precondition will effect following:

If evaluation is `false`:

- HTTP content
- HTTP response status
  - [412 (Precondition Failed)](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.13)
- HTTP headers
  - [Representation headers](https://www.rfc-editor.org/rfc/rfc9110.html#section-8)

### IfRange

`If-Range` header field precondition.

```ts
import { IfRange } from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

const precondition = new IfRange();
const request = new Request("<uri>", {
  headers: { "if-range": "<strong:etag>", range: "<range-unit>=<range-set>" },
});
const selectedRepresentation = new Response("<content>", {
  headers: { etag: "<strong:etag>" },
});
declare const evalResult: false;

assertEquals(precondition.field, "if-range");
assertEquals(
  precondition.evaluate(request, selectedRepresentation),
  evalResult,
);
assertEquals(
  (await precondition.respond(request, selectedRepresentation, evalResult))
    ?.status,
  206,
);
```

#### Effects

Precondition will effect following:

If evaluation is `true`:

- HTTP content
- HTTP response status
  - [206 (Partial Content)](https://www.rfc-editor.org/rfc/rfc9110#section-15.3.7)
  - [416 (Range Not Satisfiable)](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.17)
- HTTP headers
  - Content-Range
  - Content-Type

## Conditions

Middleware will execute only if the following conditions are met:

- Request is conditional request
- Request method is not `CONNECT`, `OPTIONS` or `TRACE`
- Select representation status is `2xx` or `412`

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
