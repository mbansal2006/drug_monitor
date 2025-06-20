import pandas as pd

# Define mappings
five_eyes = {"USA", "CAN", "GBR", "AUS", "NZL"}
# https://www.dni.gov/files/ICIG/Documents/Partnerships/FIORC/Signed%20FIORC%20Charter%20with%20Line.pdf
nato = {
    "ALB", "BEL", "BGR", "CAN", "HRV", "CZE", "DNK", "EST", "FIN", "FRA", "DEU",
    "GRC", "HUN", "ISL", "ITA", "LVA", "LTU", "LUX", "MNE", "NLD", "MKD", "NOR",
    "POL", "PRT", "ROU", "SVK", "SVN", "ESP", "SWE", "TUR", "GBR", "USA"
}
# https://www.nato.int/cps/en/natohq/topics_52044.htm
taa_compliant = {
    "AFG", "FRA", "NER", "AGO", "GMB", "MKD", "DEU", "NOR", "ARM", "GRC", "OMN", 
    "ABW", "GRD", "PAN", "AUS", "GTM", "PER", "AUT", "GIN", "POL", "BHS", "GNB", 
    "PRT", "BHR", "GUY", "ROU", "BGD", "HTI", "RWA", "BRB", "HND", "BEL", "HKG", 
    "WSM", "BLZ", "HUN", "BEN", "ISL", "SEN", "BTN", "IRL", "SLE", "ISR", "SGP", 
    "VGB", "ITA", "BGR", "JAM", "SXM", "BFA", "JPN", "SVK", "BDI", "KIR", "SVN", 
    "KHM", "KOR", "SLB", "CAN", "LAO", "SOM", "CAF", "LVA", "SSD", "TCD", "LSO", 
    "ESP", "CHL", "LBR", "COL", "LIE", "COM", "LTU", "CRI", "LUX", "SWE", "HRV", 
    "MDG", "CHE", "CUW", "MWI", "TWN", "CYP", "MLI", "TZA", "CZE", "MLT", "TLS", 
    "COD", "MRT", "TGO", "DNK", "MEX", "DJI", "MDA", "TUV", "DMA", "MNE", "UGA", 
    "DOM", "MSR", "UKR", "SLV", "MAR", "GBR", "GNQ", "MOZ", "VUT", "ERI", "NPL", 
    "YEM", "EST", "NLD", "RNR", "ETH", "NZL", "FIN", "NIC"
}
# https://gsa.federalschedules.com/resources/taa-designated-countries/#taachart
oecd = {
    "AUS", "AUT", "BEL", "CAN", "CHL", "COL", "CRI", "CZE", "DNK", "EST", "FIN", 
    "FRA", "DEU", "GRC", "HUN", "ISL", "IRL", "ISR", "ITA", "JPN", "KOR", "LVA", 
    "LTU", "LUX", "MEX", "NLD", "NZL", "NOR", "POL", "PRT", "SVK", "SVN", "ESP", 
    "SWE", "CHE", "TUR", "GBR", "USA"
}
# https://www.oecd.org/en/about/members-partners.html
mnna = {
    "ARG", "AUS", "BHR", "BRA", "COL", "EGY", "ISR", "JPN", "JOR", "KEN", "KWT", 
    "MAR", "NZL", "PAK", "PHL", "QAT", "KOR", "TWN", "THA", "TUN"
}
# https://samm.dsca.mil/glossary/major-non-nato-allies
quad = {"USA", "AUS", "JPN", "IND"}
# https://www.congress.gov/crs-product/IF11678
bis_ns1 = {
    "AFG", "ALB", "DZA", "AND", "AGO", "ARG", "ARM", "ABW", "AUS", "AUT", "AZE", 
    "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BTN", "BOL", "BWA",
    "BRA", "BRN", "BGR", "BFA", "BDI", "KHM", "CMR", "CAN", "CPV", "CAF", "TCD",
    "CHL", "CHN", "COL", "COM", "COD", "COG", "CRI", "CIV", "HRV", "CUW", "CYP", 
    "CZE", "DNK", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", 
    "SWZ", "ETH", "FJI", "FIN", "FRA", "GAB", "GMB", "GEO", "DEU", "GHA", "GRC", 
    "GRD", "GTM", "GIN", "GNB", "GUY", "HTI", "HND", "HUN", "ISL", "IND", "IDN", 
    "IRQ", "IRL", "ISR", "ITA", "JAM", "JPN", "JOR", "KAZ", "KEN", "KIR", "KOR", 
    "XXK", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU", 
    "LUX", "MAC", "MKD", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MRT", 
    "MUS", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MAR", "MOZ", "NAM", "NRU", 
    "NPL", "NLD", "NZL", "NIC", "NER", "NGA", "MKD", "NOR", "OMN", "PAK", "PLW", 
    "PAN", "PNG", "PRY", "PER", "PHL", "POL", "PRT", "QAT", "ROU", "RUS", "RWA", 
    "WSM", "SMR", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", "SVK", "SVN", 
    "SLB", "SOM", "ZAF", "SSD", "ESP", "LKA", "SDN", "SUR", "SWZ", "SWE", "CHE", 
    "TWN", "TJK", "TZA", "THA", "TLS", "TGO", "TON", "TUN", "TUR", "TKM", "TUV", 
    "UGA", "UKR", "ARE", "GBR", "URY", "UZB", "VUT", "VAT", "VEN", "VNM", "ESH", 
    "YEM", "RNR", "ZWE"
}
bis_rs1 = {
    "AFG", "ALB", "DZA", "AND", "AGO", "ARM", "ABW", "AZE", "BHS", "BHR", "BGD", 
    "BRB", "BLR", "BLZ", "BEN", "BTN", "BOL", "BWA", "BRA", "BRN", "BFA", "BDI", 
    "KHM", "CMR", "CPV", "CAF", "TCD", "CHL", "CHN", "COL", "COM", "COD", "COG", 
    "CRI", "CIV", "CUW", "CYP", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", 
    "ERI", "SWZ", "ETH", "FJI", "GAB", "GMB", "GEO", "GHA", "GRD", "GTM", "GIN", 
    "GNB", "GUY", "HTI", "HND", "IDN", "IRQ", "ISR", "JAM", "JOR", "KAZ", "KEN", 
    "KIR", "XXK", "KWT", "KGZ", "LAO", "LBN", "LSO", "LBR", "LBY", "MAC", "MDG", 
    "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MRT", "MUS", "FSM", "MDA", "MCO", 
    "MNG", "MNE", "MAR", "MOZ", "NAM", "NRU", "NPL", "NIC", "NER", "NGA", "MKD", 
    "OMN", "PAK", "PLW", "PAN", "PNG", "PRY", "PER", "PHL", "QAT", "RUS", "RWA", 
    "WSM", "SMR", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", "SLB", "SOM", 
    "ZAF", "SSD", "LKA", "SDN", "SUR", "SWZ", "SYR", "TWN", "TJK", "TZA", "THA", 
    "TLS", "TGO", "TON", "TUN", "TKM", "TUV", "UGA", "UKR", "ARE", "URY", "UZB", 
    "VUT", "VAT", "VEN", "VNM", "ESH", "YEM", "RNR", "ZWE"
}
# https://www.bis.doc.gov/index.php/documents/regulations-docs/2253-supplement-no-1-to-part-738-commerce-country-chart/file
ofac_sanction_program = {
    "IRN", "PRK", "SYR", "CUB", "RUS", "BLR", "VEN", 
    "MMR", "SDN", "YEM", "ZWE", "NIC", "CAF", "COD", 
    "ETH", "SSD", "HTI", "SOM", "LBN"
}
# https://ofac.treasury.gov/sanctions-programs-and-country-information

counterfeit_concern = {
    "BEL", "BGR", "DEU", "POL", "ROU"
}
dumping = {"CHN"}
export_bans = {"IND", "CHN"}
# https://ustr.gov/sites/default/files/files/Press/Reports/2025NTE.pdf

fda_oai_rate_above_5 = {
    "IND", "CHN"
}
# https://datadashboard.fda.gov/oii/cd/inspections.htm
# Load your Excel or CSV file
df = pd.read_csv("country_risk.csv")
df['country'] = df['country'].str.strip().str.upper()

# Start with baseline score
df["risk_score"] = 5  # neutral baseline

# Positive bonuses
df.loc[df["country"].isin(five_eyes), "risk_score"] += 2
df.loc[df["country"].isin(nato), "risk_score"] += 1
df.loc[df["country"].isin(mnna), "risk_score"] += 1
df.loc[df["country"].isin(oecd), "risk_score"] += 1
df.loc[df["country"].isin(quad), "risk_score"] += 1
df["taa_compliant"] = df["country"].isin(taa_compliant)
df.loc[df["taa_compliant"], "risk_score"] += 1

# Negative penalties
df.loc[df["country"].isin(bis_ns1), "risk_score"] -= 2
df.loc[df["country"].isin(bis_rs1), "risk_score"] -= 2
df.loc[df["country"].isin(ofac_sanction_program), "risk_score"] -= 4
df.loc[df["country"].isin(export_bans), "risk_score"] -= 2
df.loc[df["country"].isin(dumping), "risk_score"] -= 2
df.loc[df["country"].isin(fda_oai_rate_above_5), "risk_score"] -= 2
df.loc[~df["taa_compliant"], "risk_score"] -= 1  # if not compliant

# Clamp to [0, 10]
df["risk_score"] = df["risk_score"].clip(0, 10)

# Add boolean flags for all criteria
df["is_five_eyes"] = df["country"].isin(five_eyes)
df["is_nato"] = df["country"].isin(nato)
df["is_mnna"] = df["country"].isin(mnna)
df["is_oecd"] = df["country"].isin(oecd)
df["is_quad"] = df["country"].isin(quad)
df["taa_compliant"] = df["country"].isin(taa_compliant)

df["has_bis_ns1"] = df["country"].isin(bis_ns1)
df["has_bis_rs1"] = df["country"].isin(bis_rs1)
df["ofac_sanctioned"] = df["country"].isin(ofac_sanction_program)
df["has_export_ban_history"] = df["country"].isin(export_bans)
df["engages_in_dumping"] = df["country"].isin(dumping)
df["quality_risk_flag"] = df["country"].isin(fda_oai_rate_above_5)

# Export to CSV
df.to_csv("scored_country_risk.csv", index=False)
print("Saved to scored_country_risk.csv")