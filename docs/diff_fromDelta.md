# diff_fromDelta(text1, delta)

Computes a diff array from the source text and a delta string.

## Signature

```typescript
/**
 * @param {string} text1 Source string for the diff.
 * @param {string} delta Delta string.
 * @returns {Diff[]} Array of diff tuples.
 * @throws {Error} If invalid input.
 */
diff_fromDelta(text1: string, delta: string): Diff[]
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const delta = "=6\t-5\t+TypeScript";
const diffs = dmp.diff_fromDelta("Hello World", delta);
// [
//   [DiffOperation.DIFF_EQUAL, "Hello "],
//   [DiffOperation.DIFF_DELETE, "World"],
//   [DiffOperation.DIFF_INSERT, "TypeScript"]
// ]
```
