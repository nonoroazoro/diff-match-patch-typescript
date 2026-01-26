# diff_commonPrefix(text1, text2)

Determines the common prefix length of two strings.

## Signature

```typescript
/**
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @returns {number} The number of characters common to the start of each string.
 */
diff_commonPrefix(text1: string, text2: string): number
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const length = dmp.diff_commonPrefix("Hello World", "Hello TypeScript");
// 6 ("Hello ")
```
