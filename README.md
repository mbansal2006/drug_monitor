
# Comprehensive Risk Scoring Methodology

The `risk_score` assigned to each `Location` reflects national security exposure, trade compliance status, and supply chain fragility—grounded entirely in **U.S. government sources**. It is designed to support tariff justifications, reshoring prioritization, and pharmaceutical security policy analysis.

## Purpose

This scoring methodology allows stakeholders to:

- Identify geographic clusters of high-risk pharmaceutical production
- Quantify U.S. dependency on adversarial or noncompliant nations
- Generate risk-adjusted drug supply dashboards and analytics
- Flag candidate locations for domestic capacity investments

---

## Score Range

Each location is assigned a numeric `risk_score` ranging from **+5 (low risk)** to **-5 (high risk)**. Scores are additive and derived from regulatory, geopolitical, and compliance criteria. If no sufficient information is available, a value of `null` is assigned.

---

## Positive Scoring Criteria: Strategic Alignment & Trade Compliance

| Criteria                             | Source          | Score Impact |
|--------------------------------------|------------------|---------------|
| Member of Five Eyes                  | U.S. State Dept  | +3            |
| NATO Member (non-FVEY)               | U.S. State Dept  | +2            |
| Major Non-NATO Ally (MNNA)           | U.S. State Dept  | +1            |
| Trade Agreements Act (TAA) Compliant | GSA              | +1            |
| U.S. Domestic Manufacturing Site     | FDA Establishment| +5            |

---

## Negative Scoring Criteria: Adversarial Designation & Trade Risk

| Criteria                                           | Source              | Score Impact |
|----------------------------------------------------|----------------------|---------------|
| Sanctioned (OFAC SDN or Entity List)              | U.S. Treasury / BIS | -3            |
| Designated Foreign Adversary                      | FCC, Commerce Dept  | -3            |
| Subject to EAR export restrictions                | BIS                 | -2            |
| Not TAA Compliant                                 | GSA                 | -1            |
| Hostile geopolitical posture toward U.S. pharma   | Interagency Review  | -2 to -3      |

---

## Supply Chain Fragility & Quality Risk Adjustments

| Criteria                                  | Description                              | Score Impact |
|-------------------------------------------|------------------------------------------|--------------|
| Sole-source manufacturing for critical drug | Based on NDC clustering                   | -1           |
| Location linked to multiple shortages     | Derived from FDA shortage data           | -1           |
| Facility flagged by FDA warning letters   | FDA EIR data                             | -1 to -2     |

---

## Implementation Details

- All scoring logic is implemented in Palantir Foundry using U.S. government reference datasets.
- Joins are performed by `country`, `FEI`, `DUNS`, and parsed `full_address` from SPL XMLs.
- Scores apply **only** to establishments linked to a validated `MANUFACTURE` operation in DECRS.

---

## Example: Applying Score to Amoxicillin Site

```json
{
  "location_id": "LOC123",
  "country": "India",
  "state_or_region": "Telangana",
  "postal_code": "500072",
  "full_address": "Plot No.2, Survey No. 38, Bachupally, Hyderabad, Telangana, 500072",
  "taa_compliant": false,
  "risk_score": -1
}
```

**Scoring Breakdown**:

- -1: TAA non-compliance
- +0: No ally designation
- No GMP violation
- **Final Score: -1**

---

## Applications

- Heatmap of global pharmaceutical manufacturing risk
- Drug-level dependency analysis with risk-adjusted scores
- Identifying top reshoring candidates for API and FDF

> Scoring decisions are fully explainable, reproducible, and auditable. Only **U.S. government data** is used.

