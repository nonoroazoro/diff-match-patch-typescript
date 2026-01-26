# diff_commonSuffix(text1, text2)

Determines the common suffix length of two strings.

## Signature

```typescript
/**
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @returns {number} The number of characters common to the end of each string.
 */
diff_commonSuffix(text1: string, text2: string): number
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const length = dmp.diff_commonSuffix("Hello World", "Beautiful World");
// 6 (" World")
```
