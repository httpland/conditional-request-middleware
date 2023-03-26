import { BuildOptions } from "https://deno.land/x/dnt@0.33.1/mod.ts";

export const makeOptions = (version: string): BuildOptions => ({
  test: false,
  shims: {},
  compilerOptions: {
    lib: ["esnext", "dom", "dom.iterable"],
  },
  typeCheck: false,
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
    "https://deno.land/x/isx@1.0.0/is_boolean.ts": {
      name: "@miyauci/isx",
      version: "1.0.0",
      subPath: "is_boolean",
    },
    "https://deno.land/x/isx@1.0.0/is_null.ts": {
      name: "@miyauci/isx",
      version: "1.0.0",
      subPath: "is_null",
    },
    "https://deno.land/x/isx@1.0.0/is_string.ts": {
      name: "@miyauci/isx",
      version: "1.0.0",
      subPath: "is_string",
    },
    "https://deno.land/x/isx@1.0.0/is_number.ts": {
      name: "@miyauci/isx",
      version: "1.0.0",
      subPath: "is_number",
    },
    "https://deno.land/x/isx@1.0.0/number/is_negative_number.ts": {
      name: "@miyauci/isx",
      version: "1.0.0",
      subPath: "number/is_negative_number",
    },
    "https://deno.land/x/isx@1.0.0/date/is_valid_date.ts": {
      name: "@miyauci/isx",
      version: "1.0.0",
      subPath: "date/is_valid_date",
    },
    "https://deno.land/x/http_middleware@1.0.0/mod.ts": {
      name: "@httpland/http-middleware",
      version: "1.0.0",
    },
    "https://deno.land/x/http_utils@1.0.0-beta.14/header.ts": {
      name: "@httpland/http-utils",
      version: "1.0.0-beta.14",
    },
    "https://deno.land/x/http_utils@1.0.0-beta.14/method.ts": {
      name: "@httpland/http-utils",
      version: "1.0.0-beta.14",
    },
    "https://deno.land/x/etag_parser@1.0.0/mod.ts": {
      name: "@httpland/etag-parser",
      version: "1.0.0",
    },
    "https://deno.land/x/result_js@1.0.0/mod.ts": {
      name: "@miyauci/result",
      version: "1.0.0",
    },
    "https://deno.land/x/range_request_middleware@1.0.0/mod.ts": {
      name: "@httpland/range-request-middleware",
      version: "1.0.0",
    },
  },
});
