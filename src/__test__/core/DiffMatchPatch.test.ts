/**
 * Diff Match and Patch -- Test Harness
 * Copyright 2018 The diff-match-patch Authors.
 * https://github.com/google/diff-match-patch
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Ported by [xiaochao.k@gmail.com](https://github.com/nonoroazoro)
 */

import { DiffMatchPatch } from "../../core";
import { Diff, DiffOperation } from "../../types";

let dmp: DiffMatchPatch;
describe("diff-match-patch-ts - core/DiffMatchPatch", () =>
{
  beforeAll(() =>
  {
    dmp = new DiffMatchPatch();
  });

  //#region DIFF TEST FUNCTIONS
  it("DIFF - Common Prefix", () =>
  {
    // Detect any common prefix.

    // Null case.
    expect(dmp.diff_commonPrefix("abc", "xyz")).toBe(0);

    // Non-null case.
    expect(dmp.diff_commonPrefix("1234abcdef", "1234xyz")).toBe(4);

    // Whole case.
    expect(dmp.diff_commonPrefix("1234", "1234xyz")).toBe(4);
  });

  it("DIFF - Common Suffix", () =>
  {
    // Detect any common suffix.

    // Null case.
    expect(dmp.diff_commonSuffix("abc", "xyz")).toBe(0);

    // Non-null case.
    expect(dmp.diff_commonSuffix("abcdef1234", "xyz1234")).toBe(4);

    // Whole case.
    expect(dmp.diff_commonSuffix("1234", "xyz1234")).toBe(4);
  });

  it("DIFF - Common Overlap", () =>
  {
    // Detect any suffix/prefix overlap.

    // Null case.
    expect(dmp["diff_commonOverlap_"]("", "abcd")).toBe(0);

    // Whole case.
    expect(dmp["diff_commonOverlap_"]("abc", "abcd")).toBe(3);

    // No overlap.
    expect(dmp["diff_commonOverlap_"]("123456", "abcd")).toBe(0);

    // Overlap.
    expect(dmp["diff_commonOverlap_"]("123456xxx", "xxxabcd")).toBe(3);

    // Unicode.
    // Some overly clever languages (C#) may treat ligatures as equal to their
    // component letters.  E.g. U+FB01 == 'fi'
    expect(dmp["diff_commonOverlap_"]("fi", "\ufb01i")).toBe(0);
  });

  it("DIFF - Half Match", () =>
  {
    // Detect a halfmatch.
    dmp.Diff_Timeout = 1;

    // No match.
    expect(dmp["diff_halfMatch_"]("1234567890", "abcdef")).toBeNull();

    expect(dmp["diff_halfMatch_"]("12345", "23")).toBeNull();

    // Single Match.
    expect(dmp["diff_halfMatch_"]("1234567890", "a345678z")).toStrictEqual(["12", "90", "a", "z", "345678"]);

    expect(dmp["diff_halfMatch_"]("a345678z", "1234567890")).toStrictEqual(["a", "z", "12", "90", "345678"]);

    expect(dmp["diff_halfMatch_"]("abc56789z", "1234567890")).toStrictEqual(["abc", "z", "1234", "0", "56789"]);

    expect(dmp["diff_halfMatch_"]("a23456xyz", "1234567890")).toStrictEqual(["a", "xyz", "1", "7890", "23456"]);

    // Multiple Matches.
    expect(dmp["diff_halfMatch_"]("121231234123451234123121", "a1234123451234z"))
      .toStrictEqual(["12123", "123121", "a", "z", "1234123451234"]);

    expect(dmp["diff_halfMatch_"]("x-=-=-=-=-=-=-=-=-=-=-=-=", "xx-=-=-=-=-=-=-="))
      .toStrictEqual(["", "-=-=-=-=-=", "x", "", "x-=-=-=-=-=-=-="]);

    expect(dmp["diff_halfMatch_"]("-=-=-=-=-=-=-=-=-=-=-=-=y", "-=-=-=-=-=-=-=yy"))
      .toStrictEqual(["-=-=-=-=-=", "", "", "y", "-=-=-=-=-=-=-=y"]);

    // Non-optimal halfmatch.
    // Optimal diff would be -q+x=H-i+e=lloHe+Hu=llo-Hew+y not -qHillo+x=HelloHe-w+Hulloy
    expect(dmp["diff_halfMatch_"]("qHilloHelloHew", "xHelloHeHulloy"))
      .toStrictEqual(["qHillo", "w", "x", "Hulloy", "HelloHe"]);

    // Optimal no halfmatch.
    dmp.Diff_Timeout = 0;
    expect(dmp["diff_halfMatch_"]("qHilloHelloHew", "xHelloHeHulloy")).toBeNull();
  });

  it("DIFF - Lines To Chars", () =>
  {
    function expectEqual(a: any, b: any)
    {
      expect(a.chars1).toEqual(b.chars1);
      expect(a.chars2).toEqual(b.chars2);
      expect(a.lineArray).toStrictEqual(b.lineArray);
    }

    // Convert lines down to characters.
    expectEqual(
      { chars1: "\x01\x02\x01", chars2: "\x02\x01\x02", lineArray: ["", "alpha\n", "beta\n"] },
      dmp["diff_linesToChars_"]("alpha\nbeta\nalpha\n", "beta\nalpha\nbeta\n")
    );

    expectEqual(
      { chars1: "", chars2: "\x01\x02\x03\x03", lineArray: ["", "alpha\r\n", "beta\r\n", "\r\n"] },
      dmp["diff_linesToChars_"]("", "alpha\r\nbeta\r\n\r\n\r\n")
    );

    expectEqual(
      { chars1: "\x01", chars2: "\x02", lineArray: ["", "a", "b"] },
      dmp["diff_linesToChars_"]("a", "b")
    );

    // More than 256 to reveal any 8-bit limitations.
    const n = 300;
    const lineList = [];
    const charList = [];
    for (let i = 1; i < n + 1; i++)
    {
      lineList[i - 1] = i + "\n";
      charList[i - 1] = String.fromCharCode(i);
    }
    expect(lineList.length).toBe(n);
    const lines = lineList.join("");
    const chars = charList.join("");
    expect(chars.length).toBe(n);
    lineList.unshift("");
    expectEqual(
      { chars1: chars, chars2: "", lineArray: lineList },
      dmp["diff_linesToChars_"](lines, "")
    );
  });

  it("DIFF - Chars To Lines", () =>
  {
    // Convert chars up to lines.
    let diffs: Diff[] = [
      [DiffOperation.DIFF_EQUAL, "\x01\x02\x01"],
      [DiffOperation.DIFF_INSERT, "\x02\x01\x02"]
    ];
    dmp["diff_charsToLines_"](diffs, ["", "alpha\n", "beta\n"]);
    expect([
      [DiffOperation.DIFF_EQUAL, "alpha\nbeta\nalpha\n"],
      [DiffOperation.DIFF_INSERT, "beta\nalpha\nbeta\n"]
    ]).toStrictEqual(diffs);

    // More than 256 to reveal any 8-bit limitations.
    const n = 300;
    let lineList = [];
    const charList = [];
    for (let i = 1; i < n + 1; i++)
    {
      lineList[i - 1] = i + "\n";
      charList[i - 1] = String.fromCharCode(i);
    }
    expect(lineList.length).toBe(n);
    const lines = lineList.join("");
    let chars = charList.join("");
    expect(chars.length).toBe(n);
    lineList.unshift("");
    diffs = [[DiffOperation.DIFF_DELETE, chars]];
    dmp["diff_charsToLines_"](diffs, lineList);
    expect([[DiffOperation.DIFF_DELETE, lines]]).toStrictEqual(diffs);

    // More than 65536 to verify any 16-bit limitation.
    lineList = [];
    for (let i = 0; i < 66000; i++)
    {
      lineList[i] = i + "\n";
    }
    chars = lineList.join("");
    const results = dmp["diff_linesToChars_"](chars, "");
    diffs = [[DiffOperation.DIFF_INSERT, results.chars1]];
    dmp["diff_charsToLines_"](diffs, results.lineArray);
    expect(diffs[0][1]).toEqual(chars);
  });

  it("DIFF - Cleanup Merge", () =>
  {
    // Cleanup a messy diff.

    // Null case.
    let diffs: Diff[] = [];
    dmp.diff_cleanupMerge(diffs);
    expect([]).toStrictEqual(diffs);

    // No change case.
    diffs = [[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_DELETE, "b"], [DiffOperation.DIFF_INSERT, "c"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_DELETE, "b"], [DiffOperation.DIFF_INSERT, "c"]]).toStrictEqual(diffs);

    // Merge equalities.
    diffs = [[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_EQUAL, "b"], [DiffOperation.DIFF_EQUAL, "c"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "abc"]]).toStrictEqual(diffs);

    // Merge deletions.
    diffs = [[DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_DELETE, "b"], [DiffOperation.DIFF_DELETE, "c"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abc"]]).toStrictEqual(diffs);

    // Merge insertions.
    diffs = [[DiffOperation.DIFF_INSERT, "a"], [DiffOperation.DIFF_INSERT, "b"], [DiffOperation.DIFF_INSERT, "c"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_INSERT, "abc"]]).toStrictEqual(diffs);

    // Merge interweave.
    diffs = [
      [DiffOperation.DIFF_DELETE, "a"],
      [DiffOperation.DIFF_INSERT, "b"],
      [DiffOperation.DIFF_DELETE, "c"],
      [DiffOperation.DIFF_INSERT, "d"],
      [DiffOperation.DIFF_EQUAL, "e"],
      [DiffOperation.DIFF_EQUAL, "f"]
    ];

    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_DELETE, "ac"], [DiffOperation.DIFF_INSERT, "bd"], [DiffOperation.DIFF_EQUAL, "ef"]]).toStrictEqual(diffs);

    // Prefix and suffix detection.
    diffs = [[DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_INSERT, "abc"], [DiffOperation.DIFF_DELETE, "dc"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_DELETE, "d"], [DiffOperation.DIFF_INSERT, "b"], [DiffOperation.DIFF_EQUAL, "c"]]).toStrictEqual(diffs);

    // Prefix and suffix detection with equalities.
    diffs = [[DiffOperation.DIFF_EQUAL, "x"], [DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_INSERT, "abc"], [DiffOperation.DIFF_DELETE, "dc"], [DiffOperation.DIFF_EQUAL, "y"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "xa"], [DiffOperation.DIFF_DELETE, "d"], [DiffOperation.DIFF_INSERT, "b"], [DiffOperation.DIFF_EQUAL, "cy"]]).toStrictEqual(diffs);

    // Slide edit left.
    diffs = [[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_INSERT, "ba"], [DiffOperation.DIFF_EQUAL, "c"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_INSERT, "ab"], [DiffOperation.DIFF_EQUAL, "ac"]]).toStrictEqual(diffs);

    // Slide edit right.
    diffs = [[DiffOperation.DIFF_EQUAL, "c"], [DiffOperation.DIFF_INSERT, "ab"], [DiffOperation.DIFF_EQUAL, "a"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "ca"], [DiffOperation.DIFF_INSERT, "ba"]]).toStrictEqual(diffs);

    // Slide edit left recursive.
    diffs = [[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_DELETE, "b"], [DiffOperation.DIFF_EQUAL, "c"], [DiffOperation.DIFF_DELETE, "ac"], [DiffOperation.DIFF_EQUAL, "x"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abc"], [DiffOperation.DIFF_EQUAL, "acx"]]).toStrictEqual(diffs);

    // Slide edit right recursive.
    diffs = [[DiffOperation.DIFF_EQUAL, "x"], [DiffOperation.DIFF_DELETE, "ca"], [DiffOperation.DIFF_EQUAL, "c"], [DiffOperation.DIFF_DELETE, "b"], [DiffOperation.DIFF_EQUAL, "a"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "xca"], [DiffOperation.DIFF_DELETE, "cba"]]).toStrictEqual(diffs);

    // Empty merge.
    diffs = [[DiffOperation.DIFF_DELETE, "b"], [DiffOperation.DIFF_INSERT, "ab"], [DiffOperation.DIFF_EQUAL, "c"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_INSERT, "a"], [DiffOperation.DIFF_EQUAL, "bc"]]).toStrictEqual(diffs);

    // Empty equality.
    diffs = [[DiffOperation.DIFF_EQUAL, ""], [DiffOperation.DIFF_INSERT, "a"], [DiffOperation.DIFF_EQUAL, "b"]];
    dmp.diff_cleanupMerge(diffs);
    expect([[DiffOperation.DIFF_INSERT, "a"], [DiffOperation.DIFF_EQUAL, "b"]]).toStrictEqual(diffs);
  });

  it("DIFF - Cleanup Semantic Lossless", () =>
  {
    // Slide diffs to match logical boundaries.

    // Null case.
    let diffs: Diff[] = [];
    dmp.diff_cleanupSemanticLossless(diffs);
    expect([]).toStrictEqual(diffs);

    // Blank lines.
    diffs = [[DiffOperation.DIFF_EQUAL, "AAA\r\n\r\nBBB"], [DiffOperation.DIFF_INSERT, "\r\nDDD\r\n\r\nBBB"], [DiffOperation.DIFF_EQUAL, "\r\nEEE"]];
    dmp.diff_cleanupSemanticLossless(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "AAA\r\n\r\n"], [DiffOperation.DIFF_INSERT, "BBB\r\nDDD\r\n\r\n"], [DiffOperation.DIFF_EQUAL, "BBB\r\nEEE"]]).toStrictEqual(diffs);

    // Line boundaries.
    diffs = [[DiffOperation.DIFF_EQUAL, "AAA\r\nBBB"], [DiffOperation.DIFF_INSERT, " DDD\r\nBBB"], [DiffOperation.DIFF_EQUAL, " EEE"]];
    dmp.diff_cleanupSemanticLossless(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "AAA\r\n"], [DiffOperation.DIFF_INSERT, "BBB DDD\r\n"], [DiffOperation.DIFF_EQUAL, "BBB EEE"]]).toStrictEqual(diffs);

    // Word boundaries.
    diffs = [[DiffOperation.DIFF_EQUAL, "The c"], [DiffOperation.DIFF_INSERT, "ow and the c"], [DiffOperation.DIFF_EQUAL, "at."]];
    dmp.diff_cleanupSemanticLossless(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "The "], [DiffOperation.DIFF_INSERT, "cow and the "], [DiffOperation.DIFF_EQUAL, "cat."]]).toStrictEqual(diffs);

    // Alphanumeric boundaries.
    diffs = [[DiffOperation.DIFF_EQUAL, "The-c"], [DiffOperation.DIFF_INSERT, "ow-and-the-c"], [DiffOperation.DIFF_EQUAL, "at."]];
    dmp.diff_cleanupSemanticLossless(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "The-"], [DiffOperation.DIFF_INSERT, "cow-and-the-"], [DiffOperation.DIFF_EQUAL, "cat."]]).toStrictEqual(diffs);

    // Hitting the start.
    diffs = [[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_EQUAL, "ax"]];
    dmp.diff_cleanupSemanticLossless(diffs);
    expect([[DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_EQUAL, "aax"]]).toStrictEqual(diffs);

    // Hitting the end.
    diffs = [[DiffOperation.DIFF_EQUAL, "xa"], [DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_EQUAL, "a"]];
    dmp.diff_cleanupSemanticLossless(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "xaa"], [DiffOperation.DIFF_DELETE, "a"]]).toStrictEqual(diffs);

    // Sentence boundaries.
    diffs = [[DiffOperation.DIFF_EQUAL, "The xxx. The "], [DiffOperation.DIFF_INSERT, "zzz. The "], [DiffOperation.DIFF_EQUAL, "yyy."]];
    dmp.diff_cleanupSemanticLossless(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "The xxx."], [DiffOperation.DIFF_INSERT, " The zzz."], [DiffOperation.DIFF_EQUAL, " The yyy."]]).toStrictEqual(diffs);
  });

  it("DIFF - Cleanup Semantic", () =>
  {
    // Cleanup semantically trivial equalities.

    // Null case.
    let diffs: Diff[] = [];
    dmp.diff_cleanupSemantic(diffs);
    expect([]).toStrictEqual(diffs);

    // No elimination #1.
    diffs = [[DiffOperation.DIFF_DELETE, "ab"], [DiffOperation.DIFF_INSERT, "cd"], [DiffOperation.DIFF_EQUAL, "12"], [DiffOperation.DIFF_DELETE, "e"]];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_DELETE, "ab"], [DiffOperation.DIFF_INSERT, "cd"], [DiffOperation.DIFF_EQUAL, "12"], [DiffOperation.DIFF_DELETE, "e"]]).toStrictEqual(diffs);

    // No elimination #2.
    diffs = [[DiffOperation.DIFF_DELETE, "abc"], [DiffOperation.DIFF_INSERT, "ABC"], [DiffOperation.DIFF_EQUAL, "1234"], [DiffOperation.DIFF_DELETE, "wxyz"]];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abc"], [DiffOperation.DIFF_INSERT, "ABC"], [DiffOperation.DIFF_EQUAL, "1234"], [DiffOperation.DIFF_DELETE, "wxyz"]]).toStrictEqual(diffs);

    // Simple elimination.
    diffs = [[DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_EQUAL, "b"], [DiffOperation.DIFF_DELETE, "c"]];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abc"], [DiffOperation.DIFF_INSERT, "b"]]).toStrictEqual(diffs);

    // Backpass elimination.
    diffs = [[DiffOperation.DIFF_DELETE, "ab"], [DiffOperation.DIFF_EQUAL, "cd"], [DiffOperation.DIFF_DELETE, "e"], [DiffOperation.DIFF_EQUAL, "f"], [DiffOperation.DIFF_INSERT, "g"]];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abcdef"], [DiffOperation.DIFF_INSERT, "cdfg"]]).toStrictEqual(diffs);

    // Multiple eliminations.
    diffs = [
      [DiffOperation.DIFF_INSERT, "1"],
      [DiffOperation.DIFF_EQUAL, "A"],
      [DiffOperation.DIFF_DELETE, "B"],
      [DiffOperation.DIFF_INSERT, "2"],
      [DiffOperation.DIFF_EQUAL, "_"],
      [DiffOperation.DIFF_INSERT, "1"],
      [DiffOperation.DIFF_EQUAL, "A"],
      [DiffOperation.DIFF_DELETE, "B"],
      [DiffOperation.DIFF_INSERT, "2"]
    ];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_DELETE, "AB_AB"], [DiffOperation.DIFF_INSERT, "1A2_1A2"]]).toStrictEqual(diffs);

    // Word boundaries.
    diffs = [[DiffOperation.DIFF_EQUAL, "The c"], [DiffOperation.DIFF_DELETE, "ow and the c"], [DiffOperation.DIFF_EQUAL, "at."]];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_EQUAL, "The "], [DiffOperation.DIFF_DELETE, "cow and the "], [DiffOperation.DIFF_EQUAL, "cat."]]).toStrictEqual(diffs);

    // No overlap elimination.
    diffs = [[DiffOperation.DIFF_DELETE, "abcxx"], [DiffOperation.DIFF_INSERT, "xxdef"]];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abcxx"], [DiffOperation.DIFF_INSERT, "xxdef"]]).toStrictEqual(diffs);

    // Overlap elimination.
    diffs = [[DiffOperation.DIFF_DELETE, "abcxxx"], [DiffOperation.DIFF_INSERT, "xxxdef"]];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abc"], [DiffOperation.DIFF_EQUAL, "xxx"], [DiffOperation.DIFF_INSERT, "def"]]).toStrictEqual(diffs);

    // Reverse overlap elimination.
    diffs = [[DiffOperation.DIFF_DELETE, "xxxabc"], [DiffOperation.DIFF_INSERT, "defxxx"]];
    dmp.diff_cleanupSemantic(diffs);
    expect([[DiffOperation.DIFF_INSERT, "def"], [DiffOperation.DIFF_EQUAL, "xxx"], [DiffOperation.DIFF_DELETE, "abc"]]).toStrictEqual(diffs);

    // Two overlap eliminations.
    diffs = [
      [DiffOperation.DIFF_DELETE, "abcd1212"],
      [DiffOperation.DIFF_INSERT, "1212efghi"],
      [DiffOperation.DIFF_EQUAL, "----"],
      [DiffOperation.DIFF_DELETE, "A3"],
      [DiffOperation.DIFF_INSERT, "3BC"]
    ];
    dmp.diff_cleanupSemantic(diffs);
    expect([
      [DiffOperation.DIFF_DELETE, "abcd"],
      [DiffOperation.DIFF_EQUAL, "1212"],
      [DiffOperation.DIFF_INSERT, "efghi"],
      [DiffOperation.DIFF_EQUAL, "----"],
      [DiffOperation.DIFF_DELETE, "A"],
      [DiffOperation.DIFF_EQUAL, "3"],
      [DiffOperation.DIFF_INSERT, "BC"]
    ]).toStrictEqual(diffs);
  });
  //#endregion DIFF TEST FUNCTIONS

  //#region MATCH TEST FUNCTIONS
  //#endregion MATCH TEST FUNCTIONS

  //#region PATCH TEST FUNCTIONS
  //#endregion PATCH TEST FUNCTIONS
});