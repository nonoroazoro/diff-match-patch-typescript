/**
 * Define some regex patterns for matching boundaries.
 *
 * Ported by [xiaochao.k@gmail.com](https://github.com/nonoroazoro)
 */
export const NON_ALPHA_NUMERIC_REGEX = /[^a-zA-Z0-9]/;
export const WHITESPACE_REGEX = /\s/;
export const LINEBREAK_REGEX = /[\r\n]/;
export const BLANKLINE_END_REGEX = /\n\r?\n$/;
export const BLANKLINE_START_REGEX = /^\r?\n\r?\n/;
