import { BoxDataBase } from "../chartsDummyDataGenerator/box/weeklyExpenditureData";
import { ApiParams, fetchData } from "./utils";

export async function fetchBoxData(params: ApiParams): Promise<BoxDataBase> {
  return fetchData<BoxDataBase>("/dinoapi/expenditure_box/", params);
}
