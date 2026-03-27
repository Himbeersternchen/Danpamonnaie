import { ExpenditureSankeyData } from "../chartsDummyDataGenerator/sankey/expenditureData";
import { ApiParams, fetchData } from "./utils";

export type SankeyApiParams = ApiParams;

export async function fetchSankeyData(
  params: SankeyApiParams
): Promise<ExpenditureSankeyData> {
  return fetchData<ExpenditureSankeyData>(
    "/dinoapi/expenditure_sankey/",
    params
  );
}
