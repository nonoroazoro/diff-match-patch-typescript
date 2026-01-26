# patch_fromText(textline)

Parses a textual representation of patches and returns a list of patch objects.

## Signature

```typescript
/**
 * @param {string} textline Text representation of patches.
 * @returns {PatchObject[]} Array of patch objects.
 * @throws {Error} If invalid input.
 */
patch_fromText(textline: string): PatchObject[]
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();

const text = `@@ -1,11 +1,16 @@
 Hello
-World
+TypeScript
`;

const patches = dmp.patch_fromText(text);
// Array of PatchObject that can be applied with patch_apply
```
