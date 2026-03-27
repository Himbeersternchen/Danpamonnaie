import { BarChartDataBase } from "../chartsDummyDataGenerator/bar/weeklyExpenditureData";
import { ApiParams, fetchData } from "./utils";

export async function fetchBarData(
  params: ApiParams
): Promise<BarChartDataBase> {
  return fetchData<BarChartDataBase>("/dinoapi/expenditure_bar/", params);
}
