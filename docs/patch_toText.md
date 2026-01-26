# patch_toText(patches)

Converts patches to a textual representation. Uses a format similar to GNU diff.

## Signature

```typescript
/**
 * @param {PatchObject[]} patches Array of patch objects.
 * @returns {string} Text representation of patches.
 */
patch_toText(patches: PatchObject[]): string
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const patches = dmp.patch_make("Hello World", "Hello TypeScript");

const text = dmp.patch_toText(patches);
// @@ -1,11 +1,16 @@
//  Hello
// -World
// +TypeScript
```
