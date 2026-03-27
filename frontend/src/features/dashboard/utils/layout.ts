import { BaseItem, RowRange } from "../types";

export function getItemRangeInEachRow<T extends BaseItem>(
  items: T[],
  windowWidth: number
): RowRange[] {
  // Each element in the list corresponds to the start index and end index of items in each row
  const itemRangeInEachRow: RowRange[] = [{ startIndex: 0, endIndex: 0 }];
  let itemsInRowWidth: number = 0;
  items.map((item, idx) => {
    itemsInRowWidth += item.width;
    itemRangeInEachRow[itemRangeInEachRow.length - 1].endIndex++;

    // tmp variables
    const endIndex = itemRangeInEachRow[itemRangeInEachRow.length - 1].endIndex;
    const columnCount =
      itemRangeInEachRow[itemRangeInEachRow.length - 1].endIndex -
      itemRangeInEachRow[itemRangeInEachRow.length - 1].startIndex;

    if (itemsInRowWidth > windowWidth) {
      // if there is not only one column in the row, push the current column into the next row
      if (columnCount !== 1) {
        itemRangeInEachRow[itemRangeInEachRow.length - 1].endIndex--;
        itemRangeInEachRow.push({
          startIndex: endIndex - 1,
          endIndex: endIndex,
        });
        itemsInRowWidth = item.width;
        // if there is only one column in the row, and it is not the last item, don't push it into the next row
      } else if (idx !== items.length - 1) {
        itemRangeInEachRow.push({
          startIndex: endIndex - 1,
          endIndex: endIndex - 1,
        });
        itemsInRowWidth = 0;
      }
    }
  });
  return itemRangeInEachRow;
}
