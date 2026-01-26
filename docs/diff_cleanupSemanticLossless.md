# diff_cleanupSemanticLossless(diffs)

Optimizes diff boundaries on logical boundaries (e.g., word boundaries, line breaks).

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 */
diff_cleanupSemanticLossless(diffs: Diff[]): void
```

## Example

```typescript
import { DiffMatchPatch, DiffOperation } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs: Diff[] = [
    [DiffOperation.DIFF_EQUAL, "The c"],
    [DiffOperation.DIFF_INSERT, "ow and the c"],
    [DiffOperation.DIFF_EQUAL, "at."]
];
dmp.diff_cleanupSemanticLossless(diffs);
// After: [[0,"The "],[1,"cow and the "],[0,"cat."]]
```
