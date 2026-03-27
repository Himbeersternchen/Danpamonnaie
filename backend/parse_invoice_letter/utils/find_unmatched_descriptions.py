import json
import re
from pathlib import Path

import pandas as pd
from parse_invoice_letter.utils.about_path import create_path_if_not_exist, load_config


def load_patterns(map_path: str) -> dict[str, list[str]]:
    with open(map_path, "r", encoding="utf-8") as f:
        purpose_map = json.load(f)

    patterns = {}
    for type_key in ("expenditures", "incomes"):
        combined = []
        for category_patterns in purpose_map.get(type_key, {}).values():
            combined.extend(category_patterns.split("|"))
        patterns[type_key] = combined

    return patterns


def is_matched(description: str, patterns: list[str]) -> bool:
    for pattern in patterns:
        if re.search(pattern, description, re.IGNORECASE):
            return True
    return False


def find_unmatched(
    descriptions_dir: str, patterns: dict[str, list[str]]
) -> pd.DataFrame:
    type_key_map = {"expenditure": "expenditures", "income": "incomes"}
    unmatched_rows = []

    for csv_path in sorted(Path(descriptions_dir).glob("**/*.csv")):
        df = pd.read_csv(csv_path, sep=";", index_col=0)

        for _, row in df.iterrows():
            description = str(row["description"]).strip()
            row_type = str(row["type"]).strip()
            section = type_key_map.get(row_type)

            if not section or not description:
                continue

            if not is_matched(description, patterns[section]):
                unmatched_rows.append(
                    {
                        "description": description,
                        "type": row_type,
                        "source_file": csv_path.name,
                    }
                )

    return pd.DataFrame(unmatched_rows).drop_duplicates(subset=["description", "type"])


if __name__ == "__main__":
    # This script should be ran with "python -m parse_invoice_letter.utils.find_unmatched_descriptions" on the same dir level with manage.py
    # This script is designed to find out which descriptions from the invoice CSV files do not match any of the patterns defined in the transfer purpose map,
    # and save these unmatched descriptions into a new CSV file for further analysis or pattern updating.
    config = load_config("find_unmatched")
    descriptions_dir = config["BASE_DIR"] + config["INVOICE_DESCRIPTIONS_SUBDIR"]
    map_path = config["TRANSFER_PURPOSE_MAP_PATH"]
    output_path = config["OUTPUT_PATH"]

    patterns = load_patterns(map_path)
    unmatched_df = find_unmatched(descriptions_dir, patterns)

    create_path_if_not_exist(output_path)
    unmatched_df.to_csv(output_path, sep=";", index=False)

    print(f"Total unmatched: {len(unmatched_df)}")
    if len(unmatched_df) > 0:
        print(
            f"  expenditures: {len(unmatched_df[unmatched_df['type'] == 'expenditure'])}"
        )
        print(f"  incomes:      {len(unmatched_df[unmatched_df['type'] == 'income'])}")
        print(f"Saved to: {output_path}")
    else:
        print("No unmatched descriptions found.")
