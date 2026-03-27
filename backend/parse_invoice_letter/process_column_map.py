import pandas as pd
from parse_invoice_letter.utils.about_path import create_path_if_not_exist
from utils.set_up_django_env import set_up_django_env

set_up_django_env()
from dinoapi.models import Bank, BankAccount, InvoiceColumnMap


class ProcessColumnMap:
    def __init__(self, save_path):
        self.columns = [f.name for f in InvoiceColumnMap._meta.get_fields()][2:]
        self.save_path = save_path
        self.foreign_key_col = "bank"
        self.related_table_col_name = "name"

    def download_column_map(self):
        column_map = {}
        for col in self.columns:
            if col == self.foreign_key_col:
                column_map[col] = list(
                    InvoiceColumnMap.objects.values_list(
                        f"{col}__{self.related_table_col_name}",
                        flat=True,
                    )
                )
            else:
                column_map[col] = list(
                    InvoiceColumnMap.objects.values_list(col, flat=True)
                )

        df = pd.DataFrame(column_map)
        create_path_if_not_exist(self.save_path)
        df.to_csv(self.save_path, sep=";", index=False, encoding="utf-8")
        return column_map

    def init_column_map(self):
        column_map_data = pd.read_csv(
            self.save_path,
            encoding="utf-8",
            sep=";",
        )

        # Drop duplicates in subset columns and keep the first one existend, variable changes in place
        column_map_data.drop_duplicates(
            subset=[self.foreign_key_col], keep="first", inplace=True
        )
        foreign_key_col_data = column_map_data[self.foreign_key_col]
        column_map_data = column_map_data[self.columns[:-1]]

        # column_map_data.to_dict(orient="records") is a list of dictionaries
        for idx, row in enumerate(column_map_data.to_dict(orient="records")):
            foreign_key_cell = foreign_key_col_data[idx]
            foreign_key = Bank.objects.get(
                **{self.related_table_col_name: foreign_key_cell}
            )
            invoice_column_map, is_created = InvoiceColumnMap.objects.update_or_create(
                **row, **{self.foreign_key_col: foreign_key}
            )
            print(
                f"{"Created" if is_created else "Update"} invoice_column_map: {invoice_column_map}"
            )

    @staticmethod
    def get_column_map_fields():
        column_map_fields = [
            "column_map__" + f.name for f in InvoiceColumnMap._meta.get_fields()
        ][2:-1]
        return column_map_fields

    @staticmethod
    def get_key_split_str_last_part(map: dict, spliter: str = "__"):
        return {key.split("__")[-1]: value for key, value in map.items()}

    @staticmethod
    def get_list_split_str_last_part(list: list, spliter: str = "__"):
        return [element.split("__")[-1] for element in list]

    @staticmethod
    def get_column_map(iban: str, nicknames: list):
        column_map_fields = ProcessColumnMap.get_column_map_fields()
        column_map = (
            BankAccount.objects.filter(iban=iban, user__nick_name=nicknames[0])
            .values(*column_map_fields)
            .first()
        )
        column_map = ProcessColumnMap.get_key_split_str_last_part(column_map)
        return column_map

    @staticmethod
    def get_column_map_by_bank(bank_name: str):
        column_map_fields = ProcessColumnMap.get_column_map_fields()
        column_map_fields = ProcessColumnMap.get_list_split_str_last_part(
            column_map_fields
        )
        column_map = (
            InvoiceColumnMap.objects.filter(bank__name=bank_name)
            .values(*column_map_fields)
            .first()
        )

        return column_map


if __name__ == "__main__":

    # This main script is only for test, not for data generating,
    # because to generate bank data the real user inputs are needed
    # This process is designed to initialize or update the column mapping information in the database according to the input CSV file,
    # and also can be used to download the current column mapping information from database into a CSV file for easy backup or analysis.
    column_map = ProcessColumnMap("./parse_invoice_letter/data/column_maps.csv")
    column_map.download_column_map()
    # column_map.init_column_map()
