/**
 * Represents the operations of a `Diff`.
 *
 * The data structure representing a `Diff` is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 *
 * Ported by [xiaochao.k@gmail.com](https://github.com/nonoroazoro)
 */
export enum DiffOperation
{
    DIFF_DELETE = -1,
    DIFF_INSERT = 1,
    DIFF_EQUAL = 0
}
