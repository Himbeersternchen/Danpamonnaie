import { Fragment, Key, ReactNode } from "react";
import useWindowWidth from "../../../../hooks/useWindowWidth";
import { Grid } from "../../../../resuable-ui/layout/Grid";
import {
  DASHBOARD_CONFIG,
  MOBILE_CHART_WIDTH_PROPORTION,
} from "../../constants/dashboard";
import { BaseItem, RowRange } from "../../types";
import { range } from "../../utils/array";
import { getItemRangeInEachRow } from "../../utils/layout";

interface DraggableGridProps<T extends BaseItem> {
  items: T[];
  itemKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
}

export function DraggableGrid<T extends BaseItem>({
  items,
  itemKey,
  renderItem,
}: DraggableGridProps<T>) {
  const rawWidth = useWindowWidth();
  const isMobile = rawWidth < DASHBOARD_CONFIG.MOBILE_BREAKPOINT;
  const windowWidth = rawWidth * (isMobile ? MOBILE_CHART_WIDTH_PROPORTION : DASHBOARD_CONFIG.MAX_WIDTH_PROPOTIONS);
  const itemRangeInEachRow: RowRange[] = getItemRangeInEachRow<T>(
    items,
    windowWidth
  );

  return (
    <Grid direction="col" gap={4}>
      {itemRangeInEachRow.map((rowRange, rowIndex) => (
        <Grid key={rowIndex} direction="row" gap={4}>
          {range(rowRange.startIndex, rowRange.endIndex).map((itemIndex) => (
            <Fragment key={itemKey(items[itemIndex])}>
              {renderItem(items[itemIndex])}
            </Fragment>
          ))}
        </Grid>
      ))}
    </Grid>
  );
}
