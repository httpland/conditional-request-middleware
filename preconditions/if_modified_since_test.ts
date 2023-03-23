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
import { IfModifiedSince } from "./if_modified_since.ts";

describe("IfModifiedSince", () => {
  it("should be if-modified-match", () => {
    assertEquals(
      new IfModifiedSince().field,
      ConditionalHeader.IfModifiedSince,
    );
  });

  describe("evaluate", () => {
    it("should return undefined if the request is not GET or HEAD", () => {
      assertEquals(
        new IfModifiedSince().evaluate(
          new Request("test:", {
            method: Method.Post,
            headers: {
              [ConditionalHeader.IfModifiedSince]: new Date("2000/1/1")
                .toUTCString(),
            },
          }),
          new Response(null, {
            headers: {
              [RepresentationHeader.LastModified]: new Date("2000/1/1")
                .toUTCString(),
            },
          }),
        ),
        undefined,
      );
    });

    it("should return undefined if the request has If-None-Match header", () => {
      assertEquals(
        new IfModifiedSince().evaluate(
          new Request("test:", {
            headers: {
              [ConditionalHeader.IfModifiedSince]: new Date("2000/1/1")
                .toUTCString(),
              [ConditionalHeader.IfNoneMatch]: "",
            },
          }),
          new Response(null, {
            headers: {
              [RepresentationHeader.LastModified]: new Date("2000/1/1")
                .toUTCString(),
            },
          }),
        ),
        undefined,
      );
    });

    it("should return undefined if the request or response is invalid", () => {
      const table: [Request, Response][] = [
        [new Request("test:"), new Response()],
        [
          new Request("test:", {
            headers: { [ConditionalHeader.IfModifiedSince]: "" },
          }),
          new Response(),
        ],
        [
          new Request("test:"),
          new Response(null, {
            headers: { [RepresentationHeader.LastModified]: "" },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assertEquals(
          new IfModifiedSince().evaluate(request, response),
          undefined,
        );
      });
    });

    it("should return false if the last modified does not match", () => {
      const table: [Request, Response][] = [
        [
          new Request("test:", {
            headers: {
              [ConditionalHeader.IfModifiedSince]: new Date("2000/1/1")
                .toUTCString(),
            },
          }),
          new Response(null, {
            headers: {
              [RepresentationHeader.LastModified]: new Date("2000/1/1")
                .toUTCString(),
            },
          }),
        ],
        [
          new Request("test:", {
            headers: {
              [ConditionalHeader.IfModifiedSince]: new Date("2000/1/1 00:00:01")
                .toUTCString(),
            },
          }),
          new Response(null, {
            headers: {
              [RepresentationHeader.LastModified]: new Date("2000/1/1 00:00:00")
                .toUTCString(),
            },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assertEquals(new IfModifiedSince().evaluate(request, response), false);
      });
    });

    it("should return true if the last modified match", () => {
      const table: [Request, Response][] = [
        [
          new Request("test:", {
            headers: {
              [ConditionalHeader.IfModifiedSince]: new Date("2000/1/1 00:00:00")
                .toUTCString(),
            },
          }),
          new Response(null, {
            headers: {
              [RepresentationHeader.LastModified]: new Date("2000/1/1 00:00:01")
                .toUTCString(),
            },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assert(new IfModifiedSince().evaluate(request, response));
      });
    });
  });

  describe("respond", () => {
    it("should return undefined if the result is true", () => {
      assertEquals(
        new IfModifiedSince().respond(
          new Request("test:"),
          new Response(),
          true,
        ),
        undefined,
      );
    });

    it("should return 314 response if the result is false", () => {
      const table: [Request, Response, Response][] = [
        [
          new Request("test:"),
          new Response(),
          new Response(null, { status: Status.NotModified }),
        ],
        [
          new Request("test:"),
          new Response(null, {
            headers: {
              [RepresentationHeader.ContentType]: "",
              "x-test": "test",
            },
          }),
          new Response(null, {
            status: Status.NotModified,
            headers: { "x-test": "test" },
          }),
        ],
      ];

      table.map(async ([request, response, expected]) => {
        const res = new IfModifiedSince().respond(request, response, false);

        assert(res);
        assert(
          await equalsResponse(res, expected, true),
        );
      });
    });
  });
});
