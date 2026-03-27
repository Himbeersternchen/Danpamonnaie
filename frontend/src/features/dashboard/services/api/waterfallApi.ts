import { WaterfallData } from "../chartsDummyDataGenerator/waterfall/bankBalanceData";
import { ApiParams, fetchData } from "./utils";

export async function fetchWaterfallData(
  params: ApiParams
): Promise<WaterfallData> {
  return fetchData<WaterfallData>("/dinoapi/balance_waterfall/", params);
}
