import { evaluateIfRange, IfRange } from "./if_range.ts";
import {
  assert,
  assertEquals,
  ConditionalHeader,
  describe,
  equalsResponse,
  it,
  Method,
  RangeHeader,
  RepresentationHeader,
  Status,
} from "../_dev_deps.ts";

describe("evaluateIfRange", () => {
  it("should return undefined if the request is not GET", () => {
    assertEquals(
      evaluateIfRange(
        new Request("test:", { method: Method.Head }),
        new Response(),
      ),
      undefined,
    );
  });

  it("should return undefined if the request has not requirement headers", () => {
    const table: [Request, Response][] = [
      [new Request("test:"), new Response()],
      [
        new Request("test:", { headers: { [RangeHeader.Range]: "" } }),
        new Response(),
      ],
      [
        new Request("test:", {
          headers: { [ConditionalHeader.IfRange]: "" },
        }),
        new Response(),
      ],
      [
        new Request("test:", {
          headers: { [ConditionalHeader.IfRange]: "", [RangeHeader.Range]: "" },
        }),
        new Response(),
      ],
    ];

    table.forEach(([request, response]) => {
      assertEquals(evaluateIfRange(request, response), undefined);
    });
  });

  it("should return undefined if the headers are invalid", () => {
    const table: [Request, Response][] = [
      [
        new Request("test:", {
          headers: { [ConditionalHeader.IfRange]: "", [RangeHeader.Range]: "" },
        }),
        new Response(null, { headers: { [RepresentationHeader.ETag]: "" } }),
      ],
      [
        new Request("test:", {
          headers: { [ConditionalHeader.IfRange]: "", [RangeHeader.Range]: "" },
        }),
        new Response(null, {
          headers: { [RepresentationHeader.LastModified]: "" },
        }),
      ],
    ];

    table.forEach(([request, response]) => {
      assertEquals(evaluateIfRange(request, response), undefined);
    });
  });

  it("should return false if the etag does not match strong", () => {
    const table: [Request, Response][] = [
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: `""`,
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: { [RepresentationHeader.ETag]: `W/""` },
        }),
      ],
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: `W/""`,
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: { [RepresentationHeader.ETag]: `W/""` },
        }),
      ],
    ];

    table.forEach(([request, response]) => {
      assertEquals(evaluateIfRange(request, response), false);
    });
  });

  it("should return false if the last-modified does not match exact", () => {
    const table: [Request, Response][] = [
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: new Date("2000/1/1 00:00:00")
              .toUTCString(),
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: {
            [RepresentationHeader.LastModified]: new Date("2000/1/1 00:00:01")
              .toUTCString(),
          },
        }),
      ],
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: new Date("2000/1/1 00:00:01")
              .toUTCString(),
            [RangeHeader.Range]: "",
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
      assertEquals(evaluateIfRange(request, response), false);
    });
  });

  it("should return true if the etag match strong", () => {
    const table: [Request, Response][] = [
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: `""`,
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: { [RepresentationHeader.ETag]: `""` },
        }),
      ],
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: ` "a" `,
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: { [RepresentationHeader.ETag]: ` "a" ` },
        }),
      ],
    ];

    table.forEach(([request, response]) => {
      assertEquals(evaluateIfRange(request, response), true);
    });
  });

  it("should return true if the last-modified match exact", () => {
    const table: [Request, Response][] = [
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: new Date("2000/1/1 00:00:01")
              .toUTCString(),
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: {
            [RepresentationHeader.LastModified]: new Date("2000/1/1 00:00:01")
              .toUTCString(),
          },
        }),
      ],
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: new Date("2000/1/1 00:00:01")
              .toUTCString(),
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: {
            [RepresentationHeader.LastModified]: new Date("2000/1/1 00:00:01")
              .toUTCString(),
          },
        }),
      ],
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: "Sunday, 06-Nov-94 08:49:37 GMT",
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: {
            [RepresentationHeader.LastModified]:
              "Sunday, 06-Nov-94 08:49:37 GMT",
          },
        }),
      ],
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: "Sun Nov  6 08:49:37 1994",
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: {
            [RepresentationHeader.LastModified]: "Sun Nov  6 08:49:37 1994",
          },
        }),
      ],
      [
        new Request("test:", {
          headers: {
            [ConditionalHeader.IfRange]: "Sunday, 06-Nov-94 08:49:37 GMT",
            [RangeHeader.Range]: "",
          },
        }),
        new Response(null, {
          headers: {
            [RepresentationHeader.LastModified]: "Sun Nov  6 08:49:37 1994",
          },
        }),
      ],
    ];

    table.forEach(([request, response]) => {
      assertEquals(evaluateIfRange(request, response), true);
    });
  });
});

describe("IfRange", () => {
  it("should be if-range", () => {
    assertEquals(
      new IfRange().field,
      ConditionalHeader.IfRange,
    );
  });

  it("should be equal to evaluate", () => {
    assert(new IfRange().evaluate === evaluateIfRange);
  });

  it("should return same response if the evaluation result is false", async () => {
    const initResponse = new Response();
    const response = await new IfRange().respond(
      new Request("test:"),
      initResponse,
      false,
    );

    assert(initResponse === response);
  });

  it("should return same response if the request does not have range header", async () => {
    const initResponse = new Response();
    const response = await new IfRange().respond(
      new Request("test:"),
      initResponse,
      true,
    );

    assert(initResponse === response);
  });

  it("should return 206 response if the range header is valid", async () => {
    const response = await new IfRange().respond(
      new Request("test:", { headers: { [RangeHeader.Range]: "bytes=3-" } }),
      new Response("abcdefg"),
      true,
    );

    assert(
      await equalsResponse(
        response,
        new Response("defg", {
          status: Status.PartialContent,
          headers: {
            [RangeHeader.ContentRange]: "bytes 3-6/7",
          },
        }),
        true,
      ),
    );
  });

  it("should return 413 response if the request range is unknown", async () => {
    const response = await new IfRange().respond(
      new Request("test:", {
        headers: { [RangeHeader.Range]: "unknown=test" },
      }),
      new Response("abcdefg"),
      true,
    );

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.RequestedRangeNotSatisfiable,
          headers: {
            [RangeHeader.ContentRange]: "unknown */7",
          },
        }),
        true,
      ),
    );
  });

  it("should return same response if the request range is invalid", async () => {
    const initResponse = new Response();
    const response = await new IfRange().respond(
      new Request("test:", {
        headers: { [RangeHeader.Range]: "<invalid>" },
      }),
      initResponse,
      true,
    );

    assert(response === initResponse);
  });

  it("should return change supported range syntax", async () => {
    const initResponse = new Response("abcdef");
    const response = await new IfRange([]).respond(
      new Request("test:", {
        headers: { [RangeHeader.Range]: "bytes=0-" },
      }),
      initResponse,
      true,
    );

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.RequestedRangeNotSatisfiable,
          headers: {
            [RangeHeader.ContentRange]: "bytes */6",
          },
        }),
        true,
      ),
    );
  });
});
