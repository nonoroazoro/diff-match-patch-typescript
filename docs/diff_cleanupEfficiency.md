# diff_cleanupEfficiency(diffs)

Reduces the number of edits by eliminating operationally trivial equalities.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 */
diff_cleanupEfficiency(diffs: Diff[]): void
```

## Example

```typescript
import { DiffMatchPatch, DiffOperation } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
dmp.diffEditCost = 4;
const diffs: Diff[] = [
    [DiffOperation.DIFF_DELETE, "ab"],
    [DiffOperation.DIFF_INSERT, "12"],
    [DiffOperation.DIFF_EQUAL, "xyz"],
    [DiffOperation.DIFF_DELETE, "cd"],
    [DiffOperation.DIFF_INSERT, "34"]
];
dmp.diff_cleanupEfficiency(diffs);
// After: [[-1,"abxyzcd"],[1,"12xyz34"]]
```
