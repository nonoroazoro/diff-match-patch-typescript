# diff_toDelta(diffs)

Converts a diff array into a delta string. The delta format is a compact representation where:
- `=N` means keep N characters
- `-N` means delete N characters
- `+text` means insert text (URL encoded)

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 * @returns {string} Delta string.
 */
diff_toDelta(diffs: Diff[]): string
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main("Hello World", "Hello TypeScript");
const delta = dmp.diff_toDelta(diffs);
// "=6\t-5\t+TypeScript"
```
