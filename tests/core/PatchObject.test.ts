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

import { PatchObject } from "../../src/core";
import { DiffOperation } from "../../src/types";

describe("diff-match-patch-ts - core/PatchObject", () =>
{
    it("PatchObject", () =>
    {
        // Patch Object.
        const p = new PatchObject();
        p.start1 = 20;
        p.start2 = 21;
        p.length1 = 18;
        p.length2 = 17;
        p.diffs = [
            [DiffOperation.DIFF_EQUAL, "jump"],
            [DiffOperation.DIFF_DELETE, "s"],
            [DiffOperation.DIFF_INSERT, "ed"],
            [DiffOperation.DIFF_EQUAL, " over "],
            [DiffOperation.DIFF_DELETE, "the"],
            [DiffOperation.DIFF_INSERT, "a"],
            [DiffOperation.DIFF_EQUAL, "\nlaz"]
        ];
        const strp = p.toString();
        expect("@@ -21,18 +22,17 @@\n jump\n-s\n+ed\n  over \n-the\n+a\n %0Alaz\n").toEqual(strp);
    });
});
