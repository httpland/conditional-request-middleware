import { parse } from "./if_match.ts";
import { type ETag } from "./deps.ts";
import { assertEquals, assertThrows, describe, it } from "./_dev_deps.ts";

describe("parse", () => {
  it("should return star", () => {
    const table: string[] = [
      "*",
      " *",
      "* ",
      "   *  ",
    ];

    table.forEach((input) => {
      assertEquals(parse(input), "*");
    });
  });

  it("should return empty list", () => {
    const table: string[] = [
      "",
      "     ",
    ];

    table.forEach((input) => {
      assertEquals(parse(input), []);
    });
  });

  it("should return etag list", () => {
    const table: [string, ETag[]][] = [
      [`""`, [{ tag: "", weak: false }]],
      [`"", "a", "b"`, [{ tag: "", weak: false }, { tag: "a", weak: false }, {
        tag: "b",
        weak: false,
      }]],
      [`W/"", "a", W/"abc"`, [{ tag: "", weak: true }, {
        tag: "a",
        weak: false,
      }, {
        tag: "abc",
        weak: true,
      }]],
      [`"", "*"`, [{ tag: "", weak: false }, {
        tag: "*",
        weak: false,
      }]],
    ];

    table.forEach(([input, expected]) => {
      assertEquals(parse(input), expected);
    });
  });

  it("should throw error if the input is invalid syntax", () => {
    const table: string[] = [
      `"`,
      "* a",
      "*,",
      `*, ""`,
      `","`,
      `* *`,
      `**`,
      `"", *`,
    ];

    table.forEach((input) => {
      assertThrows(() => parse(input));
    });
  });
});
