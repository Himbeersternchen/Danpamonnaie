from copy import deepcopy

import pandas as pd
from parse_invoice_letter.process_bank import ProcessBank
from parse_invoice_letter.process_column_map import ProcessColumnMap
from parse_invoice_letter.utils.about_path import create_path_if_not_exist, load_config
from parse_invoice_letter.utils.bank_csv_preprocess import *
from utils.set_up_django_env import set_up_django_env
from utils.transform_dict import invert_dict

set_up_django_env()

from dinoapi.models import Bank, BankAccount, DinoHolder, Transaction


## This process can only be executed after data about bank information has been initialized
class ReadInvoice:
    def __init__(self, config):
        FILE = config.get("FILE", None)
        BASE_DIR = config.get("BASE_DIR", "./")
        FILE_PATH = config.get("FILE_PATH", None)
        if FILE is None and FILE_PATH is None:
            raise Exception("FILE or FILE_PATH has to be configured")
        self.USER_NICKNAME = config.get("USER_NICKNAME", None)
        if self.USER_NICKNAME is None:
            raise Exception("USER_NICKNAMES has to be configured")
        self.USER = DinoHolder.objects.get(nick_name=self.USER_NICKNAME)

        BANK_NAME = config.get("BANK_NAME", None)
        if BANK_NAME is None and config.get("COLUMN_MAP", None) is None:
            raise Exception("BANK_NAME or COLUMN_MAP has to be configured")

        preprocess_function = (
            Bank.objects.filter(name=BANK_NAME).first().preprocess_function_name
        )
        self.raw_data = globals()[preprocess_function](
            f"{BASE_DIR}{FILE_PATH}" if FILE is None else FILE
        )

        column_map = config.get(
            "COLUMN_MAP", ProcessColumnMap.get_column_map_by_bank(BANK_NAME)
        )
        self.column_map = {
            "account": {
                "account_name": column_map.get("account_name", None),
                "iban": column_map.get("iban", None),
                "bic": column_map.get("bic", None),
                "bank_name": column_map.get("bank_name", None),
            },
            "transaction": {
                "iban": column_map.get("iban", None),
                "amount": column_map.get("amount", None),
                "balance": column_map.get("balance", None),
                "currency": column_map.get("currency", None),
                "booking_date": column_map.get("booking_date", None),
                "payment_type": column_map.get("payment_type", None),
            },
            "description": {
                "payment_participant_name": column_map.get(
                    "payment_participant_name", None
                ),
                "intention": column_map.get("intention", None),
            },
        }

        # Add required constant key value
        self.column_map["transaction"]["description"] = "description"
        self.column_map_inverted = invert_dict(self.column_map, dim=2)

    # Extract and store account data
    def store_extract_acc_data(self):
        bank_account_cols = list(self.column_map_inverted["account"].keys())
        post_bank_account_cols = []
        for col in bank_account_cols:
            if col in self.raw_data:
                post_bank_account_cols.append(col)
        account_data = self.raw_data[post_bank_account_cols].drop_duplicates()
        account_data = account_data.rename(columns=self.column_map_inverted["account"])

        bank_processor = ProcessBank(self.USER_NICKNAME)
        bank_processor.init_bank_acc_data(account_data.to_dict(orient="records"))

    def __mapping_csv_columns(self):
        description_1 = self.column_map["description"]["payment_participant_name"]
        description_2 = self.column_map["description"]["intention"]
        # Assign value to located row and column positions
        self.raw_data.loc[self.raw_data[description_2].isna(), description_2] = ""
        self.raw_data["description"] = (
            self.raw_data[description_1] + " - " + self.raw_data[description_2]
        )

        invoice_data_cols = list(self.column_map_inverted["transaction"].keys())
        invoice_data = self.raw_data[invoice_data_cols]
        # Rename DataFrame columns using the inverted column mapping for transactions
        # For example: {"Betrag": "amount", "Datum": "date", "Beschreibung": "description"} as self.column_map_inverted["transaction"]
        # "Betrag" → "amount"
        # "Datum" → "date"
        # "Beschreibung" → "description"
        invoice_data = invoice_data.rename(
            columns=self.column_map_inverted["transaction"]
        )

        str2number_cols = ["amount", "balance"]
        for col in str2number_cols:
            invoice_data[col] = (
                invoice_data[col]
                .str.replace(".", "")
                .str.replace(",", ".")
                .astype(float)
            )

        # Convert booking_date column from string to datetime objects
        # format="%d.%m.%Y" expects dates like "31.12.2024" (day.month.year)
        # errors="coerce" will set invalid dates to NaT (Not a Time) instead of raising an error
        invoice_data["booking_date"] = pd.to_datetime(
            invoice_data["booking_date"], format="%d.%m.%Y", errors="coerce"
        )

        # Replace NaT (Not a Time) values with None for better database compatibility
        # .where() keeps valid dates and replaces NaT with None
        # This is useful because Django/databases typically work better with None than pandas NaT
        invoice_data["booking_date"] = invoice_data["booking_date"].where(
            invoice_data["booking_date"].notna(), None
        )

        return invoice_data

    # Extract and store transaction data
    def store_extract_transaction_data(self):
        invoice_data = self.__mapping_csv_columns()

        for row in invoice_data.to_dict(orient="records"):
            bank_account = BankAccount.objects.get(iban=row["iban"])
            row_with_relevant_keys = deepcopy(row)
            [
                row_with_relevant_keys.pop(key)
                for key in ["iban", "amount", "description"]
            ]
            # If a row with the condition of column check is found, update the values of row with defaults.
            # Otherwise create a complete new row with all values combined.
            transaction, created = Transaction.objects.update_or_create(
                account=bank_account,
                **row_with_relevant_keys,
                defaults={"amount": row["amount"], "description": row["description"]},
            )
            print(f"{"Created" if created else "Update"} transaction: {transaction}")

    def save_description_into_new_csv(self, save_path):
        invoice_data = self.__mapping_csv_columns()
        invoice_data["type"] = invoice_data["amount"].apply(
            lambda x: "income" if x >= 0 else "expenditure"
        )
        create_path_if_not_exist(save_path)
        invoice_data[["description", "type"]].to_csv(
            save_path, sep=";", index=True, encoding="utf-8"
        )

    def process_all(self):
        self.store_extract_acc_data()
        self.store_extract_transaction_data()


if __name__ == "__main__":
    # This script should be ran with "python -m parse_invoice_letter.read_invoice_csv" on the same dir level with manage.py
    # This process is designed to read the invoice CSV files, extract the relevant account and transaction data based on the provided column mapping, and store this data into the database.
    # It also saves the descriptions into new CSV files for further analysis.
    config = load_config("read_invoice")
    read_invoice = ReadInvoice(config)
    read_invoice.process_all()
