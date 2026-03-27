import { addDays } from "date-fns";
import { DateRangePicker } from "rsuite";
import "rsuite/DateRangePicker/styles/index.css";
import {
  DateRange,
  DateRangePickerProps,
  RangeType,
} from "rsuite/esm/DateRangePicker";
import useWindowWidth from "../../../../hooks/useWindowWidth";
import { DASHBOARD_CONFIG } from "../../constants/dashboard";
import { useDanpaStore } from "../../../zustand/store";

interface DateRangePickerRSuitProps extends DateRangePickerProps {
  value?: [Date, Date] | null;
  onChange?: (value: DateRange | null) => void;
}

export const DateRangePickerRSuit = ({
  value,
  onChange,
  ...props
}: DateRangePickerRSuitProps) => {
  const isMobile = useWindowWidth() < DASHBOARD_CONFIG.MOBILE_BREAKPOINT;
  const globalDateRange = useDanpaStore((state) => state.dateRange);
  const setGlobalDateRange = useDanpaStore((state) => state.setDateRange);

  const validDateRange = useDanpaStore((state) => state.validDateRange);

  const predefinedRanges: RangeType<DateRange>[] = [
    {
      label: "Today",
      value: [new Date(), new Date()],
      placement: "left",
    },
    {
      label: "Yesterday",
      value: [addDays(new Date(), -1), addDays(new Date(), -1)],
      placement: "left",
    },
    {
      label: "Last 7 Days",
      value: [addDays(new Date(), -7), new Date()],
      placement: "left",
    },
    {
      label: "Last 30 Days",
      value: [addDays(new Date(), -30), new Date()],
      placement: "left",
    },
  ];

  const handleDateChange = (newValue: DateRange | null) => {
    if (onChange) {
      // Custom onChange provided (for individual charts)
      onChange(newValue);
    } else {
      // No custom onChange, use global state
      if (newValue && newValue[0] && newValue[1]) {
        setGlobalDateRange([newValue[0], newValue[1]]);
      }
    }
  };

  const effectiveValue = value !== undefined ? value : globalDateRange;

  const shouldDisableDate = (date: Date) => {
    if (!validDateRange.data) return false;

    const { min_date, max_date } = validDateRange.data;

    if (min_date) {
      const minDate = new Date(min_date + "T00:00:00");
      if (date < minDate) return true;
    }

    if (max_date) {
      const maxDate = new Date(max_date + "T00:00:00");
      if (date > maxDate) return true;
    }

    return false;
  };

  return (
    <DateRangePicker
      ranges={predefinedRanges}
      value={effectiveValue}
      onChange={handleDateChange}
      shouldDisableDate={shouldDisableDate}
      placement="bottomEnd"
      preventOverflow
      showOneCalendar={isMobile}
      {...props}
    />
  );
};
