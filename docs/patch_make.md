# patch_make(a, optB?, optC?)

Creates an array of patch objects from texts or diffs. Supports multiple calling conventions.

## Signature

```typescript
/**
 * @param {string | Diff[]} a Text1 (methods 1,3,4) or Array of diff tuples (method 2).
 * @param {string | Diff[]} [optB] Text2 (methods 1,4) or Array of diff tuples (method 3).
 * @param {string | Diff[]} [optC] Array of diff tuples (method 4).
 * @returns {PatchObject[]} Array of patch objects.
 */
patch_make(a: string | Diff[], optB?: string | Diff[], optC?: string | Diff[]): PatchObject[]
```

### Calling Conventions

1. `patch_make(text1, text2)` - Compute patches from two texts.
2. `patch_make(diffs)` - Compute patches from an array of diffs.
3. `patch_make(text1, diffs)` - Compute patches from text1 and diffs.
4. `patch_make(text1, text2, diffs)` - Compute patches from text1, text2, and diffs (preferred, fastest).

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();

// Method 1: From two texts
const patches = dmp.patch_make("Hello World", "Hello TypeScript");

// Method 2: From diffs
const diffs = dmp.diff_main("Hello World", "Hello TypeScript");
const patches2 = dmp.patch_make(diffs);

// Method 3: From text1 and diffs
const patches3 = dmp.patch_make("Hello World", diffs);
```
