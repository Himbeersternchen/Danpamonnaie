import { useEffect } from "react";
import { useDanpaStore } from "../../zustand/store";

interface DataProviderProps {
  children: React.ReactNode;
}

/**
 * DataProvider: Centralized data fetching for all charts
 * - Fetches all chart data on mount
 * - Refetches when global date range changes
 * - Prevents unnecessary refetches during layout changes
 */
export function DataProvider({ children }: DataProviderProps) {
  const dateRange = useDanpaStore((state) => state.dateRange);
  const isAuthenticated = useDanpaStore((state) => state.isAuthenticated);
  const selectedAccountId = useDanpaStore((state) => state.selectedAccountId);
  const bankAccountsLoading = useDanpaStore(
    (state) => state.bankAccountsLoading
  );
  const hasCheckedAuth = useDanpaStore((state) => state.hasCheckedAuth);
  const fetchAllChartData = useDanpaStore((state) => state.fetchAllChartData);
  const fetchValidDateRange = useDanpaStore((state) => state.fetchValidDateRange);

  useEffect(() => {
    fetchValidDateRange();
  }, [selectedAccountId, fetchValidDateRange]);

  useEffect(() => {
    // Fetch all data on mount, when global date range changes, auth state changes, or account changes
    fetchAllChartData(dateRange);
  }, [
    dateRange,
    isAuthenticated,
    selectedAccountId,
    bankAccountsLoading,
    hasCheckedAuth,
    fetchAllChartData,
  ]);

  return <>{children}</>;
}
