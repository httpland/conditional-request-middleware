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

To evaluate precondition, you need to provide a function to retrieve the
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

## Precondition

[RFC 9110, 13.1. Preconditions](https://www.rfc-editor.org/rfc/rfc9110#section-13.1)
compliant and supports the following precondition:

- [If-Match](#ifmatch)
- [If-None-Match](#ifnonematch)
- [If-Modified-Since](#ifmodifiedsince)
- [If-Unmodified-Since](#ifunmodifiedsince)
- [If-Range](#ifrange)

If multiple precondition headers are present, precondition is processed
according to
[precedence](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.2.2).

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
