/**
 * Define some regex patterns for matching boundaries.
 *
 * Ported by [xiaochao.k@gmail.com](https://github.com/nonoroazoro)
 */
export const NON_ALPHA_NUMERIC_REGEX: RegExp = /[^a-zA-Z0-9]/;
export const WHITESPACE_REGEX: RegExp = /\s/;
export const LINEBREAK_REGEX: RegExp = /[\r\n]/;
export const BLANKLINE_END_REGEX: RegExp = /\n\r?\n$/;
export const BLANKLINE_START_REGEX: RegExp = /^\r?\n\r?\n/;
