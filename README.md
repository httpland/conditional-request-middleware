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
selected representation.

The following example evaluates the `If-None-Match` precondition and controls
the handler.

```ts
import { conditionalRequest } from "https://deno.land/x/conditional_request_middleware@$VERSION/mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { assertSpyCalls, spy } from "https://deno.land/std/testing/mock.ts";

const selectedRepresentation = new Response("<body>", {
  headers: { etag: "<etag>" },
});
const selectRepresentation = spy(() => selectedRepresentation);
const middleware = conditionalRequest(selectRepresentation);
const request = new Request("<uri>", {
  headers: { "if-none-match": "<etag>" },
});
const handler = spy(() => selectedRepresentation);

const response = await middleware(request, handler);

assertSpyCalls(handler, 0);
assertSpyCalls(selectRepresentation, 1);
assertEquals(response.status, 304);
```

## Preconditions

[RFC 9110, 13.1. Preconditions](https://www.rfc-editor.org/rfc/rfc9110#section-13.1)
compliant and supports the following precondition:

- If-Match
- If-None-Match
- If-Modified-Since
- If-Unmodified-Since
- If-Range

If multiple precondition headers are present, precondition is processed
according to
[precedence](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.2.2).

## Effects

Middleware will effect following:

- HTTP response status
  - [304 (Not Modified)](https://www.rfc-editor.org/rfc/rfc9110#section-15.4.5)
  - [412 (Precondition Failed)](https://www.rfc-editor.org/rfc/rfc9110#section-15.5.13)

## Conditions

Middleware will execute only if the following conditions are met:

- The precondition header exists
  - `If-Match`
    - The `ETag` header exist
  - `If-None-Match`
    - The `ETag` header exist
  - `If-Modified-Since`
    - The `Last-Modified` header exist
  - `If-Unmodified-Since`
    - The `Last-Modified` header exist

## License

Copyright © 2023-present [httpland](https://github.com/httpland).

Released under the [MIT](./LICENSE) license
