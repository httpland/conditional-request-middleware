import { BuildOptions } from "https://deno.land/x/dnt@0.33.1/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},
  compilerOptions: {
    lib: ["esnext", "dom", "dom.iterable"],
  },
  typeCheck: true,
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  package: {
    name: "@httpland/conditional-request-middleware",
    version,
    description: "HTTP conditional request middleware",
    keywords: [
      "http",
      "conditional-request",
      "conditional",
      "middleware",
      "etag",
      "last-modified",
      "range",
      "if-match",
      "if-none-match",
      "if-modified-since",
      "if-unmodified-since",
      "if-range",
    ],
    license: "MIT",
    homepage: "https://github.com/httpland/conditional-request-middleware",
    repository: {
      type: "git",
      url: "git+https://github.com/httpland/conditional-request-middleware.git",
    },
    bugs: {
      url: "https://github.com/httpland/conditional-request-middleware/issues",
    },
    sideEffects: false,
    type: "module",
    publishConfig: {
      access: "public",
    },
  },
  packageManager: "pnpm",
  mappings: {
    "https://deno.land/x/isx@1.3.1/is_boolean.ts": {
      name: "@miyauci/isx",
      version: "1.3.1",
      subPath: "is_boolean.js",
    },
    "https://deno.land/x/isx@1.3.1/is_null.ts": {
      name: "@miyauci/isx",
      version: "1.3.1",
      subPath: "is_null.js",
    },
    "https://deno.land/x/isx@1.3.1/is_string.ts": {
      name: "@miyauci/isx",
      version: "1.3.1",
      subPath: "is_string.js",
    },
    "https://deno.land/x/isx@1.3.1/is_number.ts": {
      name: "@miyauci/isx",
      version: "1.3.1",
      subPath: "is_number.js",
    },
    "https://deno.land/x/isx@1.3.1/number/is_negative_number.ts": {
      name: "@miyauci/isx",
      version: "1.3.1",
      subPath: "number/is_negative_number.js",
    },
    "https://deno.land/x/http_middleware@1.0.0/mod.ts": {
      name: "@httpland/http-middleware",
      version: "1.0.0",
    },
    "https://deno.land/x/http_utils@1.2.0/header.ts": {
      name: "@httpland/http-utils",
      version: "1.2.0",
      subPath: "header.js",
    },
    "https://deno.land/x/http_utils@1.2.0/method.ts": {
      name: "@httpland/http-utils",
      version: "1.2.0",
      subPath: "method.js",
    },
    "https://deno.land/x/http_utils@1.2.0/list.ts": {
      name: "@httpland/http-utils",
      version: "1.2.0",
      subPath: "list.js",
    },
    "https://deno.land/x/result_js@1.0.0/mod.ts": {
      name: "@miyauci/result",
      version: "1.0.0",
    },
    "https://deno.land/x/range_request_middleware@1.2.0/mod.ts": {
      name: "@httpland/range-request-middleware",
      version: "1.2.0",
    },
    "https://deno.land/x/accept_ranges_parser@1.0.1/mod.ts": {
      name: "@httpland/accept-ranges-parser",
      version: "1.0.1",
    },
    "https://deno.land/x/prelude_js@1.2.0/to_lower_case.ts": {
      name: "@miyauci/prelude",
      version: "1.2.0",
      subPath: "to_lower_case.js",
    },
  },
});
