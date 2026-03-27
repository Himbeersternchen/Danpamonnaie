from parse_invoice_letter.read_invoice_csv import ReadInvoice
from parse_invoice_letter.utils.about_path import get_csv_filenames, load_config

if __name__ == "__main__":
    # This script should be ran with "python -m parse_invoice_letter.utils.save_invoice_descriptions" on the same dir level with manage.py
    # This script is designed to read the invoice CSV files, extract the descriptions, and save them into new CSV files for further analysis (e.g., finding unmatched descriptions).
    pre_config = load_config()
    extract_descriptions_config = pre_config.get("extract_descriptions", {})
    OUTPUT_SUBDIR = extract_descriptions_config.get(
        "OUTPUT_SUBDIR", "invoice_descriptions/"
    )
    BASE_DIR = pre_config.get("BASE_DIR")
    base_path = f"{BASE_DIR}invoices/"
    invoice_folder_paths = []
    for path_info in extract_descriptions_config.get("INVOICE_FOLDER_PATHS", []):
        invoice_folder_paths.append(
            {
                "path": f"{base_path}{path_info.get('sub_path', '')}",
                "bank_name": path_info.get("bank_name", ""),
            }
        )

    for path_info in invoice_folder_paths:
        csv_file_names = get_csv_filenames(path_info["path"])
        for csv_file_name in csv_file_names:

            config = {
                "BASE_DIR": path_info["path"],
                "FILE_PATH": csv_file_name,
                "USER_NICKNAME": pre_config.get("USER_NICKNAME"),
                "BANK_NAME": path_info["bank_name"],
            }

            save_path = f"{BASE_DIR}{OUTPUT_SUBDIR}{path_info['bank_name']}/{csv_file_name}_description.csv"

            read_invoice = ReadInvoice(config)
            read_invoice.save_description_into_new_csv(save_path)
