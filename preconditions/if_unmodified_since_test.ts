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
import { IfUnmodifiedSince } from "./if_unmodified_since.ts";

describe("IfUnmodifiedSince", () => {
  it("should be if-unmodified-since", () => {
    assertEquals(
      new IfUnmodifiedSince().field,
      ConditionalHeader.IfUnmodifiedSince,
    );
  });

  describe("evaluate", () => {
    it("should return undefined if the request has If-Match header", () => {
      assertEquals(
        new IfUnmodifiedSince().evaluate(
          new Request("test:", {
            headers: {
              [ConditionalHeader.IfUnmodifiedSince]: new Date("2000/1/1")
                .toUTCString(),
              [ConditionalHeader.IfMatch]: "",
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
            headers: { [ConditionalHeader.IfUnmodifiedSince]: "" },
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
          new IfUnmodifiedSince().evaluate(request, response),
          undefined,
        );
      });
    });

    it("should return false if the last modified does not match", () => {
      const table: [Request, Response][] = [
        [
          new Request("test:", {
            headers: {
              [ConditionalHeader.IfUnmodifiedSince]: new Date("2000/1/1")
                .toUTCString(),
            },
          }),
          new Response(null, {
            headers: {
              [RepresentationHeader.LastModified]: new Date("2000/1/2")
                .toUTCString(),
            },
          }),
        ],
      ];

      table.forEach(([request, response]) => {
        assertEquals(
          new IfUnmodifiedSince().evaluate(request, response),
          false,
        );
      });
    });

    it("should return true if the last modified match", () => {
      const table: [Request, Response][] = [
        [
          new Request("test:", {
            headers: {
              [ConditionalHeader.IfUnmodifiedSince]: new Date(
                "2000/1/1 00:00:00",
              )
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
        [
          new Request("test:", {
            headers: {
              [ConditionalHeader.IfUnmodifiedSince]: new Date("2000/1/2")
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
      ];

      table.forEach(([request, response]) => {
        assert(new IfUnmodifiedSince().evaluate(request, response));
      });
    });
  });

  describe("respond", () => {
    it("should return undefined if the result is true", () => {
      assertEquals(
        new IfUnmodifiedSince().respond(
          new Request("test:"),
          new Response(),
          true,
        ),
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
            headers: {
              [RepresentationHeader.ContentType]: "",
              "x-test": "test",
            },
          }),
          new Response(null, {
            status: Status.PreconditionFailed,
            headers: { "x-test": "test" },
          }),
        ],
      ];

      table.map(async ([request, response, expected]) => {
        const res = new IfUnmodifiedSince().respond(request, response, false);

        assert(res);
        assert(
          await equalsResponse(res, expected, true),
        );
      });
    });
  });
});
