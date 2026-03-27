import { PieChartData } from "../chartsDummyDataGenerator/pie/bankingData";
import { ApiParams, fetchData } from "./utils";

export type PieApiParams = ApiParams;

export async function fetchPieData(
  params: PieApiParams
): Promise<PieChartData> {
  return fetchData<PieChartData>("/dinoapi/expenditure_pie/", params);
}
