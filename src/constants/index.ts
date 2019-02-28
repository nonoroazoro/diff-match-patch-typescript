/**
 * Define some regex patterns for matching boundaries.
 *
 * Ported by [xiaochao.k@gmail.com](https://github.com/nonoroazoro)
 */
export const nonAlphaNumericRegex_: RegExp = /[^a-zA-Z0-9]/;
export const whitespaceRegex_: RegExp = /\s/;
export const linebreakRegex_: RegExp = /[\r\n]/;
export const blanklineEndRegex_: RegExp = /\n\r?\n$/;
export const blanklineStartRegex_: RegExp = /^\r?\n\r?\n/;
