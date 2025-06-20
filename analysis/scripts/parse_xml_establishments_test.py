import os
import csv
from lxml import etree

xml_folder = "./spl_xml_files"
output_csv = "extracted_establishments_test.csv"
all_files = sorted([f for f in os.listdir(xml_folder) if f.endswith(".xml")])
test_files = all_files[:10]  # remove or modify to process all files

print(f"🔍 Extracting from {len(test_files)} XML files...\n")

rows = []

for file in test_files:
    path = os.path.join(xml_folder, file)
    print(f"📄 Parsing: {file}")

    try:
        tree = etree.parse(path)

        # Extract <setId root="...">
        set_id_tag = tree.xpath("//*[local-name()='setId']")
        set_id = set_id_tag[0].attrib["root"] if set_id_tag else "UNKNOWN"

        found_any = False

        # Scan orgs/entities for ID + MANUFACTURE
        for org in tree.xpath("//*[local-name()='assignedOrganization' or local-name()='assignedEntity']"):
            id_tags = org.xpath(".//*[local-name()='id' and @extension]")
            if not id_tags:
                continue
            fei = id_tags[0].attrib["extension"]

            manufacture_codes = org.xpath(
                ".//*[local-name()='performance']/*[local-name()='actDefinition']/*[local-name()='code' and translate(@displayName, 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')='MANUFACTURE']"
            )

            if manufacture_codes:
                print(f"  ✅ {fei}")
                rows.append({
                    "filename": file,
                    "set_id": set_id,
                    "fei": fei
                })
                found_any = True

        if not found_any:
            print("  ❌ No MANUFACTURE establishments found.")

    except Exception as e:
        print(f"  ❌ Failed to parse {file}: {e}")

# Write to CSV
with open(output_csv, "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["filename", "set_id", "fei"])
    writer.writeheader()
    writer.writerows(rows)

print(f"\n✅ Done! Wrote {len(rows)} rows to {output_csv}")