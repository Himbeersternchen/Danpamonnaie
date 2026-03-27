import { dinoauth } from "../../../auth/utils/auth_process";

export const API_BASE_URL = window.location.origin;

/**
 * API parameters for dashboard data fetching
 *
 * @property start - Start date in YYYY-MM-DD format
 * @property end - End date in YYYY-MM-DD format
 * @property acc_id - Bank account UUID for filtering data (required if user has accounts)
 */
export interface ApiParams {
  start: string; // YYYY-MM-DD format
  end: string; // YYYY-MM-DD format
  acc_id?: string; // Bank account UUID for filtering
}

export async function fetchData<T>(
  endpoint: string,
  params: ApiParams
): Promise<T> {
  const base = API_BASE_URL;
  const url = new URL(endpoint, base);
  url.searchParams.set("start", params.start);
  url.searchParams.set("end", params.end);

  // Add acc_id parameter if specified (for filtering by specific bank account)
  if (params.acc_id) {
    url.searchParams.set("acc_id", params.acc_id);
  }

  const response = await dinoauth.get<T>(url.toString());

  return response.data;
}
