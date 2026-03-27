import pandas as pd
from parse_invoice_letter.utils.about_path import create_path_if_not_exist, load_config
from utils.set_up_django_env import set_up_django_env

set_up_django_env()
from dinoapi.models import Bank, BankAccount, DinoHolder


class ProcessBank:
    def __init__(self, nick_name):
        self.bank_table = Bank
        self.bank_acc_table = BankAccount
        self.user_table = DinoHolder
        self.columns = [f.name for f in self.bank_table._meta.get_fields()][3:]
        self.bank_acc_columns = ["account_name", "iban", "bic"]
        self.nick_name = nick_name

    def download_bank_data(self, save_path):
        bank = {}
        for col in self.columns:
            bank[col] = list(self.bank_table.objects.values_list(col, flat=True))

        df = pd.DataFrame(bank)
        create_path_if_not_exist(save_path)
        df.to_csv(save_path, sep=";", index=False, encoding="utf-8")
        return bank

    # This method ist only desired to test
    def __get_bank_data_through_csv(self, save_path):
        bank_data = pd.read_csv(save_path, encoding="utf-8", sep=";")
        bank_data = bank_data[self.columns].drop_duplicates()
        bank_data = bank_data.to_dict(orient="records")

        return bank_data

    def init_bank_data(self, bank_data):
        for row in bank_data:
            bank_row, is_created = self.bank_table.objects.update_or_create(
                name=row.get("bank_name", row.get("name")),
                defaults={
                    k: v for k, v in row.items() if k not in {"bank_name", "name"}
                },
            )
            print(f"{"Created" if is_created else "Update"} bank_row: {bank_row}")

    ## Bank account data can only be initialized after data about bank information has been initialized
    # bank_data is a list of objects with attributes: bank_name, account_name, iban, bic
    def init_bank_acc_data(self, bank_data):
        for row in bank_data:
            bank_name = row.get("bank_name", row.get("name"))
            user = self.user_table.objects.filter(nick_name=self.nick_name).first().id
            # Check if there is a bank acc which has the current user and the iban
            bank_acc = self.bank_acc_table.objects.filter(iban=row["iban"]).first()
            bank = self.bank_table.objects.filter(name=bank_name).first()
            if not bank:
                raise Exception(f"Bank with name {bank_name} has not been created yet")
            # If there is a bank acc existed
            if bank_acc:
                # Add the current user to this bank acc and update the acc name and bic if user inputs any info about it
                bank_acc.user.add(user)
                if row.get("account_name"):
                    bank_acc.account_name = row["account_name"]
                if row.get("bic"):
                    bank_acc.bic = row["bic"]
                bank_acc.bank = bank
                bank_acc.save()
            # If no banc acc was found
            else:
                # Create a new bank acc and add the current user to it
                new_row = self.bank_acc_table.objects.create(
                    account_name=row.get("account_name", ""),
                    bank=self.bank_table.objects.filter(name=bank_name).first(),
                    iban=row["iban"],
                    bic=row.get("bic", ""),
                )
                new_row.user.set([user])

    def init_bank_data_through_csv(self, save_path):
        bank_data = self.__get_bank_data_through_csv(save_path)
        self.init_bank_data(bank_data)


if __name__ == "__main__":
    # This main script is only for test, not for data generating,
    # because to generate bank data the real user inputs are needed
    # This process is designed to initialize or update the bank information in database according to the input CSV file,
    # and also can be used to download the current bank information from database into a CSV file for easy backup or analysis.
    config = load_config("process_bank")
    save_path = f"{config.get("BASE_DIR", "")}{config.get("FILE_PATH", "")}"
    if not save_path:
        raise Exception(
            "BASE_DIR or process_bank.FILE_PATH are not configured in configuration"
        )

    nick_name = config.get("USER_NICKNAME", None)
    if nick_name is None:
        raise Exception("USER_NICKNAME has to be configured to process bank")

    bank = ProcessBank(nick_name)
    bank.init_bank_data_through_csv(save_path)
    # bank.download_bank_data(save_path)
