import json
import os
from pathlib import Path


def load_config(section: str = None) -> dict:
    _PACKAGE_ROOT = Path(__file__).resolve().parent.parent  # → parse_invoice_letter/

    # You should use CONFIG_PATH instead of EXAMPLE_CONFIG_PATH to load the config in other scripts,
    # because the EXAMPLE_CONFIG_PATH is only for example and testing with dummy data,
    # not for real data processing
    CONFIG_PATH = _PACKAGE_ROOT / "config" / "config.json"
    EXAMPLE_CONFIG_PATH = _PACKAGE_ROOT / "config" / "config.example.json"

    try:
        is_test_env = os.environ.get("DJANGO_ENV") == "test"
    except Exception:
        is_test_env = (
            False  # In case DJANGO_ENV is not set, treat it as non-test environment
        )
    ACTIVE_CONFIG_PATH = EXAMPLE_CONFIG_PATH if is_test_env else CONFIG_PATH

    with open(ACTIVE_CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    if section:
        shared = {k: v for k, v in config.items() if not isinstance(v, dict)}
        return {**shared, **config.get(section, {})}

    return config


def create_path_if_not_exist(path):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)


def get_csv_filenames(folder: str) -> list[str]:
    return [f.name for f in Path(folder).glob("*.csv")]
