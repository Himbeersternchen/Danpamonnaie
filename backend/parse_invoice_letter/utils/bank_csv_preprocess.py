import io
import re

import pandas as pd


def ing(file):
    # Normalize input: file path (str) or uploaded file object (bytes)
    if isinstance(file, str):
        with open(file, encoding="windows-1252") as f:
            content = f.read()
    else:
        content = file.read().decode("windows-1252")

    lines = content.splitlines()

    # Step 1: Read metadata from the top rows
    metadata = {}
    header_row = None

    for i, line in enumerate(lines):
        parts = line.strip().split(";")

        # Metadata lines have format: "key;value"
        if len(parts) == 2 and parts[0] and parts[1]:
            metadata[parts[0]] = re.sub(
                r"\s+", "", parts[1]
            )  # Remove all kinds of whitespace (spaces, tabs, newlines)

        # Detect table header (first line starting with "Buchung")
        if parts[0] == "Buchung":
            header_row = i
            break

    # Step 2: Read transaction table starting from the header row
    df = pd.read_csv(io.StringIO(content), sep=";", skiprows=header_row)

    # Step 3: Add metadata as columns to each transaction row
    for key, value in metadata.items():
        df[key] = value

    return df


def default(file):
    return pd.read_csv(
        file,
        encoding="utf-8",
        sep=";",
    )
