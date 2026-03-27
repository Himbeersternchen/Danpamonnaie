import { LineChartDataBase } from "../chartsDummyDataGenerator/line/DailyExpenditureData";
import { ApiParams, fetchData } from "./utils";

export async function fetchLineData(
  params: ApiParams
): Promise<LineChartDataBase[]> {
  return fetchData<LineChartDataBase[]>("/dinoapi/expenditure_line/", params);
}
