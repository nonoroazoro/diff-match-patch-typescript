# diff_cleanupSemantic(diffs)

Reduces the number of edits by eliminating semantically trivial equalities.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 */
diff_cleanupSemantic(diffs: Diff[]): void
```

## Example

```typescript
import { DiffMatchPatch, DiffOperation } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main("mouse", "sofas");
dmp.diff_cleanupSemantic(diffs);
// Before: [[-1,"mou"],[ 1,"sofa"],[ 0,"s"],[-1,"e"]]
// After:  [[-1,"mouse"],[1,"sofas"]]
```
