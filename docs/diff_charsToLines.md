# diff_charsToLines(diffs, lineArray)

Converts character-indexed diffs back to line-indexed diffs. Rehydrates the text in a diff from a string of line hashes to real lines of text.

## Signature

```typescript
/**
 * @param {Diff[]} diffs Array of diff tuples.
 * @param {string[]} lineArray Array of unique strings.
 */
diff_charsToLines(diffs: Diff[], lineArray: string[]): void
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();
const text1 = "alpha\nbeta\nalpha\n";
const text2 = "beta\nalpha\nbeta\n";

// Convert lines to chars for faster diffing
const { chars1, chars2, lineArray } = dmp.diff_linesToChars(text1, text2);

// Perform diff on encoded strings
const diffs = dmp.diff_main(chars1, chars2, false);

// Convert back to line-based diffs
dmp.diff_charsToLines(diffs, lineArray);
// diffs now contain actual line text instead of encoded characters
```
