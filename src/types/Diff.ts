import { DiffOperation } from "./DiffOperation";

/**
 * Represents one diff tuple, in the form of `[op, text]`.
 *
 * `op` is the operation, one of: DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL.
 * `text` is the text to be deleted, inserted, or retained.
 */
export type Diff = [DiffOperation, string];
