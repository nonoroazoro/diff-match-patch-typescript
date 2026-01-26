# diff_xIndex(diffs, loc)

Locates the position of a character in text1 within text2 after applying the diff.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 * @param {number} loc Location within text1.
 * @returns {number} Location within text2.
 */
diff_xIndex(diffs: Diff[], loc: number): number
```

## Example

```typescript
import { DiffMatchPatch, DiffOperation } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs: Diff[] = [
    [DiffOperation.DIFF_DELETE, "a"],
    [DiffOperation.DIFF_INSERT, "1234"],
    [DiffOperation.DIFF_EQUAL, "xyz"]
];
// Character 2 in text1 ("axyz") maps to character 5 in text2 ("1234xyz")
const index = dmp.diff_xIndex(diffs, 2);
// 5
```
