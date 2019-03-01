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

  it("DIFF - Cleanup Efficiency", () =>
  {
    // Cleanup operationally trivial equalities.
    dmp.Diff_EditCost = 4;

    // Null case.
    let diffs: Diff[] = [];
    dmp.diff_cleanupEfficiency(diffs);
    expect([]).toStrictEqual(diffs);

    // No elimination.
    diffs = [
      [DiffOperation.DIFF_DELETE, "ab"],
      [DiffOperation.DIFF_INSERT, "12"],
      [DiffOperation.DIFF_EQUAL, "wxyz"],
      [DiffOperation.DIFF_DELETE, "cd"],
      [DiffOperation.DIFF_INSERT, "34"]
    ];
    dmp.diff_cleanupEfficiency(diffs);
    expect([
      [DiffOperation.DIFF_DELETE, "ab"],
      [DiffOperation.DIFF_INSERT, "12"],
      [DiffOperation.DIFF_EQUAL, "wxyz"],
      [DiffOperation.DIFF_DELETE, "cd"],
      [DiffOperation.DIFF_INSERT, "34"]
    ]).toStrictEqual(diffs);

    // Four-edit elimination.
    diffs = [[DiffOperation.DIFF_DELETE, "ab"], [DiffOperation.DIFF_INSERT, "12"], [DiffOperation.DIFF_EQUAL, "xyz"], [DiffOperation.DIFF_DELETE, "cd"], [DiffOperation.DIFF_INSERT, "34"]];
    dmp.diff_cleanupEfficiency(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abxyzcd"], [DiffOperation.DIFF_INSERT, "12xyz34"]]).toStrictEqual(diffs);

    // Three-edit elimination.
    diffs = [[DiffOperation.DIFF_INSERT, "12"], [DiffOperation.DIFF_EQUAL, "x"], [DiffOperation.DIFF_DELETE, "cd"], [DiffOperation.DIFF_INSERT, "34"]];
    dmp.diff_cleanupEfficiency(diffs);
    expect([[DiffOperation.DIFF_DELETE, "xcd"], [DiffOperation.DIFF_INSERT, "12x34"]]).toStrictEqual(diffs);

    // Backpass elimination.
    diffs = [
      [DiffOperation.DIFF_DELETE, "ab"],
      [DiffOperation.DIFF_INSERT, "12"],
      [DiffOperation.DIFF_EQUAL, "xy"],
      [DiffOperation.DIFF_INSERT, "34"],
      [DiffOperation.DIFF_EQUAL, "z"],
      [DiffOperation.DIFF_DELETE, "cd"],
      [DiffOperation.DIFF_INSERT, "56"]
    ];
    dmp.diff_cleanupEfficiency(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abxyzcd"], [DiffOperation.DIFF_INSERT, "12xy34z56"]]).toStrictEqual(diffs);

    // High cost elimination.
    dmp.Diff_EditCost = 5;
    diffs = [[DiffOperation.DIFF_DELETE, "ab"], [DiffOperation.DIFF_INSERT, "12"], [DiffOperation.DIFF_EQUAL, "wxyz"], [DiffOperation.DIFF_DELETE, "cd"], [DiffOperation.DIFF_INSERT, "34"]];
    dmp.diff_cleanupEfficiency(diffs);
    expect([[DiffOperation.DIFF_DELETE, "abwxyzcd"], [DiffOperation.DIFF_INSERT, "12wxyz34"]]).toStrictEqual(diffs);
    dmp.Diff_EditCost = 4;
  });

  it("DIFF - Pretty Html", () =>
  {
    // Pretty print.
    const diffs: Diff[] = [[DiffOperation.DIFF_EQUAL, "a\n"], [DiffOperation.DIFF_DELETE, "<B>b</B>"], [DiffOperation.DIFF_INSERT, "c&d"]];
    expect('<span>a&para;<br></span><del style="background:#ffe6e6;">&lt;B&gt;b&lt;/B&gt;</del><ins style="background:#e6ffe6;">c&amp;d</ins>').toStrictEqual(dmp.diff_prettyHtml(diffs));
  });

  it("DIFF - Text", () =>
  {
    // Compute the source and destination texts.
    const diffs: Diff[] = [
      [DiffOperation.DIFF_EQUAL, "jump"],
      [DiffOperation.DIFF_DELETE, "s"],
      [DiffOperation.DIFF_INSERT, "ed"],
      [DiffOperation.DIFF_EQUAL, " over "],
      [DiffOperation.DIFF_DELETE, "the"],
      [DiffOperation.DIFF_INSERT, "a"],
      [DiffOperation.DIFF_EQUAL, " lazy"]
    ];
    expect("jumps over the lazy").toStrictEqual(dmp.diff_text1(diffs));
    expect("jumped over a lazy").toStrictEqual(dmp.diff_text2(diffs));
  });

  it("DIFF - Delta", () =>
  {
    // Convert a diff into delta string.
    let diffs: Diff[] = [
      [DiffOperation.DIFF_EQUAL, "jump"],
      [DiffOperation.DIFF_DELETE, "s"],
      [DiffOperation.DIFF_INSERT, "ed"],
      [DiffOperation.DIFF_EQUAL, " over "],
      [DiffOperation.DIFF_DELETE, "the"],
      [DiffOperation.DIFF_INSERT, "a"],
      [DiffOperation.DIFF_EQUAL, " lazy"],
      [DiffOperation.DIFF_INSERT, "old dog"]
    ];
    let text1 = dmp.diff_text1(diffs);
    expect("jumps over the lazy").toEqual(text1);

    let delta = dmp.diff_toDelta(diffs);
    expect("=4\t-1\t+ed\t=6\t-3\t+a\t=5\t+old dog").toEqual(delta);

    // Convert delta string into a diff.
    expect(dmp.diff_fromDelta(text1, delta)).toStrictEqual(diffs);

    // Generates error (19 != 20).
    try
    {
      dmp.diff_fromDelta(text1 + "x", delta);
      fail("Should generates error (19 != 20)");
    }
    catch (e)
    {
      // Exception expected.
      expect(e.message).toEqual("Delta length (19) does not equal source text length (20)");
    }

    // Generates error (19 != 18).
    try
    {
      dmp.diff_fromDelta(text1.substring(1), delta);
      fail("Should generates error (19 != 18)");
    }
    catch (e)
    {
      // Exception expected.
      expect(e.message).toEqual("Delta length (19) does not equal source text length (18)");
    }

    // Generates error (%c3%xy invalid Unicode).
    try
    {
      dmp.diff_fromDelta("", "+%c3%xy");
      fail("Should generates error (%c3%xy invalid Unicode)");
    }
    catch (e)
    {
      // Exception expected.
      expect(e.message).toEqual("Illegal escape in diff_fromDelta: %c3%xy");
    }

    // Test deltas with special characters.
    diffs = [[DiffOperation.DIFF_EQUAL, "\u0680 \x00 \t %"], [DiffOperation.DIFF_DELETE, "\u0681 \x01 \n ^"], [DiffOperation.DIFF_INSERT, "\u0682 \x02 \\ |"]];
    text1 = dmp.diff_text1(diffs);
    expect("\u0680 \x00 \t %\u0681 \x01 \n ^").toEqual(text1);

    delta = dmp.diff_toDelta(diffs);
    expect("=7\t-7\t+%DA%82 %02 %5C %7C").toEqual(delta);

    // Convert delta string into a diff.
    expect(dmp.diff_fromDelta(text1, delta)).toStrictEqual(diffs);

    // Verify pool of unchanged characters.
    diffs = [[DiffOperation.DIFF_INSERT, "A-Z a-z 0-9 - _ . ! ~ * ' ( ) ; / ? : @ & = + $ , # "]];
    const text2 = dmp.diff_text2(diffs);
    expect("A-Z a-z 0-9 - _ . ! ~ * ' ( ) ; / ? : @ & = + $ , # ").toEqual(text2);

    delta = dmp.diff_toDelta(diffs);
    expect("+A-Z a-z 0-9 - _ . ! ~ * ' ( ) ; / ? : @ & = + $ , # ").toEqual(delta);

    // Convert delta string into a diff.
    expect(dmp.diff_fromDelta("", delta)).toStrictEqual(diffs);

    // 160 kb string.
    let a = "abcdefghij";
    for (let i = 0; i < 14; i++)
    {
      a += a;
    }
    diffs = [[DiffOperation.DIFF_INSERT, a]];
    delta = dmp.diff_toDelta(diffs);
    expect("+" + a).toEqual(delta);

    // Convert delta string into a diff.
    expect(dmp.diff_fromDelta("", delta)).toStrictEqual(diffs);
  });

  it("DIFF - XIndex", () =>
  {
    // Translate a location in text1 to text2.

    // Translation on equality.
    expect(dmp.diff_xIndex([[DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_INSERT, "1234"], [DiffOperation.DIFF_EQUAL, "xyz"]], 2)).toBe(5);

    // Translation on deletion.
    expect(dmp.diff_xIndex([[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_DELETE, "1234"], [DiffOperation.DIFF_EQUAL, "xyz"]], 3)).toBe(1);
  });

  it("DIFF - Levenshtein", () =>
  {
    // Levenshtein with trailing equality.
    expect(dmp.diff_levenshtein([[DiffOperation.DIFF_DELETE, "abc"], [DiffOperation.DIFF_INSERT, "1234"], [DiffOperation.DIFF_EQUAL, "xyz"]])).toBe(4);

    // Levenshtein with leading equality.
    expect(dmp.diff_levenshtein([[DiffOperation.DIFF_EQUAL, "xyz"], [DiffOperation.DIFF_DELETE, "abc"], [DiffOperation.DIFF_INSERT, "1234"]])).toBe(4);

    // Levenshtein with middle equality.
    expect(dmp.diff_levenshtein([[DiffOperation.DIFF_DELETE, "abc"], [DiffOperation.DIFF_EQUAL, "xyz"], [DiffOperation.DIFF_INSERT, "1234"]])).toBe(7);
  });

  it("DIFF - Bisect", () =>
  {
    // Normal.
    const a = "cat";
    const b = "map";
    // Since the resulting diff hasn't been normalized, it would be ok if
    // the insertion and deletion pairs are swapped.
    // If the order changes, tweak this test as required.
    expect(dmp["diff_bisect_"](a, b, Number.MAX_VALUE)).toStrictEqual([
      [DiffOperation.DIFF_DELETE, "c"],
      [DiffOperation.DIFF_INSERT, "m"],
      [DiffOperation.DIFF_EQUAL, "a"],
      [DiffOperation.DIFF_DELETE, "t"],
      [DiffOperation.DIFF_INSERT, "p"]
    ]);

    // Timeout.
    expect(dmp["diff_bisect_"](a, b, 0)).toStrictEqual([[DiffOperation.DIFF_DELETE, "cat"], [DiffOperation.DIFF_INSERT, "map"]]);
  });

  it("DIFF - Main", () =>
  {
    // Perform a trivial diff.

    // Null case.
    expect([]).toStrictEqual(dmp.diff_main("", "", false));

    // Equality.
    expect([[DiffOperation.DIFF_EQUAL, "abc"]]).toStrictEqual(dmp.diff_main("abc", "abc", false));

    // Simple insertion.
    expect([[DiffOperation.DIFF_EQUAL, "ab"], [DiffOperation.DIFF_INSERT, "123"], [DiffOperation.DIFF_EQUAL, "c"]]).toStrictEqual(dmp.diff_main("abc", "ab123c", false));

    // Simple deletion.
    expect([[DiffOperation.DIFF_EQUAL, "a"], [DiffOperation.DIFF_DELETE, "123"], [DiffOperation.DIFF_EQUAL, "bc"]]).toStrictEqual(dmp.diff_main("a123bc", "abc", false));

    // Two insertions.
    expect([
      [DiffOperation.DIFF_EQUAL, "a"],
      [DiffOperation.DIFF_INSERT, "123"],
      [DiffOperation.DIFF_EQUAL, "b"],
      [DiffOperation.DIFF_INSERT, "456"],
      [DiffOperation.DIFF_EQUAL, "c"]
    ]).toStrictEqual(dmp.diff_main("abc", "a123b456c", false));

    // Two deletions.
    expect([
      [DiffOperation.DIFF_EQUAL, "a"],
      [DiffOperation.DIFF_DELETE, "123"],
      [DiffOperation.DIFF_EQUAL, "b"],
      [DiffOperation.DIFF_DELETE, "456"],
      [DiffOperation.DIFF_EQUAL, "c"]
    ]).toStrictEqual(dmp.diff_main("a123b456c", "abc", false));

    // Perform a real diff.
    // Switch off the timeout.
    dmp.Diff_Timeout = 0;
    // Simple cases.
    expect([[DiffOperation.DIFF_DELETE, "a"], [DiffOperation.DIFF_INSERT, "b"]]).toStrictEqual(dmp.diff_main("a", "b", false));

    expect([
      [DiffOperation.DIFF_DELETE, "Apple"],
      [DiffOperation.DIFF_INSERT, "Banana"],
      [DiffOperation.DIFF_EQUAL, "s are a"],
      [DiffOperation.DIFF_INSERT, "lso"],
      [DiffOperation.DIFF_EQUAL, " fruit."]
    ]).toStrictEqual(dmp.diff_main("Apples are a fruit.", "Bananas are also fruit.", false));

    expect([
      [DiffOperation.DIFF_DELETE, "a"],
      [DiffOperation.DIFF_INSERT, "\u0680"],
      [DiffOperation.DIFF_EQUAL, "x"],
      [DiffOperation.DIFF_DELETE, "\t"],
      [DiffOperation.DIFF_INSERT, "\0"]
    ]).toStrictEqual(dmp.diff_main("ax\t", "\u0680x\0", false));

    // Overlaps.
    expect([
      [DiffOperation.DIFF_DELETE, "1"],
      [DiffOperation.DIFF_EQUAL, "a"],
      [DiffOperation.DIFF_DELETE, "y"],
      [DiffOperation.DIFF_EQUAL, "b"],
      [DiffOperation.DIFF_DELETE, "2"],
      [DiffOperation.DIFF_INSERT, "xab"]
    ]).toStrictEqual(dmp.diff_main("1ayb2", "abxab", false));

    expect([
      [DiffOperation.DIFF_INSERT, "xaxcx"],
      [DiffOperation.DIFF_EQUAL, "abc"],
      [DiffOperation.DIFF_DELETE, "y"]
    ]).toStrictEqual(dmp.diff_main("abcy", "xaxcxabc", false));

    expect([
      [DiffOperation.DIFF_DELETE, "ABCD"],
      [DiffOperation.DIFF_EQUAL, "a"],
      [DiffOperation.DIFF_DELETE, "="],
      [DiffOperation.DIFF_INSERT, "-"],
      [DiffOperation.DIFF_EQUAL, "bcd"],
      [DiffOperation.DIFF_DELETE, "="],
      [DiffOperation.DIFF_INSERT, "-"],
      [DiffOperation.DIFF_EQUAL, "efghijklmnopqrs"],
      [DiffOperation.DIFF_DELETE, "EFGHIJKLMNOefg"]
    ]).toStrictEqual(dmp.diff_main("ABCDa=bcd=efghijklmnopqrsEFGHIJKLMNOefg", "a-bcd-efghijklmnopqrs", false));

    // Large equality.
    expect([
      [DiffOperation.DIFF_INSERT, " "],
      [DiffOperation.DIFF_EQUAL, "a"],
      [DiffOperation.DIFF_INSERT, "nd"],
      [DiffOperation.DIFF_EQUAL, " [[Pennsylvania]]"],
      [DiffOperation.DIFF_DELETE, " and [[New"]
    ]).toStrictEqual(dmp.diff_main("a [[Pennsylvania]] and [[New", " and [[Pennsylvania]]", false));

    // Timeout.
    dmp.Diff_Timeout = 0.1;  // 100ms
    let a = "`Twas brillig, and the slithy toves\nDid gyre and gimble in the wabe:\nAll mimsy were the borogoves"
      + ",\nAnd the mome raths outgrabe.\n";
    let b = "I am the very model of a modern major general,\nI've information vegetable, animal"
      + ", and mineral,\nI know the kings of England, and I quote the fights historical"
      + ",\nFrom Marathon to Waterloo, in order categorical.\n";
    // Increase the text lengths by 1024 times to ensure a timeout.
    for (let i = 0; i < 10; i++)
    {
      a += a;
      b += b;
    }
    const startTime = Date.now();
    dmp.diff_main(a, b);
    const endTime = Date.now();
    // Test that we took at least the timeout period.
    expect(dmp.Diff_Timeout * 1000 <= endTime - startTime).toBe(true);
    // Test that we didn't take forever (be forgiving).
    // Theoretically this test could fail very occasionally if the
    // OS task swaps or locks up for a second at the wrong moment.
    expect(dmp.Diff_Timeout * 1000 * 2 > endTime - startTime).toBe(true);
    dmp.Diff_Timeout = 0;

    // Test the linemode speedup.
    // Must be long to pass the 100 char cutoff.
    // Simple line-mode.
    a = "1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n";
    b = "abcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\nabcdefghij\n";
    expect(dmp.diff_main(a, b, false)).toStrictEqual(dmp.diff_main(a, b, true));

    // Single line-mode.
    a = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890";
    b = "abcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghijabcdefghij";
    expect(dmp.diff_main(a, b, false)).toStrictEqual(dmp.diff_main(a, b, true));

    // Overlap line-mode.
    function diff_rebuildtexts(diffs: Diff[])
    {
      // Construct the two texts which made up the diff originally.
      let text1 = "";
      let text2 = "";
      for (let x = 0; x < diffs.length; x++)
      {
        if (diffs[x][0] !== DiffOperation.DIFF_INSERT)
        {
          text1 += diffs[x][1];
        }
        if (diffs[x][0] !== DiffOperation.DIFF_DELETE)
        {
          text2 += diffs[x][1];
        }
      }
      return [text1, text2];
    }

    a = "1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n1234567890\n";
    b = "abcdefghij\n1234567890\n1234567890\n1234567890\nabcdefghij\n1234567890\n1234567890\n1234567890\nabcdefghij\n1234567890\n1234567890\n1234567890\nabcdefghij\n";
    const textsLinemode = diff_rebuildtexts(dmp.diff_main(a, b, true));
    const textsTextmode = diff_rebuildtexts(dmp.diff_main(a, b, false));
    expect(textsTextmode).toStrictEqual(textsLinemode);

    // Test null inputs.
    try
    {
      dmp.diff_main(null as any, null as any);
      fail("Should generates error of null inputs");
    }
    catch (e)
    {
      // Exception expected.
      expect(e.message).toEqual("Null input. (diff_main)");
    }
  });
  //#endregion DIFF TEST FUNCTIONS

  //#region MATCH TEST FUNCTIONS
  it("MATCH - Alphabet", () =>
  {
    // Initialize the bitmasks for Bitap.

    // Unique.
    expect({ a: 4, b: 2, c: 1 }).toStrictEqual(dmp["match_alphabet_"]("abc"));

    // Duplicates.
    expect({ a: 37, b: 18, c: 8 }).toStrictEqual(dmp["match_alphabet_"]("abcaba"));
  });

  it("MATCH - Bitap", () =>
  {
    // Bitap algorithm.
    dmp.Match_Distance = 100;
    dmp.Match_Threshold = 0.5;
    // Exact matches.
    expect(5).toEqual(dmp["match_bitap_"]("abcdefghijk", "fgh", 5));

    expect(5).toEqual(dmp["match_bitap_"]("abcdefghijk", "fgh", 0));

    // Fuzzy matches.
    expect(4).toEqual(dmp["match_bitap_"]("abcdefghijk", "efxhi", 0));

    expect(2).toEqual(dmp["match_bitap_"]("abcdefghijk", "cdefxyhijk", 5));

    expect(-1).toEqual(dmp["match_bitap_"]("abcdefghijk", "bxy", 1));

    // Overflow.
    expect(2).toEqual(dmp["match_bitap_"]("123456789xx0", "3456789x0", 2));

    // Threshold test.
    dmp.Match_Threshold = 0.4;
    expect(4).toEqual(dmp["match_bitap_"]("abcdefghijk", "efxyhi", 1));

    dmp.Match_Threshold = 0.3;
    expect(-1).toEqual(dmp["match_bitap_"]("abcdefghijk", "efxyhi", 1));

    dmp.Match_Threshold = 0.0;
    expect(1).toEqual(dmp["match_bitap_"]("abcdefghijk", "bcdef", 1));
    dmp.Match_Threshold = 0.5;

    // Multiple select.
    expect(0).toEqual(dmp["match_bitap_"]("abcdexyzabcde", "abccde", 3));

    expect(8).toEqual(dmp["match_bitap_"]("abcdexyzabcde", "abccde", 5));

    // Distance test.
    dmp.Match_Distance = 10;  // Strict location.
    expect(-1).toEqual(dmp["match_bitap_"]("abcdefghijklmnopqrstuvwxyz", "abcdefg", 24));

    expect(0).toEqual(dmp["match_bitap_"]("abcdefghijklmnopqrstuvwxyz", "abcdxxefg", 1));

    dmp.Match_Distance = 1000;  // Loose location.
    expect(0).toEqual(dmp["match_bitap_"]("abcdefghijklmnopqrstuvwxyz", "abcdefg", 24));
  });

  it("MATCH - Main", () =>
  {
    // Full match.
    // Shortcut matches.
    expect(0).toEqual(dmp.match_main("abcdef", "abcdef", 1000));

    expect(-1).toEqual(dmp.match_main("", "abcdef", 1));

    expect(3).toEqual(dmp.match_main("abcdef", "", 3));

    expect(3).toEqual(dmp.match_main("abcdef", "de", 3));

    // Beyond end match.
    expect(3).toEqual(dmp.match_main("abcdef", "defy", 4));

    // Oversized pattern.
    expect(0).toEqual(dmp.match_main("abcdef", "abcdefy", 0));

    // Complex match.
    expect(4).toEqual(dmp.match_main("I am the very model of a modern major general.", " that berry ", 5));

    // Test null inputs.
    try
    {
      dmp.match_main(null as any, null as any, 0);
      fail("Should generates error of null inputs");
    }
    catch (e)
    {
      // Exception expected.
      expect(e.message).toEqual("Null input. (match_main)");
    }
  });
  //#endregion MATCH TEST FUNCTIONS

  //#region PATCH TEST FUNCTIONS
  it("PATCH - From Text", () =>
  {
    expect([]).toStrictEqual(dmp.patch_fromText(null as any));

    const strp = "@@ -21,18 +22,17 @@\n jump\n-s\n+ed\n  over \n-the\n+a\n %0Alaz\n";
    expect(strp).toEqual(dmp.patch_fromText(strp)[0].toString());

    expect("@@ -1 +1 @@\n-a\n+b\n").toEqual(dmp.patch_fromText("@@ -1 +1 @@\n-a\n+b\n")[0].toString());

    expect("@@ -1,3 +0,0 @@\n-abc\n").toEqual(dmp.patch_fromText("@@ -1,3 +0,0 @@\n-abc\n")[0].toString());

    expect("@@ -0,0 +1,3 @@\n+abc\n").toEqual(dmp.patch_fromText("@@ -0,0 +1,3 @@\n+abc\n")[0].toString());

    // Generates error.
    try
    {
      dmp.patch_fromText("Bad\nPatch\n");
      fail("Should generates error");
    }
    catch (e)
    {
      // Exception expected.
      expect(e.message).toEqual("Invalid patch string: Bad");
    }
  });

  it("PATCH - To Text", () =>
  {
    let strp = "@@ -21,18 +22,17 @@\n jump\n-s\n+ed\n  over \n-the\n+a\n  laz\n";
    let p = dmp.patch_fromText(strp);
    expect(strp).toEqual(dmp.patch_toText(p));

    strp = "@@ -1,9 +1,9 @@\n-f\n+F\n oo+fooba\n@@ -7,9 +7,9 @@\n obar\n-,\n+.\n  tes\n";
    p = dmp.patch_fromText(strp);
    expect(strp).toEqual(dmp.patch_toText(p));
  });

  it("PATCH - Add Context", () =>
  {
    dmp.Patch_Margin = 4;
    let p = dmp.patch_fromText("@@ -21,4 +21,10 @@\n-jump\n+somersault\n")[0];
    dmp["patch_addContext_"](p, "The quick brown fox jumps over the lazy dog.");
    expect("@@ -17,12 +17,18 @@\n fox \n-jump\n+somersault\n s ov\n").toEqual(p.toString());

    // Same, but not enough trailing context.
    p = dmp.patch_fromText("@@ -21,4 +21,10 @@\n-jump\n+somersault\n")[0];
    dmp["patch_addContext_"](p, "The quick brown fox jumps.");
    expect("@@ -17,10 +17,16 @@\n fox \n-jump\n+somersault\n s.\n").toEqual(p.toString());

    // Same, but not enough leading context.
    p = dmp.patch_fromText("@@ -3 +3,2 @@\n-e\n+at\n")[0];
    dmp["patch_addContext_"](p, "The quick brown fox jumps.");
    expect("@@ -1,7 +1,8 @@\n Th\n-e\n+at\n  qui\n").toEqual(p.toString());

    // Same, but with ambiguity.
    p = dmp.patch_fromText("@@ -3 +3,2 @@\n-e\n+at\n")[0];
    dmp["patch_addContext_"](p, "The quick brown fox jumps.  The quick brown fox crashes.");
    expect("@@ -1,27 +1,28 @@\n Th\n-e\n+at\n  quick brown fox jumps. \n").toEqual(p.toString());
  });

  it("PATCH - Make", () =>
  {
    // Null case.
    let patches = dmp.patch_make("", "");
    expect("").toEqual(dmp.patch_toText(patches));

    let text1 = "The quick brown fox jumps over the lazy dog.";
    let text2 = "That quick brown fox jumped over a lazy dog.";
    // Text2+Text1 inputs.
    let expectedPatch = "@@ -1,8 +1,7 @@\n Th\n-at\n+e\n  qui\n@@ -21,17 +21,18 @@\n jump\n-ed\n+s\n  over \n-a\n+the\n  laz\n";
    // The second patch must be "-21,17 +21,18", not "-22,17 +21,18" due to rolling context.
    patches = dmp.patch_make(text2, text1);
    expect(expectedPatch).toEqual(dmp.patch_toText(patches));

    // Text1+Text2 inputs.
    expectedPatch = "@@ -1,11 +1,12 @@\n Th\n-e\n+at\n  quick b\n@@ -22,18 +22,17 @@\n jump\n-s\n+ed\n  over \n-the\n+a\n  laz\n";
    patches = dmp.patch_make(text1, text2);
    expect(expectedPatch).toEqual(dmp.patch_toText(patches));

    // Diff input.
    let diffs = dmp.diff_main(text1, text2, false);
    patches = dmp.patch_make(diffs);
    expect(expectedPatch).toEqual(dmp.patch_toText(patches));

    // Text1+Diff inputs.
    patches = dmp.patch_make(text1, diffs);
    expect(expectedPatch).toEqual(dmp.patch_toText(patches));

    // Text1+Text2+Diff inputs (deprecated).
    patches = dmp.patch_make(text1, text2, diffs);
    expect(expectedPatch).toEqual(dmp.patch_toText(patches));

    // Character encoding.
    patches = dmp.patch_make("`1234567890-=[]\\;',./", '~!@#$%^&*()_+{}|:"<>?');
    expect("@@ -1,21 +1,21 @@\n-%601234567890-=%5B%5D%5C;',./\n+~!@#$%25%5E&*()_+%7B%7D%7C:%22%3C%3E?\n").toEqual(dmp.patch_toText(patches));

    // Character decoding.
    diffs = [[DiffOperation.DIFF_DELETE, "`1234567890-=[]\\;',./"], [DiffOperation.DIFF_INSERT, '~!@#$%^&*()_+{}|:"<>?']];
    expect(dmp.patch_fromText("@@ -1,21 +1,21 @@\n-%601234567890-=%5B%5D%5C;',./\n+~!@#$%25%5E&*()_+%7B%7D%7C:%22%3C%3E?\n")[0].diffs).toEqual(diffs);

    // Long string with repeats.
    text1 = "";
    for (let x = 0; x < 100; x++)
    {
      text1 += "abcdef";
    }
    text2 = text1 + "123";
    expectedPatch = "@@ -573,28 +573,31 @@\n cdefabcdefabcdefabcdefabcdef\n+123\n";
    patches = dmp.patch_make(text1, text2);
    expect(expectedPatch).toEqual(dmp.patch_toText(patches));

    // Test null inputs.
    try
    {
      dmp.patch_make(null as any);
      fail("Should generates error of null inputs");
    }
    catch (e)
    {
      // Exception expected.
      expect(e.message).toEqual("Unknown call format to patch_make");
    }
  });
  //#endregion PATCH TEST FUNCTIONS
});
