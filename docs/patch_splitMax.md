# patch_splitMax(patches)

Splits large patches into smaller ones. Looks through patches and breaks up any that are longer than the maximum limit of the match algorithm.

## Signature

```typescript
/**
 * @param {PatchObject[]} patches Array of patch objects.
 */
patch_splitMax(patches: PatchObject[]): void
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const patches = dmp.patch_make(
    "x".repeat(100),
    "y".repeat(100)
);

dmp.patch_splitMax(patches);
// Large patches are now split into smaller, more manageable pieces
```
