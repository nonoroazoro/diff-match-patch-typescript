import { Diff, DiffOperation } from "../types";

/**
 * Class representing one patch operation.
 */
export class PatchObject
{
    public diffs: Diff[] = [];
    public start1: number = 0; // TODO: Need to double check the default value 0
    public start2: number = 0; // TODO: Need to double check the default value 0
    public length1: number = 0;
    public length2: number = 0;

    /**
     * Emulate GNU diff format.
     * Header: @@ -382,8 +481,9 @@
     * Indices are printed as 1-based, not 0-based.
     *
     * @returns {string} The GNU diff string.
     */
    public toString(): string
    {
        let coords1;
        let coords2;
        if (this.length1 === 0)
        {
            coords1 = this.start1 + ",0";
        }
        else if (this.length1 === 1)
        {
            coords1 = this.start1 + 1;
        }
        else
        {
            coords1 = (this.start1 + 1) + "," + this.length1;
        }
        if (this.length2 === 0)
        {
            coords2 = this.start2 + ",0";
        }
        else if (this.length2 === 1)
        {
            coords2 = this.start2 + 1;
        }
        else
        {
            coords2 = (this.start2 + 1) + "," + this.length2;
        }
        const text = ["@@ -" + coords1 + " +" + coords2 + " @@\n"];
        let op;
        // Escape the body of the patch with %xx notation.
        for (let x = 0; x < this.diffs.length; x++)
        {
            switch (this.diffs[x][0])
            {
                case DiffOperation.DIFF_INSERT:
                    op = "+";
                    break;
                case DiffOperation.DIFF_DELETE:
                    op = "-";
                    break;
                case DiffOperation.DIFF_EQUAL:
                    op = " ";
                    break;
            }
            text[x + 1] = op + encodeURI(this.diffs[x][1]) + "\n";
        }
        return text.join("").replace(/%20/g, " ");
    }
}
