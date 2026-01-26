# diff_cleanupMerge(diffs)

Reorders and merges like edit sections. Merges equalities.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 */
diff_cleanupMerge(diffs: Diff[]): void
```

## Example

```typescript
import { DiffMatchPatch, DiffOperation } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs: Diff[] = [
    [DiffOperation.DIFF_EQUAL, "a"],
    [DiffOperation.DIFF_EQUAL, "b"],
    [DiffOperation.DIFF_EQUAL, "c"]
];
dmp.diff_cleanupMerge(diffs);
// After: [[0,"abc"]]
```
