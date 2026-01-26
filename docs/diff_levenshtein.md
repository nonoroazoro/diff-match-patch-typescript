# diff_levenshtein(diffs)

Computes the Levenshtein distance; the number of inserted, deleted or substituted characters.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 * @returns {number} Number of changes.
 */
diff_levenshtein(diffs: Diff[]): number
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main("Hello World", "Hello TypeScript");
const distance = dmp.diff_levenshtein(diffs);
// 15 (5 deletions + 10 insertions)
```
