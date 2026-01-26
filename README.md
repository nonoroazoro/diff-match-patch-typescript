<h1 align="center">diff-match-patch-typescript</h1>
<p align="center"><b>TypeScript</b> port of <a href="https://github.com/google/diff-match-patch">google/diff-match-patch</a>.</p>
<p align="center">
    <a href="https://github.com/nonoroazoro/diff-match-patch-typescript/actions/workflows/ci.yml">
        <img src="https://github.com/nonoroazoro/diff-match-patch-typescript/actions/workflows/ci.yml/badge.svg" alt="GitHub CI" />
    </a>
    <a href="https://github.com/nonoroazoro/diff-match-patch-typescript/blob/master/LICENSE">
        <img src="https://img.shields.io/npm/l/diff-match-patch-typescript.svg" alt="GitHub License" />
    </a>
    <a href="https://www.npmjs.com/package/diff-match-patch-typescript">
        <img src="https://img.shields.io/npm/dw/diff-match-patch-typescript.svg" alt="NPM Downloads" />
    </a>
</p>

## Installation

```bash
npm i diff-match-patch-typescript
```

## Usage

```typescript
import { DiffMatchPatch, DiffOperation } from "diff-match-patch-typescript";

const dmp = new DiffMatchPatch();

// Diff
const diffs = dmp.diff_main("Hello World", "Hello TypeScript");
// [
//   [DiffOperation.DIFF_EQUAL, "Hello "],
//   [DiffOperation.DIFF_DELETE, "World"],
//   [DiffOperation.DIFF_INSERT, "TypeScript"]
// ]

// Match
const position = dmp.match_main("Hello World", "World", 0); // 6

// Patch
const patches = dmp.patch_make("Hello World", "Hello TypeScript");
const [newText, results] = dmp.patch_apply(patches, "Hello World");
// newText: "Hello TypeScript"
// results: [true]
```

## API Reference

### DiffMatchPatch Class Configuration

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
| `diffTimeout` | `number` | `1.0` | Seconds to compute a diff before giving up (0 = infinity). |
| `diffEditCost` | `number` | `4` | Cost of an empty edit operation. |
| `matchThreshold` | `number` | `0.5` | Threshold for match (0.0 = perfect, 1.0 = loose). |
| `matchDistance` | `number` | `1000` | How far to search for a match. |
| `patchDeleteThreshold` | `number` | `0.5` | Threshold for patch deletion matching. |
| `patchMargin` | `number` | `4` | Chunk size for context length. |

### Diff functions

- **[diff_main](docs/diff_main.md)** - Computes the differences between two texts.
- **[diff_commonPrefix](docs/diff_commonPrefix.md)** - Determines the common prefix length of two strings.
- **[diff_commonSuffix](docs/diff_commonSuffix.md)** - Determines the common suffix length of two strings.
- **[diff_cleanupSemantic](docs/diff_cleanupSemantic.md)** - Reduces edits by eliminating semantically trivial equalities.
- **[diff_cleanupSemanticLossless](docs/diff_cleanupSemanticLossless.md)** - Optimizes diff boundaries on logical boundaries.
- **[diff_cleanupEfficiency](docs/diff_cleanupEfficiency.md)** - Reduces edits by eliminating operationally trivial equalities.
- **[diff_cleanupMerge](docs/diff_cleanupMerge.md)** - Reorders and merges like edit sections.
- **[diff_xIndex](docs/diff_xIndex.md)** - Locates the position of a chunk in the second sequence.
- **[diff_prettyHtml](docs/diff_prettyHtml.md)** - Converts a diff array into a pretty HTML report.
- **[diff_text1](docs/diff_text1.md)** - Computes the source text from a diff array.
- **[diff_text2](docs/diff_text2.md)** - Computes the destination text from a diff array.
- **[diff_levenshtein](docs/diff_levenshtein.md)** - Computes the Levenshtein distance.
- **[diff_toDelta](docs/diff_toDelta.md)** - Converts a diff array into a delta string.
- **[diff_fromDelta](docs/diff_fromDelta.md)** - Computes a diff array from a text and delta string.
- **[diff_linesToChars](docs/diff_linesToChars.md)** - Splits two texts into an array of strings for line-mode diffing.
- **[diff_charsToLines](docs/diff_charsToLines.md)** - Converts character-indexed diffs back to line-indexed diffs.

### Match functions

- **[match_main](docs/match_main.md)** - Locates the best instance of a pattern in text near a given location.

### Patch functions

- **[patch_make](docs/patch_make.md)** - Creates an array of patch objects from texts or diffs.
- **[patch_apply](docs/patch_apply.md)** - Applies patches to text, returns new text and success array.
- **[patch_deepCopy](docs/patch_deepCopy.md)** - Creates a deep copy of a patch array.
- **[patch_addPadding](docs/patch_addPadding.md)** - Adds padding to patch start and end.
- **[patch_splitMax](docs/patch_splitMax.md)** - Splits large patches into smaller ones.
- **[patch_toText](docs/patch_toText.md)** - Converts patches to a textual representation.
- **[patch_fromText](docs/patch_fromText.md)** - Parses a textual representation into patch objects.

## Related

- [google/diff-match-patch](https://github.com/google/diff-match-patch) - The original library by Google.
