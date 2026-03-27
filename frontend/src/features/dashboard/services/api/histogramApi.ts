import { HistogramDataBase } from "../chartsDummyDataGenerator/histogram/expenditureAmountData";
import { ApiParams, fetchData } from "./utils";

export async function fetchHistogramData(
  params: ApiParams
): Promise<HistogramDataBase> {
  return fetchData<HistogramDataBase>(
    "/dinoapi/expenditure_histogram/",
    params
  );
}
