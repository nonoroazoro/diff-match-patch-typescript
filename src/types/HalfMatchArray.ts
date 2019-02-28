/**
 * Represents the results of the half-match test.
 *
 * Five element Array, containing the prefix of
 * longtext, the suffix of longtext, the prefix of shorttext, the suffix
 * of shorttext and the common middle. Or null if there was no match.
 */
export type HalfMatchArray = [string, string, string, string, string] | null;
