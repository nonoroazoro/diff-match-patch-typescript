# patch_deepCopy(patches)

Creates a deep copy of a patch array.

## Signature

```typescript
/**
 * @param {PatchObject[]} patches Array of patch objects.
 * @returns {PatchObject[]} Deep copy of the patch array.
 */
patch_deepCopy(patches: PatchObject[]): PatchObject[]
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const patches = dmp.patch_make("Hello World", "Hello TypeScript");

const patchesCopy = dmp.patch_deepCopy(patches);
// patchesCopy is a deep copy, modifying it won't affect the original
```
