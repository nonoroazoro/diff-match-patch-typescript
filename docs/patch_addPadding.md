# patch_addPadding(patches)

Adds padding to patch start and end so that edges can be matched. Intended to be called only from within `patch_apply`.

## Signature

```typescript
/**
 * @param {PatchObject[]} patches Array of patch objects.
 * @returns {string} The padding string added to each side.
 */
patch_addPadding(patches: PatchObject[]): string
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const patches = dmp.patch_make("Hello World", "Hello TypeScript");

const padding = dmp.patch_addPadding(patches);
// padding: "\x01\x02\x03\x04" (based on patchMargin)
```
