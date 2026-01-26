# diff_text2(diffs)

Computes the destination text (text2) from a diff array.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 * @returns {string} Destination text.
 */
diff_text2(diffs: Diff[]): string
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main("Hello World", "Hello TypeScript");
const text2 = dmp.diff_text2(diffs);
// "Hello TypeScript"
```
