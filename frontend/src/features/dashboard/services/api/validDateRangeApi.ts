import { dinoauth } from "../../../auth/utils/auth_process";
import { API_BASE_URL } from "./utils";

export interface ValidDateRange {
  min_date: string | null;
  max_date: string | null;
}

export async function fetchValidDateRange(acc_id?: string): Promise<ValidDateRange> {
  const url = new URL("/dinoapi/valid_date_range/", API_BASE_URL);

  if (acc_id) {
    url.searchParams.set("acc_id", acc_id);
  }

  const response = await dinoauth.get<ValidDateRange>(url.toString());

  return response.data;
}
