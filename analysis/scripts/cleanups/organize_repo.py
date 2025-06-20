import os
import shutil

# Define folder structure
FOLDERS = {
    "data_raw": [
        "decrs.csv", "oai_fda.csv", "oai_duns.csv", "country_risk.csv",
        "scored_country_risk.csv"
    ],
    "data_processed": [
        "ndcs.csv", "location_import.csv", "location_with_risk.csv",
        "ndc_to_location.csv", "llm_locations.csv", "llm_locations_parsed_test.csv",
        "llm_locations_parsed.csv", "locations_cleanup.csv", "locations_cleanup_test.csv"
    ],
    "site_csv": [
        "site_locations_table.csv", "site_ndcs_table.csv", "site_csv_visibility.csv",
        "site_manufacturers_table.csv", "site_drugs_table.csv",
        "site_ndc_location_link.csv"
    ],
    "scripts": [
        "fetch_spl_xml.py", "get_plant_risk.py", "risk_calc.py",
        "merge_locations.py", "parse_address_fields.py", "merge_establishment_data.py",
        "locations_cleanup.py", "ndc_to_locations.csv", "parse_xml_establishments.py",
        "parse_xml_establishments_test.py", "xml_path_cleanup.py",
        "fetch_spl_xml_test.py"
    ],
    "spl_xml_files": [],  # folder — move it
    "logs": [
        "spl_xml_log.csv", "spl_xml_log_updated.csv", "spl_xml_test_log.csv",
        "xml_path_cleanup.py"
    ],
    "references": [
        "2025NTE.pdf", "BIS Commerce Country Chart.pdf"
    ]
}

def ensure_folder(path):
    if not os.path.exists(path):
        os.makedirs(path)

def move_file(file, folder):
    if os.path.exists(file):
        shutil.move(file, folder)
        print(f"Moved {file} → {folder}")

def organize_repo():
    for folder, files in FOLDERS.items():
        ensure_folder(folder)
        for file in files:
            move_file(file, folder)

    # Move folders like spl_xml_files and site_csv if they already exist
    for folder in ["spl_xml_files", "site_csv"]:
        if os.path.isdir(folder):
            print(f"{folder}/ already exists; leaving in place.")
        else:
            ensure_folder(folder)

    print("\n✅ Organization complete!")

if __name__ == "__main__":
    organize_repo()