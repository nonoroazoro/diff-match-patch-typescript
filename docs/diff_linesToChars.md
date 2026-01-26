# diff_linesToChars(text1, text2)

Splits two texts into an array of strings, reducing the texts to a string of hashes where each Unicode character represents one line. This is used for line-mode diffing.

## Signature

```typescript
/**
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @returns {{ chars1: string; chars2: string; lineArray: string[] }} An object containing the encoded strings and the line array.
 */
diff_linesToChars(text1: string, text2: string): {
    chars1: string;
    chars2: string;
    lineArray: string[];
}
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const text1 = "alpha\nbeta\nalpha\n";
const text2 = "beta\nalpha\nbeta\n";
const result = dmp.diff_linesToChars(text1, text2);
// result.chars1: "\x01\x02\x01"
// result.chars2: "\x02\x01\x02"
// result.lineArray: ["", "alpha\n", "beta\n"]
```
