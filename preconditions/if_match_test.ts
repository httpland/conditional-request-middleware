import {
  assert,
  assertEquals,
  ConditionalHeader,
  describe,
  equalsResponse,
  it,
  RepresentationHeader,
  Status,
} from "../_dev_deps.ts";
import { IfMatch } from "./if_match.ts";

describe("IfMatch", () => {
  it("should be if-match", () => {
    assertEquals(new IfMatch().field, ConditionalHeader.IfMatch);
  });

  describe("evaluate", () => {
    it("should return undefined if the request or response is invalid", () => {
      const table: [Request, Response][] = [
        [new Request("test:"), new Response()],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: "" },
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
              [ConditionalHeader.IfMatch]: "",
              [RepresentationHeader.ETag]: "",
            },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assertEquals(new IfMatch().evaluate(request, response), undefined);
      });
    });

    it("should return false if the etag does not match", () => {
      const table: [Request, Response][] = [
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: `"abc"` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `""` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: `"abc", "bcd"` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `""` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: `W/""` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `W/""` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: `W/"", ""` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `W/""` },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assertEquals(new IfMatch().evaluate(request, response), false);
      });
    });

    it("should return true if the etag match", () => {
      const table: [Request, Response][] = [
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: `*` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `""` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: `"abc"` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `"abc"` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: ` "abc" ` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: ` "abc" ` },
          }),
        ],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfMatch]: `"a", "b", "c"` },
          }),
          new Response(null, {
            headers: { [RepresentationHeader.ETag]: `"b"` },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assert(new IfMatch().evaluate(request, response));
      });
    });
  });

  describe("respond", () => {
    it("should return undefined if the result is true", () => {
      assertEquals(
        new IfMatch().respond(new Request("test:"), new Response(), true),
        undefined,
      );
    });

    it("should return 412 response if the result is false", () => {
      const table: [Request, Response, Response][] = [
        [
          new Request("test:"),
          new Response(),
          new Response(null, { status: Status.PreconditionFailed }),
        ],
        [
          new Request("test:"),
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
        const res = new IfMatch().respond(request, response, false);

        assert(res);
        assert(
          await equalsResponse(res, expected, true),
        );
      });
    });
  });
});
