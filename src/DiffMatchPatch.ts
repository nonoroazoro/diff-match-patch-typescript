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
            } else
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
}
