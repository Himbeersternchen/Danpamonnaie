import { dinoauth } from "../../auth/utils/auth_process";

export interface BankAccount {
  account_name: string;
  bank_name: string;
  bank_address: string;
  iban: string;
  bic: string;
  acc_id: string;
}

export async function getUserBanks(): Promise<BankAccount[]> {
  const response = await dinoauth.get<BankAccount[]>(
    "/dinoapi/get_user_bank_acc/"
  );
  return response.data;
}

export async function uploadTransactionCSV(
  bankName: string,
  files: File[]
): Promise<void> {
  const formData = new FormData();
  formData.append("bank_name", bankName);
  for (const file of files) {
    formData.append("files", file);
  }

  await dinoauth.post("/dinoapi/upload_csv/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
