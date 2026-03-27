import json
from logging import config

from parse_invoice_letter.utils.about_path import load_config
from utils.set_up_django_env import set_up_django_env

set_up_django_env()

from dinoapi.models import ExpenditurePurpose, IncomePurpose


class ProcessPurpose:
    def __init__(self, config):
        self.income_config = config.get("incomes", {})
        self.expenditure_config = config.get("expenditures", {})

    def _init_income_purpose(self):
        for purpose, pattern in self.income_config.items():
            income_purpose, create = IncomePurpose.objects.update_or_create(
                name=purpose,
                defaults={
                    "pattern": pattern,
                },
            )
            print(
                f"{"Created" if create else "Updated"} income purpose: {income_purpose.name}"
            )

    def _init_expenditure_purpose(self):
        for purpose, pattern in self.expenditure_config.items():
            expenditure_purpose, create = ExpenditurePurpose.objects.update_or_create(
                name=purpose,
                defaults={
                    "pattern": pattern,
                },
            )
            print(
                f"{"Created" if create else "Updated"} expenditure purpose: {expenditure_purpose.name}"
            )

    def _get_purpose(self, is_expenditure=True):
        purpose = (
            ExpenditurePurpose.objects.all()
            if is_expenditure
            else IncomePurpose.objects.all()
        )
        purpose_map = {}
        for row in purpose:
            purpose_map[row.name] = row.pattern
        return purpose_map

    def init(self):
        self._init_income_purpose()
        self._init_expenditure_purpose()

    def get_all_purpose(self):
        purposes = {
            "expenditures": self._get_purpose(),
            "incomes": self._get_purpose(is_expenditure=False),
        }
        return purposes


if __name__ == "__main__":
    # This process is to initialize or update the expenditure and income purposes in database according to the input patterns in configuration,
    # and also can be used to get all the purposes with patterns in database and save them into a json file for easy backup,
    # which will be used for matching the transaction descriptions with purposes

    config = load_config("process_purpose")

    TRANSFER_PURPOSE_MAPPING_PATH = config.get("TRANSFER_PURPOSE_MAPPING_PATH")
    SAVE_TRANSFER_PURPOSE_MAPPING_PATH = config.get(
        "SAVE_TRANSFER_PURPOSE_MAPPING_PATH"
    )

    with open(TRANSFER_PURPOSE_MAPPING_PATH, "r", encoding="utf-8") as file:
        transfer_purpose_map = json.load(file)

    purpose_obj = ProcessPurpose(transfer_purpose_map)
    if config.get("INIT_PURPOSE"):
        purpose_obj.init()

    if config.get("DOWNLOAD_PURPOSE"):
        with open(SAVE_TRANSFER_PURPOSE_MAPPING_PATH, "w", encoding="utf-8") as file:
            json.dump(purpose_obj.get_all_purpose(), file, indent=2, ensure_ascii=False)
