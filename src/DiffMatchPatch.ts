import { Diff, DiffOperation } from "./types";

/**
 * Diff Match and Patch
 * Copyright 2018 The diff-match-patch Authors.
 *
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
 */

/**
 * @fileoverview Computes the difference between two texts to create a patch.
 * Applies the patch onto another text, allowing for errors.
 * @author fraser@google.com (Neil Fraser)
 *
 * Ported by [xiaochao.k@gmail.com](https://github.com/nonoroazoro)
 */

/**
 * Class containing the diff, match and patch methods.
 */
export class DiffMatchPatch
{
    // Defaults.
    // Redefine these in your program to override the defaults.

    // Number of seconds to map a diff before giving up (0 for infinity).
    private Diff_Timeout = 1.0;

    // Cost of an empty edit operation in terms of edit characters.
    private Diff_EditCost = 4;

    // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
    private Match_Threshold = 0.5;

    // How far to search for a match (0 = exact location, 1000+ = broad match).
    // A match this many characters away from the expected location will add
    // 1.0 to the score (0.0 is a perfect match).
    private Match_Distance = 1000;

    // When deleting a large block of text (over ~64 characters), how close do
    // the contents have to be to match the expected contents. (0.0 = perfection,
    // 1.0 = very loose). Note that Match_Threshold controls how closely the
    // end points of a delete need to match.
    private Patch_DeleteThreshold = 0.5;

    // Chunk size for context length.
    private Patch_Margin = 4;

    // The number of bits in an int.
    private Match_MaxBits = 32;

    /**
     * Find the differences between two texts. Simplifies the problem by stripping
     * any common prefix or suffix off the texts before diffing.
     *
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {boolean} opt_checklines Optional speedup flag. If present and false,
     * then don't run a line-level diff first to identify the changed areas.
     * Defaults to true, which does a faster, slightly less optimal diff.
     * @param {number} opt_deadline Optional time when the diff should be complete
     * by. Used internally for recursive calls. Users should set DiffTimeout
     * instead.
     * @returns {Diff[]} Array of diff tuples.
     */
    public diff_main(text1: string, text2: string, opt_checklines: boolean, opt_deadline: number): Diff[]
    {
        // Set a deadline by which time the diff must be complete.
        if (typeof opt_deadline === "undefined")
        {
            if (this.Diff_Timeout <= 0)
            {
                opt_deadline = Number.MAX_VALUE;
            }
            else
            {
                opt_deadline = Date.now() + this.Diff_Timeout * 1000;
            }
        }
        const deadline = opt_deadline;

        // Check for null inputs.
        if (text1 == null || text2 == null)
        {
            throw new Error("Null input. (diff_main)");
        }

        // Check for equality (speedup).
        if (text1 === text2)
        {
            if (text1)
            {
                return [[DiffOperation.DIFF_EQUAL, text1]];
            }
            return [];
        }

        if (typeof opt_checklines === "undefined")
        {
            opt_checklines = true;
        }
        const checklines = opt_checklines;

        // Trim off common prefix (speedup).
        let commonlength = this.diff_commonPrefix(text1, text2);
        const commonprefix = text1.substring(0, commonlength);
        text1 = text1.substring(commonlength);
        text2 = text2.substring(commonlength);

        // Trim off common suffix (speedup).
        commonlength = this.diff_commonSuffix(text1, text2);
        const commonsuffix = text1.substring(text1.length - commonlength);
        text1 = text1.substring(0, text1.length - commonlength);
        text2 = text2.substring(0, text2.length - commonlength);

        // Compute the diff on the middle block.
        const diffs: Diff[] = this.diff_compute_(text1, text2, checklines, deadline);

        // Restore the prefix and suffix.
        if (commonprefix)
        {
            diffs.unshift([DiffOperation.DIFF_EQUAL, commonprefix]);
        }
        if (commonsuffix)
        {
            diffs.push([DiffOperation.DIFF_EQUAL, commonsuffix]);
        }
        this.diff_cleanupMerge(diffs);
        return diffs;
    }

    /**
     * Find the differences between two texts. Assumes that the texts do not
     * have any common prefix or suffix.
     *
     * @private
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {boolean} checklines Speedup flag. If false, then don't run a
     * line-level diff first to identify the changed areas.
     * If true, then run a faster, slightly less optimal diff.
     * @param {number} deadline Time when the diff should be complete by.
     * @returns {Diff[]} Array of diff tuples.
     */
    private diff_compute_(text1: string, text2: string, checklines: boolean, deadline: number): Diff[]
    {
        let diffs: Diff[];

        if (!text1)
        {
            // Just add some text (speedup).
            return [[DiffOperation.DIFF_INSERT, text2]];
        }

        if (!text2)
        {
            // Just delete some text (speedup).
            return [[DiffOperation.DIFF_DELETE, text1]];
        }

        const longtext = text1.length > text2.length ? text1 : text2;
        const shorttext = text1.length > text2.length ? text2 : text1;
        const i = longtext.indexOf(shorttext);
        if (i !== -1)
        {
            // Shorter text is inside the longer text (speedup).
            diffs = [
                [DiffOperation.DIFF_INSERT, longtext.substring(0, i)],
                [DiffOperation.DIFF_EQUAL, shorttext],
                [DiffOperation.DIFF_INSERT, longtext.substring(i + shorttext.length)]
            ];
            // Swap insertions for deletions if diff is reversed.
            if (text1.length > text2.length)
            {
                diffs[0][0] = DiffOperation.DIFF_DELETE;
                diffs[2][0] = DiffOperation.DIFF_DELETE;
            }
            return diffs;
        }

        if (shorttext.length === 1)
        {
            // Single character string.
            // After the previous speedup, the character can't be an equality.
            return [
                [DiffOperation.DIFF_DELETE, text1],
                [DiffOperation.DIFF_INSERT, text2]
            ];
        }

        // Check to see if the problem can be split in two.
        const hm = this.diff_halfMatch_(text1, text2);
        if (hm)
        {
            // A half-match was found, sort out the return data.
            const text1_a = hm[0];
            const text1_b = hm[1];
            const text2_a = hm[2];
            const text2_b = hm[3];
            const mid_common = hm[4];
            // Send both pairs off for separate processing.
            const diffs_a = this.diff_main(text1_a, text2_a, checklines, deadline);
            const diffs_b = this.diff_main(text1_b, text2_b, checklines, deadline);
            // Merge the results.
            return diffs_a.concat([[DiffOperation.DIFF_EQUAL, mid_common]], diffs_b);
        }

        if (checklines && text1.length > 100 && text2.length > 100)
        {
            return this.diff_lineMode_(text1, text2, deadline);
        }

        return this.diff_bisect_(text1, text2, deadline);
    }

    /**
     * Do a quick line-level diff on both strings, then re-diff the parts for
     * greater accuracy.
     * This speedup can produce non-minimal diffs.
     *
     * @private
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {number} deadline Time when the diff should be complete by.
     * @returns {Diff[]} Array of diff tuples.
     */
    private diff_lineMode_(text1: string, text2: string, deadline: number): Diff[]
    {
        // Scan the text on a line-by-line basis first.
        const a = this.diff_linesToChars_(text1, text2);
        text1 = a.chars1;
        text2 = a.chars2;
        const linearray = a.lineArray;

        const diffs = this.diff_main(text1, text2, false, deadline);

        // Convert the diff back to original text.
        this.diff_charsToLines_(diffs, linearray);
        // Eliminate freak matches (e.g. blank lines)
        this.diff_cleanupSemantic(diffs);

        // Re-diff any replacement blocks, this time character-by-character.
        // Add a dummy entry at the end.
        diffs.push([DiffOperation.DIFF_EQUAL, ""]);
        let pointer = 0;
        let count_delete = 0;
        let count_insert = 0;
        let text_delete = "";
        let text_insert = "";
        while (pointer < diffs.length)
        {
            switch (diffs[pointer][0])
            {
                case DiffOperation.DIFF_INSERT:
                    count_insert++;
                    text_insert += diffs[pointer][1];
                    break;
                case DiffOperation.DIFF_DELETE:
                    count_delete++;
                    text_delete += diffs[pointer][1];
                    break;
                case DiffOperation.DIFF_EQUAL:
                    // Upon reaching an equality, check for prior redundancies.
                    if (count_delete >= 1 && count_insert >= 1)
                    {
                        // Delete the offending records and add the merged ones.
                        diffs.splice(pointer - count_delete - count_insert, count_delete + count_insert);
                        pointer = pointer - count_delete - count_insert;
                        const subDiff = this.diff_main(text_delete, text_insert, false, deadline);
                        for (let j = subDiff.length - 1; j >= 0; j--)
                        {
                            diffs.splice(pointer, 0, subDiff[j]);
                        }
                        pointer = pointer + subDiff.length;
                    }
                    count_insert = 0;
                    count_delete = 0;
                    text_delete = "";
                    text_insert = "";
                    break;
            }
            pointer++;
        }
        // Remove the dummy entry at the end.
        diffs.pop();

        return diffs;
    }

    /**
     * Find the 'middle snake' of a diff, split the problem in two
     * and return the recursively constructed diff.
     * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
     *
     * @private
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {number} deadline Time at which to bail if not yet complete.
     * @returns {Diff[]} Array of diff tuples.
     */
    private diff_bisect_(text1: string, text2: string, deadline: number): Diff[]
    {
        // Cache the text lengths to prevent multiple calls.
        const text1_length = text1.length;
        const text2_length = text2.length;
        const max_d = Math.ceil((text1_length + text2_length) / 2);
        const v_offset = max_d;
        const v_length = 2 * max_d;
        const v1 = new Array(v_length);
        const v2 = new Array(v_length);
        // Setting all elements to -1 is faster in Chrome & Firefox than mixing
        // integers and undefined.
        for (let x = 0; x < v_length; x++)
        {
            v1[x] = -1;
            v2[x] = -1;
        }
        v1[v_offset + 1] = 0;
        v2[v_offset + 1] = 0;
        const delta = text1_length - text2_length;
        // If the total number of characters is odd, then the front path will collide
        // with the reverse path.
        const front = (delta % 2 !== 0);
        // Offsets for start and end of k loop.
        // Prevents mapping of space beyond the grid.
        let k1start = 0;
        let k1end = 0;
        let k2start = 0;
        let k2end = 0;
        for (let d = 0; d < max_d; d++)
        {
            // Bail out if deadline is reached.
            if (Date.now() > deadline)
            {
                break;
            }

            // Walk the front path one step.
            for (let k1 = -d + k1start; k1 <= d - k1end; k1 += 2)
            {
                const k1_offset = v_offset + k1;
                let x1;
                if (k1 === -d || (k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1]))
                {
                    x1 = v1[k1_offset + 1];
                }
                else
                {
                    x1 = v1[k1_offset - 1] + 1;
                }

                let y1 = x1 - k1;
                while (
                    x1 < text1_length
                    && y1 < text2_length
                    && text1.charAt(x1) === text2.charAt(y1)
                )
                {
                    x1++;
                    y1++;
                }
                v1[k1_offset] = x1;
                if (x1 > text1_length)
                {
                    // Ran off the right of the graph.
                    k1end += 2;
                }
                else if (y1 > text2_length)
                {
                    // Ran off the bottom of the graph.
                    k1start += 2;
                }
                else if (front)
                {
                    const k2_offset = v_offset + delta - k1;
                    if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1)
                    {
                        // Mirror x2 onto top-left coordinate system.
                        const x2 = text1_length - v2[k2_offset];
                        if (x1 >= x2)
                        {
                            // Overlap detected.
                            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                        }
                    }
                }
            }

            // Walk the reverse path one step.
            for (let k2 = -d + k2start; k2 <= d - k2end; k2 += 2)
            {
                const k2_offset = v_offset + k2;
                let x2;
                if (k2 === -d || (k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1]))
                {
                    x2 = v2[k2_offset + 1];
                }
                else
                {
                    x2 = v2[k2_offset - 1] + 1;
                }
                let y2 = x2 - k2;
                while (
                    x2 < text1_length
                    && y2 < text2_length
                    && text1.charAt(text1_length - x2 - 1) === text2.charAt(text2_length - y2 - 1)
                )
                {
                    x2++;
                    y2++;
                }
                v2[k2_offset] = x2;
                if (x2 > text1_length)
                {
                    // Ran off the left of the graph.
                    k2end += 2;
                }
                else if (y2 > text2_length)
                {
                    // Ran off the top of the graph.
                    k2start += 2;
                }
                else if (!front)
                {
                    const k1_offset = v_offset + delta - k2;
                    if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1)
                    {
                        const x1 = v1[k1_offset];
                        const y1 = v_offset + x1 - k1_offset;
                        // Mirror x2 onto top-left coordinate system.
                        x2 = text1_length - x2;
                        if (x1 >= x2)
                        {
                            // Overlap detected.
                            return this.diff_bisectSplit_(text1, text2, x1, y1, deadline);
                        }
                    }
                }
            }
        }
        // Diff took too long and hit the deadline or
        // number of diffs equals number of characters, no commonality at all.
        return [
            [DiffOperation.DIFF_DELETE, text1],
            [DiffOperation.DIFF_INSERT, text2]
        ];
    }

    /**
     * Given the location of the 'middle snake', split the diff in two parts
     * and recurse.
     *
     * @private
     * @param {string} text1 Old string to be diffed.
     * @param {string} text2 New string to be diffed.
     * @param {number} x Index of split point in text1.
     * @param {number} y Index of split point in text2.
     * @param {number} deadline Time at which to bail if not yet complete.
     * @return {Diff[]} Array of diff tuples.
     */
    private diff_bisectSplit_(
        text1: string,
        text2: string,
        x: number,
        y: number,
        deadline: number
    ): Diff[]
    {
        const text1A = text1.substring(0, x);
        const text2A = text2.substring(0, y);
        const text1B = text1.substring(x);
        const text2B = text2.substring(y);

        // Compute both diffs serially.
        const diffsA = this.diff_main(text1A, text2A, false, deadline);
        const diffsB = this.diff_main(text1B, text2B, false, deadline);

        return diffsA.concat(diffsB);
    }

    /**
     * Split two texts into an array of strings. Reduce the texts to a string of
     * hashes where each Unicode character represents one line.
     *
     * @private
     * @param {string} text1 First string.
     * @param {string} text2 Second string.
     * @returns {{chars1: string, chars2: string, lineArray: string[]}}
     * An object containing the encoded text1, the encoded text2 and
     * the array of unique strings.
     * The zeroth element of the array of unique strings is intentionally blank.
     */
    private diff_linesToChars_(text1: string, text2: string): { chars1: string; chars2: string; lineArray: string[]; }
    {
        const lineArray: string[] = [];  // e.g. lineArray[4] == 'Hello\n'
        const lineHash: Record<string, number> = {};   // e.g. lineHash['Hello\n'] == 4

        // '\x00' is a valid character, but various debuggers don't like it.
        // So we'll insert a junk entry to avoid generating a null character.
        lineArray[0] = "";

        // Allocate 2/3rds of the space for text1, the rest for text2.
        const chars1 = this.diff_linesToCharsMunge_(text1, lineArray, lineHash, 40000);
        const chars2 = this.diff_linesToCharsMunge_(text2, lineArray, lineHash, 65535);
        return { chars1, chars2, lineArray };
    }

    /**
     * Split a text into an array of strings. Reduce the texts to a string of
     * hashes where each Unicode character represents one line.
     * Modifies linearray and linehash through being a closure.
     *
     * @private
     * @param {string} text String to encode.
     * @return {string} Encoded string.
     * @param {string[]} lineArray Array of unique strings.
     * @param {Record<string, number>} lineHash Line-hash pairs.
     * @param {number} maxLines
     */
    private diff_linesToCharsMunge_(
        text: string,
        lineArray: string[],
        lineHash: Record<string, number>,
        maxLines: number
    )
    {
        let chars = "";
        // Walk the text, pulling out a substring for each line.
        // text.split('\n') would would temporarily double our memory footprint.
        // Modifying text would create many large strings to garbage collect.
        let lineStart = 0;
        let lineEnd = -1;
        // Keeping our own length variable is faster than looking it up.
        let lineArrayLength = lineArray.length;
        while (lineEnd < text.length - 1)
        {
            lineEnd = text.indexOf("\n", lineStart);
            if (lineEnd === -1)
            {
                lineEnd = text.length - 1;
            }
            let line = text.substring(lineStart, lineEnd + 1);

            if (
                lineHash.hasOwnProperty
                    ? lineHash.hasOwnProperty(line)
                    : (lineHash[line] !== undefined)
            )
            {
                chars += String.fromCharCode(lineHash[line]);
            }
            else
            {
                if (lineArrayLength === maxLines)
                {
                    // Bail out at 65535 because
                    // String.fromCharCode(65536) == String.fromCharCode(0)
                    line = text.substring(lineStart);
                    lineEnd = text.length;
                }
                chars += String.fromCharCode(lineArrayLength);
                lineHash[line] = lineArrayLength;
                lineArray[lineArrayLength++] = line;
            }
            lineStart = lineEnd + 1;
        }
        return chars;
    }

    /**
     * Rehydrate the text in a diff from a string of line hashes to real lines of
     * text.
     *
     * @private
     * @param {Diff[]} diffs Array of diff tuples.
     * @param {string[]} lineArray Array of unique strings.
     */
    private diff_charsToLines_(diffs: Diff[], lineArray: string[])
    {
        for (let i = 0; i < diffs.length; i++)
        {
            const chars = diffs[i][1];
            const text = [];
            for (let j = 0; j < chars.length; j++)
            {
                text[j] = lineArray[chars.charCodeAt(j)];
            }
            diffs[i][1] = text.join("");
        }
    }
}
