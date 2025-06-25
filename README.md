# Drug Monitor
<p align="center">
  <img width="650" alt="image" src="https://github.com/user-attachments/assets/1bbbdedb-78c1-4c6f-bc82-ccaa3e0b4791" />
</p>

This project analyzes the **geographic and geopolitical risk exposure** of pharmaceuticals for **finished dosage forms (FDFs)** of all FDA-approved drug products to support visibility, accountability, and resilience in U.S. drug supply chains. This dataset does not yet include BLA-regulated biologics (e.g., monoclonal antibodies).

This project focuses on finished dosage forms (FDFs). API-level risk scoring is possible using the same methodology, pending expanded metadata.

## Project Overview

By mapping where drugs are manufactured, identifying regulatory or geopolitical red flags, and quantifying national security dependencies, the tool offers a data-driven foundation for:

- Supply chain risk management  
- Shortage prevention and monitoring  
- Domestic capacity planning  
- Strategic sourcing evaluations

All scoring and site data are derived from U.S. government and intergovernmental sources, including the FDA, GSA, BIS, OFAC, the U.S. State Department, NATO, and the OECD. The system updates weekly. However, note that many data sources such as openFDA are updated infrequently such as on a quarterly basis.

Built with Palantir Foundry, the model is fully queryable in all directions—allowing seamless tracing from drugs to manufacturers to global production sites and back, enabling comprehensive, multidimensional analysis of the supply chain. Users can filter and pivot across any dimension in Palantir Foundry (e.g., by drug class, country risk, or manufacturer).

This project is modeled in both Palantir Foundry and a Ruby on Rails web application. The Rails app loads structured datasets from CSV files into a PostgreSQL database and defines ActiveRecord models with full associations between drugs, manufacturers, NDCs, and manufacturing locations. It supports custom Rake tasks for CSV import, a fully normalized schema, and is designed for extensibility in frontend views (e.g. search, filter, and relationship maps).

## Drug Supply Chain Data Sources

| Source                                                                                  | Used For                                                                 |
|-----------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| [FDA Drug Shortages Database](https://www.accessdata.fda.gov/scripts/drugshortages/)   | Identifying drugs currently in shortage                                 |
| [openFDA](https://open.fda.gov/apis/drug/ndc/)                                          | Mapping NDCs to SPL Set IDs and product metadata                        |
| [DailyMed](https://dailymed.nlm.nih.gov/dailymed/spl-resources-all-drug-labels.cfm)     | Downloading and parsing SPL XMLs to extract manufacturer information    |
| [DECRS Establishment Database](https://www.fda.gov/drugs/drug-registration-and-listing-system-drls-and-edrls/data-files-drug-establishments-current-registration-site-decrs) | Linking FEI/DUNS numbers to physical manufacturing locations             |

All data is sourced from official U.S. government systems to ensure transparency, reliability, and regulatory consistency across the supply chain ontology.

### Key Capabilities

- Determine where finished dosage forms (FDFs) are manufactured globally 
- Quantify national security risk using geographic, regulatory, and geopolitical indicators tied to pharmaceutical production  
- Identify drugs most exposed to fragile or adversarial production networks  
- Support strategies to prioritize domestic or allied sourcing of essential medicines through targeted risk insights  
- Deliver actionable insights to inform policy discussions, such as Section 232 investigations, by quantifying foreign dependency and national security exposure in the pharmaceutical supply chain

---

## Core Models & Relationships

This project is modeled in both **Palantir Foundry** and a **Ruby on Rails** webapp, integrating structured datasets on drugs, manufacturers, and global production sites.

### `Drug`

- Fields:  
  `drug_name`, `fda_essential`, `reason`, `shortage_start`, `shortage_end`  
  `therapeutic_categories`, `update_date`, `update_type`
- Relationships:  
  `has_many :ndcs`

### `Ndc`

- Fields:  
  `ndc_code`, `proprietary_name`, `generic_name`, `drug_dosage`, `drug_strength`, `spl_set_id`
- Relationships:  
  `belongs_to :drug`, `belongs_to :manufacturer`  
  `has_many :ndc_location_links`, `has_many :locations, through: :ndc_location_links`

### `Manufacturer`

- Fields:  
  `manufacturer_name`
- Relationships:  
  `has_many :ndcs`

### `Location`

- Fields:  
  `address`, `country`, `state_or_region`, `postal_code`, `full_country_name`,  
  `latitude`, `longitude`, `duns_number`, `firm_name`, `risk_score`, `oai_count`, `related_entities`  
  Booleans:  
  `taa_compliant`, `engages_in_dumping`, `has_bis_ns1`, `has_bis_rs1`, `has_export_ban_history`,  
  `is_five_eyes`, `is_mnna`, `is_nato`, `is_oecd`, `is_quad`, `ofac_sanctioned`, `quality_risk_flag`
- Relationships:  
  `has_many :ndc_location_links`, `has_many :ndcs, through: :ndc_location_links`

### `NdcLocationLink`

- Fields:  
  `ndc_id`, `location_id`
- Relationships:  
  `belongs_to :ndc`, `belongs_to :location`

### Abridged Example: Linking an NDC to Drug, Manufacturer, and Location

Below is a real-world example showing how a single drug product (represented by an NDC) is connected to its drug classification, manufacturer, and a physical production location. This demonstrates how the database links structured fields across models.

Each row represents an object from a different table. The `id` columns (e.g. `ndc_id`, `drug_id`) are internal reference numbers used within the database to link related entries. These are not publicly meaningful but allow us to relate records to each other consistently.

#### NDC Record (Product Configuration)
| Field             | Value                          | Description                                              |
|------------------|----------------------------------|----------------------------------------------------------|
| `ndc_id`         | 14343                           | Internal ID for this NDC record                          |
| `ndc_code`       | `77790-022`                     | Official FDA NDC (National Drug Code)                    |
| `proprietary_name` | Vista Gonio Eye Lubricant     | Brand name of the product                                |
| `generic_name`   | Hypromellose Ophthalmic Solution | Standardized drug ingredient name                        |
| `drug_dosage`    | SOLUTION                        | Form of the product (e.g. tablet, solution)              |
| `drug_strength`  | 25 mg/15mL                      | Amount of active ingredient                              |
| `spl_set_id`     | 00da365d-2988-9c9e-e063-6294a90a8931 | ID used to retrieve full FDA label from DailyMed      |
| `drug_id`        | 658                              | Internal reference to the associated `Drug`              |
| `manufacturer_id`| 138                              | Internal reference to the associated `Manufacturer`      |

#### Drug Record (Therapeutic Classification)
| Field           | Value                            | Description                                              |
|----------------|------------------------------------|----------------------------------------------------------|
| `drug_id`      | 658                                | Internal ID for this drug entity                         |
| `drug_name`    | Hypromellose Ophthalmic Solution Solution | Full classification of the active compound       |
| Other fields   | _(null)_                           | Additional info (e.g. shortage status) not provided here |

#### Manufacturer Record
| Field               | Value               | Description                            |
|---------------------|---------------------|----------------------------------------|
| `manufacturer_id`   | 138                 | Internal ID for this manufacturer       |
| `manufacturer_name` | Red Wedding LLC     | Entity responsible for the product      |

#### Location Record (Production Site)
| Field               | Value                                                              | Description                                                      |
|---------------------|--------------------------------------------------------------------|------------------------------------------------------------------|
| `location_id`       | 264                                                                | Internal ID for the location                                     |
| `firm_name`         | WIZCURE PHARMAA PRIVATE LIMITED                                     | Name of the manufacturing site                                   |
| `address`           | H 881 Industrial Area, Bhiwadi, Alwar, Rajasthan 301019, India     | Physical address of the facility                                 |
| `country`           | IND                                                                | ISO3 country code                                                |
| `full_country_name` | India                                                              | Human-readable country name                                      |
| `state_or_region`   | Rajasthan                                                          | Region or state                                                  |
| `postal_code`       | 301019                                                             | Postal code                                                      |
| `latitude` / `longitude` | 28.2052 / 76.8294                                            | Coordinates for mapping                                          |
| `duns_number`       | 871769521                                                          | Global facility identifier used in commerce and regulation       |
| `taa_compliant`     | false                                                              | Does this site comply with U.S. trade agreement rules?           |
| `engages_in_dumping`| false                                                              | Has the site been flagged for dumping risk?                      |
| `has_bis_ns1`       | true                                                               | Associated with BIS NS1 export restriction list                  |
| `has_export_ban_history` | true                                                        | Site has a known export ban history                              |
| `is_quad`           | true                                                               | Located in QUAD security alliance country?                       |
| `quality_risk_flag` | true                                                               | Flagged for known quality or regulatory issues                   |

#### NdcLocationLink Record
| Field         | Value | Description                                   |
|---------------|-------|-----------------------------------------------|
| `ndc_id`      | 14343 | Links to the NDC record above                 |
| `location_id` | 264   | Links to the location shown above             |
| `created_at`  | 2025-06-24 | Timestamp when this link was recorded   |

> _Note: This example is abridged for clarity. In production, each NDC may have multiple associated locations, and fields may be further enriched over time._
---

## Risk Score Methodology

Each `Location` is assigned a `risk_score` from **0 (high risk)** to **10 (low risk)**. Scores are additive and clamped to this range, using a structured system grounded entirely in **U.S. government data** with the exception of member lists such as NATO or OECD. The model accounts for alliance status, export behavior, sanctions, quality compliance, and trade law alignment.

Scores are computed in Palantir Foundry and Python using national-level mappings, then joined to locations via country codes.

### Positive Criteria: Strategic Alignment & Compliance

| Criteria                                       | Source                                         | Score Impact |
|-----------------------------------------------|------------------------------------------------|---------------|
| Member of Five Eyes (FVEY)                    | U.S. Intelligence Community Charter            | +2            |
| NATO Member                                   | NATO Official List                             | +1            |
| Major Non-NATO Ally (MNNA)                    | DSCA SAMM Glossary                             | +1            |
| OECD Member                                   | OECD Country List                              | +1            |
| QUAD Member                                   | Congressional Research Service (IF11678)       | +1            |
| Trade Agreements Act (TAA) Compliant          | GSA TAA Chart                                  | +1            |

### Negative Criteria: Risk Flags and Noncompliance

| Criteria                                       | Source                                         | Score Impact |
|-----------------------------------------------|------------------------------------------------|---------------|
| BIS NS1 Classification                        | BIS Commerce Country Chart (Supp. No. 1)       | -2            |
| BIS RS1 Classification                        | BIS Commerce Country Chart (Supp. No. 1)       | -2            |
| OFAC Sanctioned Nation                        | U.S. Treasury Sanctions Programs               | -4            |
| History of Export Bans on Drugs               | USTR 2025 National Trade Estimate              | -2            |
| Known Dumping in API/Pharma                   | USTR 2025 National Trade Estimate              | -2            |
| FDA OAI Rate >5% (Inspection Failures)        | FDA Inspections Dashboard                      | -2            |
| Not TAA Compliant                             | GSA TAA Chart                                  | -1            |

> If a country is not TAA compliant, an additional -1 penalty is applied regardless of other affiliations.

### Risk Score Calculation Logic

- Start from a **neutral base score of 5**
- Apply all applicable bonuses and penalties
- Clamp the final result between **0 (minimum risk)** and **10 (maximum risk)**

All criteria are applied using boolean flags such as:

- `is_five_eyes`, `is_nato`, `is_mnna`, `is_oecd`, `is_quad`, `taa_compliant`
- `has_bis_ns1`, `has_bis_rs1`, `ofac_sanctioned`, `has_export_ban_history`, `engages_in_dumping`, `quality_risk_flag`

---

### Example Scoring Flow

#### India (`IND`)

| Attribute                         | Value   | Score Change           |
|----------------------------------|----------|--------------------------|
| QUAD Member                      | Yes     | +1                       |
| TAA Compliant                    | No      | -1                       |
| BIS NS1 Listed                   | Yes     | -2                       |
| Export Ban History               | Yes     | -2                       |
| FDA OAI Risk Flag (>5%)         | Yes     | -2                       |
| Total Score                      |          | 5 + 1 - 7 = -1           |
| Final Risk Score (clamped)      |          | 0                        |

India receives no alliance benefits and is penalized for NS1 classification, export restrictions, and an above-average FDA inspection failure rate—placing it in the highest risk category.

---

#### United Kingdom (`GBR`)

| Attribute                         | Value   | Score Change           |
|----------------------------------|----------|--------------------------|
| Five Eyes Member                 | Yes     | +2                       |
| NATO Member                      | Yes     | +1                       |
| OECD Member                      | Yes     | +1                       |
| TAA Compliant                    | Yes     | +1                       |
| Total Score                      |          | 5 + 5 = 10            |
| Final Risk Score (clamped)      |          | 10                        |

The UK ranks as a low-risk partner due to its extensive alliance memberships and trade compliance, with only a minor deduction for BIS NS1 classification.

---

## Country-Level Risk Data Sources

| Source                                                                 | Used For                             |
|------------------------------------------------------------------------|--------------------------------------|
| https://www.nato.int/cps/en/natohq/topics_52044.htm                   | NATO, MNNA, Five Eyes flags          |
| https://gsa.federalschedules.com/resources/taa-designated-countries/ | Trade law compliance                 |
| https://www.bis.doc.gov/                                              | NS1, RS1 country designations        |
| https://ofac.treasury.gov/sanctions-programs-and-country-information | Sanctioned countries                 |
| https://ustr.gov/sites/default/files/files/Press/Reports/2025NTE.pdf | Export bans, dumping                 |
| https://datadashboard.fda.gov/oii/cd/inspections.htm                  | OAI rate >5%                         |
| https://www.oecd.org/en/about/members-partners.html                  | Development/ally alignment           |
| https://www.congress.gov/crs-product/IF11678                         | QUAD identification                  |
| Internal country lookup table                                        | Risk score and flag generation       |

> All risk scores and flags are stored in `site_country_names.csv` and joined to each `Location` via the `country` field.

## Case Study: Metronidazole Injection

### Drug Details

| Field                  | Value                     |
|------------------------|---------------------------|
| **Drug Name**          | Metronidazole Injection   |
| **Therapeutic Category** | Anti-Infective          |
| **Shortage Status**    | Current                   |
| **Shortage Start**     | January 13, 2022          |
| **Last Update**        | June 17, 2025 (Reverified)|
| **Reason**             | Discontinuation of manufacture |

---

### Manufacturers

- InfoRLife SA  
- B. Braun Medical Inc.  
- Gland Pharma Limited  
- Baxter Healthcare  

---

### Products

| Proprietary Name                        | NDC Code      | Dosage     | Strength        | Manufacturer          |
|----------------------------------------|---------------|------------|------------------|------------------------|
| Metronidazole In Flexible Container    | 0409-0152-24  | Injection  | 500 mg/100 mL    | InfoRLife SA           |
| Metro I.V. In Plastic Container        | 0264-5535-32  | Injection  | 500 mg/100 mL    | B. Braun Medical Inc.  |
| Metronidazole                          | 25021-131-82  | Injection  | 500 mg/100 mL    | InfoRLife SA           |
| Metronidazole In Plastic Container     | 47335-993-01  | Injection  | 500 mg/100 mL    | Gland Pharma Limited   |
| Flagyl I.V. Rtu In Plastic Container   | 0338-1055-48  | Injection  | 500 mg/100 mL    | Baxter Healthcare      |

---

### Manufacturing Locations  
#### Example: *Metronidazole In Flexible Container* by **InfoRLife SA**

| Firm Name                          | DUNS Number | Address                                                                 | Country | Risk Score |
|-----------------------------------|-------------|-------------------------------------------------------------------------|---------|------------|
| Boehringer Ingelheim Fremont, Inc.| 967820619   | 6701 Kaiser Drive, Fremont, California (CA) 94555, United States (USA) | USA     | 10          |
| Catalent Indiana, LLC             | 172209277   | 1300 S. Patterson Drive, Bloomington, Indiana (IN) 47403, United States (USA) | USA     | 10          |

---

### Notes

- This example highlights one product and one manufacturer.
- Can query further: The system supports repeatable analysis across **all products, drugs, categories, and locations**.

## Next Steps / Development Roadmap

- Expand FDA inspection data to site-level OAI trends  
- Add more granular geographic intelligence (e.g., city-level export chokepoints)  
- Integrate DailyMed and Structured Product Label (SPL) metadata  
- Build policy dashboard overlay for real-time shortage triage  
- Add additional drugs and products beyond the FDA Drug Shortages Database  
- Fill in missing manufacturing location data using non-FDA government sources and public SPL XMLs  

---

## Contact

For inquiries, collaboration, or custom builds:

**Mahir Bansal**  
📧 mb@mahirbansal.com  
📞 571.751.0100  

