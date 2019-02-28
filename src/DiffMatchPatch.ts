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
    // 1.0 = very loose).  Note that Match_Threshold controls how closely the
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
    public diff_main(
        text1: string,
        text2: string,
        opt_checklines: boolean,
        opt_deadline: number
    )
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
}
