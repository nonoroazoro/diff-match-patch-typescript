# match_main(text, pattern, loc)

Locates the best instance of a pattern in text near a given location. Uses Bitap algorithm for fuzzy matching.

## Signature

```typescript
/**
 * @param {string} text The text to search.
 * @param {string} pattern The pattern to search for.
 * @param {number} loc The location to search around.
 * @returns {number} Best match index or -1 if no match found.
 */
match_main(text: string, pattern: string, loc: number): number
```

## Example

```typescript
import { DiffMatchPatch } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();

// Exact match
const index1 = dmp.match_main("Hello World", "World", 0);
// 6

// Fuzzy match (with typo)
const index2 = dmp.match_main("Hello World", "Warld", 0);
// 6 (still finds "World")

// No match
const index3 = dmp.match_main("Hello World", "xyz", 0);
// -1
```
