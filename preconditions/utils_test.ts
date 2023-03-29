import {
  ifMatch,
  ifModifiedSince,
  ifNoneMatch,
  ifRange,
  type IfRangeHeaders,
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

  it("should return false if the input is invalid syntax", () => {
    const table: [string, string][] = [
      ["", "Mon, 06 Mar 2023 12:00:00 GMT"],
      ["Mon, 06 Mar 2023 12:00:00 GMT", ""],
    ];

    table.forEach(([filedValue, etag]) => {
      assertThrows(() => ifModifiedSince(filedValue, etag));
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

describe("ifRange", () => {
  it("should not match", () => {
    const table: [string, IfRangeHeaders][] = [
      ["Sun, 06 Nov 1994 08:49:37 GMT", {
        lastModified: "Sunday, 06-Nov-94 08:49:38 GMT",
      }],
      ["Sun, 06 Nov 1994 08:49:38 GMT", {
        lastModified: "Sunday, 06-Nov-94 08:49:37 GMT",
      }],
      ["Sunday, 06-Nov-94 08:49:37 GMT", {
        lastModified: "Sun Nov  6 08:49:38 1994",
      }],
      ["Sunday, 06-Nov-94 08:49:38 GMT", {
        lastModified: "Sun Nov  6 08:49:37 1994",
      }],
      ["Sun Nov  6 08:49:37 1994", {
        lastModified: "Sun, 06 Nov 1994 08:49:38 GMT",
      }],
      ["Sun Nov  6 08:49:38 1994", {
        lastModified: "Sun, 06 Nov 1994 08:49:37 GMT",
      }],
      [`"a"`, { etag: `""` }],
      [`W/""`, { etag: `""` }],
      [`""`, { etag: `W/""` }],
      [`W/""`, { etag: `W/""` }],
    ];

    table.forEach(([filedValue, headers]) => {
      assert(!ifRange(filedValue, headers));
    });
  });

  it("should match", () => {
    const table: [string, IfRangeHeaders][] = [
      ["Sun, 06 Nov 1994 08:49:37 GMT", {
        lastModified: "Sunday, 06-Nov-94 08:49:37 GMT",
      }],
      ["Sunday, 06-Nov-94 08:49:37 GMT", {
        lastModified: "Sun Nov  6 08:49:37 1994",
      }],
      ["Sun Nov  6 08:49:37 1994", {
        lastModified: "Sun, 06 Nov 1994 08:49:37 GMT",
      }],

      [`""`, { etag: `""` }],
      [`"abc"`, { etag: `"abc"` }],
    ];

    table.forEach(([filedValue, headers]) => {
      assert(ifRange(filedValue, headers));
    });
  });

  it("should throw error", () => {
    const table: [string, IfRangeHeaders][] = [
      ["", {}],
      ["", { etag: "" }],
      ["", { etag: "", lastModified: "" }],
      [`""`, { etag: `"` }],
      [`""`, {}],
      [`Sep`, { lastModified: "" }],
    ];

    table.forEach(([filedValue, headers]) => {
      assertThrows(() => ifRange(filedValue, headers));
    });
  });
});
