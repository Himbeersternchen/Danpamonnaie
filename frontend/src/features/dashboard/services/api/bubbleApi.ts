import { BubbleChartDataBase } from "../chartsDummyDataGenerator/bubble/transactionData";
import { ApiParams, fetchData } from "./utils";

export async function fetchBubbleData(
  params: ApiParams
): Promise<BubbleChartDataBase> {
  return fetchData<BubbleChartDataBase>("/dinoapi/expenditure_bubble/", params);
}
