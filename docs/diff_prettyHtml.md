# diff_prettyHtml(diffs)

Converts a diff array into a pretty HTML report.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 * @returns {string} HTML representation.
 */
diff_prettyHtml(diffs: Diff[]): string
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const diffs = dmp.diff_main("Hello World", "Hello TypeScript");
const html = dmp.diff_prettyHtml(diffs);
// <span>Hello </span><del style="background:#ffe6e6;">World</del><ins style="background:#e6ffe6;">TypeScript</ins>
```
