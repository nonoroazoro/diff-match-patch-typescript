# diff_text1(diffs)

Computes the source text (text1) from a diff array.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 * @returns {string} Source text.
 */
diff_text1(diffs: Diff[]): string
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main("Hello World", "Hello TypeScript");
const text1 = dmp.diff_text1(diffs);
// "Hello World"
```
