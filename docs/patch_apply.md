# patch_apply(patches, text)

Applies patches to text. Returns the patched text and an array of boolean values indicating which patches were applied.

## Signature

```typescript
/**
 * @param {PatchObject[]} patches Array of patch objects.
 * @param {string} text Old text.
 * @returns {PatchApplyArray} Two element array: [new text, array of booleans].
 */
patch_apply(patches: PatchObject[], text: string): PatchApplyArray
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const patches = dmp.patch_make("Hello World", "Hello TypeScript");

const [newText, results] = dmp.patch_apply(patches, "Hello World");
// newText: "Hello TypeScript"
// results: [true]

// Apply to similar text
const [newText2, results2] = dmp.patch_apply(patches, "Hello World!");
// newText2: "Hello TypeScript!"
// results2: [true]
```
