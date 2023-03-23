import {
  applyPrecondition,
  ascendPreconditionHeader,
  type Ord,
  toPriority,
} from "./utils.ts";
import {
  assert,
  assertEquals,
  assertSpyCalls,
  ConditionalHeader,
  describe,
  it,
  spy,
} from "./_dev_deps.ts";

describe("toPriority", () => {
  it("should return priority number", () => {
    const table: [string, number][] = [
      [ConditionalHeader.IfMatch, 0],
      [ConditionalHeader.IfUnmodifiedSince, 1],
      [ConditionalHeader.IfNoneMatch, 2],
      [ConditionalHeader.IfModifiedSince, 3],
      [ConditionalHeader.IfRange, 4],
      ["If-Match", 0],
      ["If-Unmodified-Since", 1],
      ["If-None-Match", 2],
      ["If-Modified-Since", 3],
      ["If-Range", 4],
      ["unknown", Infinity],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(toPriority(input), expected);
    });
  });
});

describe("ascendPreconditionHeader", () => {
  it("should return ord", () => {
    const table: [string, string, Ord][] = [
      [ConditionalHeader.IfMatch, ConditionalHeader.IfMatch, 0],
      [ConditionalHeader.IfMatch, ConditionalHeader.IfNoneMatch, -1],
      [ConditionalHeader.IfMatch, ConditionalHeader.IfModifiedSince, -1],
      [ConditionalHeader.IfMatch, ConditionalHeader.IfRange, -1],
      [ConditionalHeader.IfMatch, ConditionalHeader.IfUnmodifiedSince, -1],
      [ConditionalHeader.IfMatch, "unknown", -1],
      [
        ConditionalHeader.IfUnmodifiedSince,
        ConditionalHeader.IfUnmodifiedSince,
        0,
      ],
      [
        ConditionalHeader.IfUnmodifiedSince,
        ConditionalHeader.IfModifiedSince,
        -1,
      ],
      [ConditionalHeader.IfUnmodifiedSince, ConditionalHeader.IfNoneMatch, -1],
      [ConditionalHeader.IfUnmodifiedSince, ConditionalHeader.IfRange, -1],
      [ConditionalHeader.IfUnmodifiedSince, "unknown", -1],
      [
        ConditionalHeader.IfNoneMatch,
        ConditionalHeader.IfNoneMatch,
        0,
      ],
      [
        ConditionalHeader.IfNoneMatch,
        ConditionalHeader.IfModifiedSince,
        -1,
      ],
      [ConditionalHeader.IfNoneMatch, ConditionalHeader.IfRange, -1],
      [ConditionalHeader.IfNoneMatch, "unknown", -1],
      [
        ConditionalHeader.IfModifiedSince,
        ConditionalHeader.IfModifiedSince,
        0,
      ],
      [
        ConditionalHeader.IfModifiedSince,
        ConditionalHeader.IfRange,
        -1,
      ],
      [ConditionalHeader.IfModifiedSince, "unknown", -1],
      [ConditionalHeader.IfRange, ConditionalHeader.IfRange, 0],
      [ConditionalHeader.IfRange, "unknown", -1],
    ];

    table.forEach(([left, right, expected]) => {
      assertEquals(ascendPreconditionHeader(left, right), expected);
    });
  });
});

describe("applyPrecondition", () => {
  it("should return void if the precondition header does not exist", async () => {
    const evaluate = spy(() => false);
    const respond = spy(() => new Response());

    const result = await applyPrecondition(
      new Request("test:"),
      new Response(),
      {
        field: "unknown",
        evaluate,
        respond,
      },
    );

    assertSpyCalls(evaluate, 0);
    assertSpyCalls(respond, 0);
    assert(!result);
  });

  it("should return void if the evaluate return true", async () => {
    const evaluate = spy(() => true);
    const respond = spy(() => {});

    const result = await applyPrecondition(
      new Request("test:", { headers: { "unknown": "" } }),
      new Response(null),
      {
        field: "unknown",
        evaluate,
        respond,
      },
    );

    assertSpyCalls(evaluate, 1);
    assertSpyCalls(respond, 1);
    assert(!result);
  });

  it("should return new response if the evaluate return false", async () => {
    const evaluate = spy(() => false);
    const newResponse = new Response();
    const respond = spy(() => newResponse);

    const result = await applyPrecondition(
      new Request("test:", { headers: { "unknown": "" } }),
      new Response(null),
      {
        field: "unknown",
        evaluate,
        respond,
      },
    );

    assertSpyCalls(evaluate, 1);
    assertSpyCalls(respond, 1);
    assert(newResponse === result);
  });
});
