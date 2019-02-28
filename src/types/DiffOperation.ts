/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
export enum DiffOperation
{
    DIFF_DELETE = -1,
    DIFF_INSERT = 1,
    DIFF_EQUAL = 0
}
