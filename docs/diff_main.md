# diff_main(text1, text2, optChecklines?, optDeadline?)

Computes the differences between two texts.

## Signature

```typescript
/**
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {boolean} [optChecklines] Optional speedup flag. If present and false, then don't run a line-level diff first to identify the changed areas.
 * @param {number} [optDeadline] Optional time when the diff should be complete by.
 * @returns {Diff[]} Array of diff tuples.
 */
diff_main(text1: string, text2: string, optChecklines?: boolean, optDeadline?: number): Diff[]
```

## Example

```typescript
import { DiffMatchPatch, DiffOperation } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main("Hello World", "Hello TypeScript");
// [
//   [DiffOperation.DIFF_EQUAL, "Hello "],
//   [DiffOperation.DIFF_DELETE, "World"],
//   [DiffOperation.DIFF_INSERT, "TypeScript"]
// ]
```
