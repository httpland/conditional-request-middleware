import {
  ifMatch,
  ifModifiedSince,
  ifNoneMatch,
  ifUnmodifiedSince,
} from "./utils.ts";
import { assert, assertThrows, describe, it } from "../_dev_deps.ts";

describe("ifMatch", () => {
  it("should not match", () => {
    const table: [string, string][] = [
      [`W/"abc"`, `"abc"`],
      [`W/"abc", W/"d"`, `"abc"`],
      [`W/"abc", W/"d"`, `"W/abc"`],
      [`"abc", W/"abc"`, `"W/abc"`],
    ];

    table.forEach(([filedValue, etag]) => {
      assert(!ifMatch(filedValue, etag));
    });
  });

  it("should match", () => {
    const table: [string, string][] = [
      ["*", `""`],
      [`"abc"`, `"abc"`],
      [`"abc", "def"`, `"def"`],
      [`"abc", "def", W/"hij"`, `"def"`],
    ];

    table.forEach(([filedValue, etag]) => {
      assert(ifMatch(filedValue, etag));
    });
  });

  it("should throw error", () => {
    const table: [string, string][] = [
      ["", ""],
      ["*", ""],
      ["abc", "abc"],
    ];

    table.forEach(([filedValue, etag]) => {
      assertThrows(() => ifMatch(filedValue, etag));
    });
  });
});

describe("ifNoneMatch", () => {
  it("should not match", () => {
    const table: [string, string][] = [
      ["*", `""`],
      ["*", `W/""`],
      [`"abc"`, `"abc"`],
      [`W/"abc"`, `"abc"`],
      [`"abc"`, `W/"abc"`],
      [`"a", "b", "c"`, `W/"b"`],
      [`"a", "b", "c"`, `"c"`],
    ];

    table.forEach(([filedValue, etag]) => {
      assert(!ifNoneMatch(filedValue, etag));
    });
  });

  it("should match", () => {
    const table: [string, string][] = [
      [`"a"`, `"b"`],
      [`"a", "b", "c"`, `"d"`],
      [`W/"a", "b", "c"`, `"d"`],
      [`W/"a", "b", "c"`, `W/"d"`],
    ];

    table.forEach(([filedValue, etag]) => {
      assert(ifNoneMatch(filedValue, etag));
    });
  });

  it("should throw error", () => {
    const table: [string, string][] = [
      ["", ""],
      [`""`, `"`],
      [`"`, `""`],
      [`"abc,def"`, `""`],
    ];

    table.forEach(([filedValue, etag]) => {
      assertThrows(() => ifNoneMatch(filedValue, etag));
    });
  });
});

describe("ifModifiedSince", () => {
  it("should not match", () => {
    const table: [string, string][] = [
      ["Mon, 06 Mar 2023 12:00:00 GMT", "Mon, 06 Mar 2023 12:00:00 GMT"],
      ["Mon, 06 Mar 2023 12:00:01 GMT", "Mon, 06 Mar 2023 12:00:00 GMT"],
    ];

    table.forEach(([filedValue, etag]) => {
      assert(!ifModifiedSince(filedValue, etag));
    });
  });

  it("should match", () => {
    const table: [string, string][] = [
      ["Mon, 06 Mar 2023 12:00:00 GMT", "Mon, 06 Mar 2023 12:00:01 GMT"],
    ];

    table.forEach(([filedValue, etag]) => {
      assert(ifModifiedSince(filedValue, etag));
    });
  });

  it("should throw error", () => {
    const table: [string, string][] = [
      ["", ""],
      ["Mon, 06 Mar 2023 12:00:00 GMT", ""],
      ["", "Mon, 06 Mar 2023 12:00:00 GMT"],
    ];

    table.forEach(([filedValue, lastModified]) => {
      assertThrows(() => ifModifiedSince(filedValue, lastModified));
    });
  });
});

describe("ifUnmodifiedSince", () => {
  it("should not match", () => {
    const table: [string, string][] = [
      ["Mon, 06 Mar 2023 12:00:00 GMT", "Mon, 06 Mar 2023 12:00:01 GMT"],
    ];

    table.forEach(([filedValue, etag]) => {
      assert(!ifUnmodifiedSince(filedValue, etag));
    });
  });

  it("should match", () => {
    const table: [string, string][] = [
      ["Mon, 06 Mar 2023 12:00:01 GMT", "Mon, 06 Mar 2023 12:00:00 GMT"],
      ["Mon, 06 Mar 2023 12:00:00 GMT", "Mon, 06 Mar 2023 12:00:00 GMT"],
    ];

    table.forEach(([filedValue, etag]) => {
      assert(ifUnmodifiedSince(filedValue, etag));
    });
  });

  it("should throw error", () => {
    const table: [string, string][] = [
      ["", ""],
      ["Mon, 06 Mar 2023 12:00:01 GMT", ""],
      ["", "Mon, 06 Mar 2023 12:00:01 GMT"],
    ];

    table.forEach(([filedValue, etag]) => {
      assertThrows(() => ifUnmodifiedSince(filedValue, etag));
    });
  });
});
