import {
  assert,
  assertEquals,
  ConditionalHeader,
  describe,
  equalsResponse,
  it,
  Method,
  RepresentationHeader,
  Status,
} from "../_dev_deps.ts";
import { IfNoneMatch } from "./if_none_match.ts";

describe("IfNoneMatch", () => {
  it("should be if-none-match", () => {
    assertEquals(new IfNoneMatch().field, ConditionalHeader.IfNoneMatch);
  });

  describe("evaluate", () => {
    it("should return undefined if the request or response is invalid", () => {
      const table: [Request, Response][] = [
        [new Request("test:"), new Response()],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfNoneMatch]: "" },
          }),
          new Response(),
        ],
        [
          new Request("test:"),
          new Response(null, { headers: { [RepresentationHeader.ETag]: "" } }),
        ],
        [
          new Request("test:"),
          new Response(null, {
            headers: {
              [ConditionalHeader.IfNoneMatch]: "",
              [RepresentationHeader.ETag]: "",
            },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assertEquals(new IfNoneMatch().evaluate(request, response), undefined);
      });
    });

    it("should return true if the etag does not match", () => {
      const table: [Request, Response][] = [
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfNoneMatch]: `"abc"` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `""` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfNoneMatch]: `"abc", "bcd"` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `""` },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assert(new IfNoneMatch().evaluate(request, response));
      });
    });

    it("should return false if the etag does not match", () => {
      const table: [Request, Response][] = [
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfNoneMatch]: `*` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `""` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfNoneMatch]: `"abc", ""` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `""` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfNoneMatch]: `"abc", W/""` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `W/""` },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assertEquals(new IfNoneMatch().evaluate(request, response), false);
      });
    });
  });

  describe("respond", () => {
    it("should return undefined if the result is true", () => {
      assertEquals(
        new IfNoneMatch().respond(new Request("test:"), new Response(), true),
        undefined,
      );
    });

    it("should return 314 response if the request is GET or HEAD", () => {
      const table: [Request, Response, Response][] = [
        [
          new Request("test:"),
          new Response(),
          new Response(null, { status: Status.NotModified }),
        ],
        [
          new Request("test:", { method: Method.Head }),
          new Response(),
          new Response(null, { status: Status.NotModified }),
        ],
        [
          new Request("test:"),
          new Response(null, {
            headers: { "x-test": "test", "content-type": "" },
          }),
          new Response(null, {
            status: Status.NotModified,
            headers: { "x-test": "test" },
          }),
        ],
      ];

      table.map(async ([request, response, expected]) => {
        const res = new IfNoneMatch().respond(request, response, false);

        assert(res);
        assert(
          await equalsResponse(res, expected, true),
        );
      });
    });

    it("should return 412 response if the request is not GET or HEAD", () => {
      const table: [Request, Response, Response][] = [
        [
          new Request("test:", { method: Method.Patch }),
          new Response(),
          new Response(null, { status: Status.PreconditionFailed }),
        ],
        [
          new Request("test:", { method: Method.Patch }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: "", "x-test": "test" },
          }),
          new Response(null, {
            status: Status.PreconditionFailed,
            headers: { "x-test": "test" },
          }),
        ],
      ];

      table.map(async ([request, response, expected]) => {
        const res = new IfNoneMatch().respond(request, response, false);

        assert(res);
        assert(
          await equalsResponse(res, expected, true),
        );
      });
    });
  });
});
