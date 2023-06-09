import {
  assert,
  assertSpyCallArg,
  assertSpyCalls,
  ConditionalHeader,
  describe,
  equalsRequest,
  equalsResponse,
  it,
  Method,
  RangeHeader,
  RepresentationHeader,
  spy,
  Status,
} from "./_dev_deps.ts";
import { _handler, conditionalRequest } from "./middleware.ts";

describe("_handler", () => {
  it("should call next handler if the request is not selection or modification method", async () => {
    const select = spy(() => new Response());
    const initResponse = new Response();
    const next = spy(() => initResponse);

    const response = await _handler(
      select,
      [],
      new Request("test:", { method: "OPTIONS" }),
      next,
    );

    assertSpyCalls(select, 0);
    assertSpyCalls(next, 1);
    assert(initResponse === response);
  });

  it("should call next handler if the request has not precondition field", async () => {
    const select = spy(() => new Response());
    const initResponse = new Response();
    const request = new Request("test:");
    const next = spy(() => initResponse);
    const evaluate = spy(() => true);
    const respond = spy(() => {});

    const response = await _handler(
      select,
      [{ field: "test", evaluate, respond }],
      request,
      next,
    );

    assertSpyCalls(select, 0);
    assertSpyCalls(evaluate, 0);
    assertSpyCalls(respond, 0);
    assertSpyCalls(next, 1);
    assertSpyCallArg(next, 0, 0, request);
    assert(initResponse === response);
  });

  it("should call next handler if the selected response has not pre-evaluable status", async () => {
    const initRequest = new Request("test:", { headers: { "test": "" } });
    const select = spy(async (request: Request) => {
      assert(await equalsRequest(request, new Request("test:"), true));

      return new Response(null, { status: Status.NotFound });
    });
    const initResponse = new Response();
    const next = spy(() => initResponse);
    const evaluate = spy(() => true);
    const respond = spy(() => {});

    const response = await _handler(
      select,
      [{ field: "test", evaluate, respond }],
      initRequest,
      next,
    );

    assertSpyCalls(evaluate, 0);
    assertSpyCalls(respond, 0);
    assertSpyCalls(select, 1);
    assertSpyCalls(next, 1);
    assert(initResponse === response);
  });

  it("should request what does not include precondition headers and custom precondition headers", async () => {
    const initRequest = new Request("test:", {
      headers: {
        [ConditionalHeader.IfNoneMatch]: "",
        [ConditionalHeader.IfMatch]: "",
        [ConditionalHeader.IfModifiedSince]: "",
        [ConditionalHeader.IfRange]: "",
        [ConditionalHeader.IfUnmodifiedSince]: "",
        "x-precondition": "",
        "x-test": "",
      },
    });
    const select = spy(async (request: Request) => {
      assert(
        await equalsRequest(
          request,
          new Request("test:", {
            headers: {
              "x-test": "",
            },
          }),
        ),
      );

      return new Response(null, { status: Status.NotFound });
    });
    const initResponse = new Response();
    const next = spy(() => initResponse);
    const evaluate = spy(() => true);
    const respond = spy(() => {});

    const response = await _handler(
      select,
      [{ field: ConditionalHeader.IfNoneMatch, evaluate, respond }, {
        field: "X-Precondition",
        evaluate,
        respond,
      }],
      initRequest,
      next,
    );

    assertSpyCalls(select, 1);
    assertSpyCalls(next, 1);
    assert(initResponse === response);
  });

  it("should call next handler if the precondition evaluation result is ignore(void)", async () => {
    const selectedResponse = new Response();
    const select = spy(() => selectedResponse);

    const initResponse = new Response();
    const request = new Request("test:", { headers: { "test": "" } });

    const next = spy(() => initResponse);
    const evaluate = spy(() => {});
    const respond = spy(() => {});

    const response = await _handler(
      select,
      [{ field: "test", evaluate, respond }],
      request,
      next,
    );

    assertSpyCalls(respond, 0);
    assertSpyCalls(evaluate, 1);
    assertSpyCallArg(evaluate, 0, 0, request);
    assertSpyCallArg(evaluate, 0, 1, selectedResponse);
    assertSpyCalls(select, 1);
    assertSpyCalls(next, 1);
    assert(initResponse === response);
  });

  it("should call next handler if the precondition respond result is ignore(void)", async () => {
    const selectedResponse = new Response();
    const request = new Request("test:", { headers: { "test": "" } });
    const select = spy(() => selectedResponse);
    const initResponse = new Response();
    const next = spy(() => initResponse);
    const evaluate = spy(() => true);
    const respond = spy(() => {});

    const response = await _handler(
      select,
      [{ field: "test", evaluate, respond }],
      request,
      next,
    );

    assertSpyCalls(respond, 1);
    assertSpyCallArg(respond, 0, 0, request);
    assertSpyCallArg(respond, 0, 1, selectedResponse);
    assertSpyCallArg(respond, 0, 2, true);
    assertSpyCalls(evaluate, 1);
    assertSpyCalls(select, 1);
    assertSpyCalls(next, 1);
    assert(initResponse === response);
  });

  it("should not call next handler if the precondition respond", async () => {
    const selectedResponse = new Response();
    const request = new Request("test:", { headers: { "test": "" } });
    const select = spy(() => selectedResponse);
    const initResponse = new Response();
    const next = spy(() => initResponse);
    const evaluate = spy(() => true);
    const preResponse = new Response();
    const respond = spy(() => preResponse);

    const response = await _handler(
      select,
      [{ field: "test", evaluate, respond }],
      request,
      next,
    );

    assertSpyCalls(next, 0);
    assertSpyCalls(respond, 1);
    assertSpyCalls(evaluate, 1);
    assertSpyCalls(select, 1);
    assert(response === preResponse);
  });

  it("should call all precondition", async () => {
    const selectedResponse = new Response();
    const request = new Request("test:", {
      headers: { "test": "", "test3": "" },
    });
    const select = spy(() => selectedResponse);
    const initResponse = new Response();
    const next = spy(() => initResponse);
    const evaluate = spy(() => true);
    const respond = spy(() => {});

    const response = await _handler(
      select,
      [{ field: "test", evaluate, respond }, {
        field: "test2",
        evaluate,
        respond,
      }, { field: "test3", evaluate, respond }],
      request,
      next,
    );

    assertSpyCalls(next, 1);
    assertSpyCalls(respond, 2);
    assertSpyCalls(evaluate, 2);
    assertSpyCalls(select, 1);
    assert(response === initResponse);
  });
});

describe("conditionalRequest", () => {
  it("should return 304 response if request has if-none-match header", async () => {
    const etag = `"text"`;
    const selectRepresentation = spy(() =>
      new Response(null, { headers: { etag } })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      headers: { "if-none-match": etag },
    });
    const handler = spy(() => new Response());

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 0);

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.NotModified,
          headers: { [RepresentationHeader.ETag]: etag },
        }),
        true,
      ),
    );
  });

  it("should return 412 response if request has if-none-match header and the response is not GET or HEAD", async () => {
    const etag = `"text"`;
    const selectRepresentation = spy(() =>
      new Response(null, { headers: { etag } })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      method: Method.Post,
      headers: { "if-none-match": etag },
    });
    const handler = spy(() => new Response());

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 0);

    assert(
      await equalsResponse(
        response,
        new Response(null, { status: Status.PreconditionFailed }),
        true,
      ),
    );
  });

  it("should return 314 response if request has if-unmodified-since header", async () => {
    const lastModified = new Date("2000/1/1").toUTCString();
    const ifModifiedSince = new Date("2000/1/2").toUTCString();

    const selectRepresentation = spy(() =>
      new Response(null, {
        headers: { [RepresentationHeader.LastModified]: lastModified },
      })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      headers: { [ConditionalHeader.IfModifiedSince]: ifModifiedSince },
    });
    const handler = spy(() => new Response());

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 0);

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.NotModified,
          headers: { [RepresentationHeader.LastModified]: lastModified },
        }),
        true,
      ),
    );
  });

  it("should return 412 response if request has if-match header and not match", async () => {
    const selectRepresentation = spy(() =>
      new Response(null, {
        headers: { [RepresentationHeader.ETag]: `"a"` },
      })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      headers: { [ConditionalHeader.IfMatch]: `"abc"` },
    });
    const handler = spy(() => new Response());

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 0);

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.PreconditionFailed,
        }),
        true,
      ),
    );
  });

  it("should return next response if request has if-match header and matched", async () => {
    const selectRepresentation = spy(() =>
      new Response(null, {
        headers: { [RepresentationHeader.ETag]: `"a"` },
      })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      headers: { [ConditionalHeader.IfMatch]: `*` },
    });
    const initResponse = new Response();
    const handler = spy(() => initResponse);

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 1);
    assert(initResponse === response);
  });

  it("should return 412 response if request has if-unmodified-since header and not match", async () => {
    const lastModified = new Date("2000/1/2").toUTCString();
    const ifUnmodifiedSince = new Date("2000/1/1").toUTCString();

    const selectRepresentation = spy(() =>
      new Response(null, {
        headers: { [RepresentationHeader.LastModified]: lastModified },
      })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      headers: { [ConditionalHeader.IfUnmodifiedSince]: ifUnmodifiedSince },
    });
    const handler = spy(() => new Response());

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 0);

    assert(
      await equalsResponse(
        response,
        new Response(null, {
          status: Status.PreconditionFailed,
        }),
        true,
      ),
    );
  });

  it("should return next response if request has if-unmodified-since header and match", async () => {
    const lastModified = new Date("2000/1/1").toUTCString();
    const ifUnmodifiedSince = new Date("2000/1/2").toUTCString();

    const selectRepresentation = spy(() =>
      new Response(null, {
        headers: { [RepresentationHeader.LastModified]: lastModified },
      })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      headers: { [ConditionalHeader.IfUnmodifiedSince]: ifUnmodifiedSince },
    });
    const initResponse = new Response();
    const handler = spy(() => initResponse);

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 1);
    assert(response === initResponse);
  });

  it("should return 206 response if request has if-range and range header and match etag", async () => {
    const ETAG = `""`;
    const selectRepresentation = spy(() =>
      new Response("abcdef", {
        headers: { [RepresentationHeader.ETag]: ETAG },
      })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      headers: {
        [ConditionalHeader.IfRange]: ETAG,
        [RangeHeader.Range]: "bytes=-3",
      },
    });
    const handler = spy(() => new Response());

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 0);

    assert(
      await equalsResponse(
        response,
        new Response("def", {
          status: Status.PartialContent,
          headers: {
            [RangeHeader.ContentRange]: "bytes 3-5/6",
            [RepresentationHeader.ETag]: ETAG,
          },
        }),
        true,
      ),
    );
  });

  it("should return 206 response if request has if-range and range header and match last-modified", async () => {
    const lastModified = new Date("2000/1/1").toUTCString();
    const selectRepresentation = spy(() =>
      new Response("abcdef", {
        headers: { [RepresentationHeader.LastModified]: lastModified },
      })
    );
    const middleware = conditionalRequest(selectRepresentation);
    const request = new Request("test:", {
      headers: {
        [ConditionalHeader.IfRange]: lastModified,
        [RangeHeader.Range]: "bytes=4-, -3",
      },
    });
    const handler = spy(() => new Response());
    const response = await middleware(request, handler);
    const BOUNDARY = "1f8ac10f23c5b5bc1167bda84b833e5c057a77d2";

    assertSpyCalls(selectRepresentation, 1);
    assertSpyCalls(handler, 0);

    assert(
      await equalsResponse(
        response,
        new Response(
          `--${BOUNDARY}
Content-Type: text/plain;charset=UTF-8
Content-Range: bytes 4-5/6

ef
--${BOUNDARY}
Content-Type: text/plain;charset=UTF-8
Content-Range: bytes 3-5/6

def
--${BOUNDARY}--`,
          {
            status: Status.PartialContent,
            headers: {
              [RepresentationHeader.LastModified]: lastModified,
              [RepresentationHeader.ContentType]:
                `multipart/byteranges; boundary=${BOUNDARY}`,
            },
          },
        ),
        true,
      ),
    );
  });

  it("should return next response if the filtered preconditions is empty", async () => {
    const selectedRepresentation = new Response("<body>", {
      headers: { etag: "<etag>" },
    });
    const selectRepresentation = spy(() => selectedRepresentation);
    const middleware = conditionalRequest(selectRepresentation, {
      preconditions: [],
    });
    const request = new Request("test:", {
      headers: { "if-none-match": "<etag>" },
    });
    const handler = spy(() => selectedRepresentation);

    const response = await middleware(request, handler);

    assertSpyCalls(selectRepresentation, 0);
    assertSpyCalls(handler, 1);
    assert(selectedRepresentation === response);
  });
});
