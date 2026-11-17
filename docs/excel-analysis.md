# Excel analysis

Audit date: 17 November 2026. Source: `PTS Infra.xlsx`, inspected read-only with openpyxl, both formula and cached-value views. These are historical reference records, not current live balances. The client intends to update live records later. Figures are descriptive, not audited balances.

## Scope and inclusion

All three worksheets were inspected. For this audit an invoice row has a numeric invoice value and at least one of vendor, reference or invoice date. All 444 qualifying rows (CONSOLIDATED rows 2–445) actually have all four fields. There are another 1,287 non-invoice rows with only a cached zero outstanding and a year (rows 446–1732); these are excluded. Remaining formatted rows do not supply additional financial records. This inclusion rule is for this audit, not an approved permanent entry policy.

## Recorded invoice totals

| Measure | Result |
| --- | ---: |
| Invoice records | 444 |
| Invoice value | ₹3,12,55,919.22 |
| Recorded paid amount | ₹2,73,03,522.22 |
| Recorded outstanding, rounded to paise | ₹39,52,397.00 |
| Invoices with positive recorded outstanding | 48 |
| Zero recorded outstanding | 396 |

Totals sum the qualifying rows, treating 44 blank paid amounts as zero **for this comparison only**. The two totals subtract to ₹39,52,397.00. Cached outstanding agrees at paise precision for every qualifying row. Cell G418 has a floating-point cached value of 253254.3999999999 versus a calculated ₹2,53,254.40, a negligible representation difference, not a corrected source value. There are no negative invoice, paid or outstanding values among these rows.

## Formulas, payments and missing dates

- CONSOLIDATED has 1,731 outstanding formulas of the pattern `=D2-F2`, continuing through G1732, including the non-invoice rows. The cached zeros in those rows do not make them invoices.
- I2 contains the array formula `=IF(C2:C2535="","",CHOOSE(MONTH(C2:C2535),"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec")&" "&YEAR(C2:C2535))`. Cached month labels match the invoice dates for all 444 invoice rows. No formulas were found in the other two worksheets.
- 400 invoices have a numeric paid amount and a payment date. The remaining 44 have both fields blank and a positive outstanding balance. No positive recorded payment lacks a payment date. Four invoices have a positive payment smaller than their invoice value, so partial payments are represented in the amount column. A single payment amount and date per row do not establish a transaction history or prove whether multiple payments occurred.
- No explicit due-date field exists. Neither overdue nor upcoming status can be established. The data contains no update timestamp to substantiate recently updated payments.

## Dates and financial years

Invoice dates span 26/03/2026 to 30/09/2026. Of 444 dates, 443 are text and one is an Excel date. All recorded YEAR values are `2024-2025`, despite the dates. If an April–March financial year is used as a **hypothesis**, four invoices would fall in 2025–2026 and 440 in 2026–2027. All 444 therefore disagree with the stored year under that hypothesis. Confirm the intended convention and filter source; do not overwrite either value. Month values agree with invoice dates.

## Duplicate references and vendors

Within the same normalized vendor and invoice reference there are no duplicates. Two references repeat across different vendors: `234/26-27` (JAGANATHAN ASSOCIATES and SRI MADESWARA ELECTRICAL) and `44` (MCG ENTERPRISES and MONIKA PEB FABRICATION). These are review flags, not proof of duplicate invoices.

VENDORS has 181 entries and 38 recorded category labels, including ACC, STEELS, HARDWARES and ELECTRICALS. Preserve labels exactly; ACC has not been expanded. The 444 invoices use 54 distinct vendor names after trimming; 28 do not have a case-insensitive exact match in the directory. Some may be different names for the same vendor and others may be genuinely absent. Examples for human review include `AAI MATHAJI ELECTRICALS` versus `AAI MATHAJI ELECTRICALS & HARDWARE`, `SRI MADESWARA ELECTRICAL` versus `SRI MADESWARA ELECTRICAL   HARDWARES`, and `SRI SELVAGANAPATHY SANITARIES` versus `SRI SELVAGANAPATHY SANITARIES & TILES`. No names have been merged, and category totals cannot safely include unmatched names without a reviewed mapping.

Unmatched invoice names: AAI MATHAJI ELECTRICALS; AJANTHA DESIGNER TILES; AKSHAY AGRO SERVICE; C.M.CERAMIC & GLAS; Futurwud Window Systems; HINDUSTAN ELECTRICALS; LAKSHMI STEELS; M/S MATHAJI PLYWOODS; M/S VISHAL CHEM TECH; MCG ENTERPRISES; MNS ENTERPRISES; MONIKA PEB FABRICATION; PANDIT TRADER; PRAGATHI HARDWARES; RAMDEV METALS; SANTHOSH HARDWARES; SRI AMMAN READY MIX CONCRETE; SRI MADESWARA ELECTRICAL; SRI OM MURUGA ENTERPRISES; SRI SELVAGANAPATHY SANITARIES; SRI VIJAYALAKSHMI AND CO; SRI YELLAMMA DEVI TRADERS; THE COSMOS CO-OPERATIVE BANK LTD.; THE NAMAKKAL AUTO ELECTRICAL; V.P.R TRADERS; VADIVEL TRADERS; VETRI LINGA TRADERS; VIJAYLAKSHMI TRADERS.

## Sites and scope limitations

Sheet1 has seven sites: STS, DALIS SAMEER, FLEXOPACK, SELZER, HATSUN SALEM, HATSUN KOLA and HATSUN RED HILLS. Every PO number, PO date, PO value, amount received, received date and balance field is blank. No PO or receipt transactions can be inferred. CONSOLIDATED contains no site field, so none of its invoice rows can be reliably mapped to a site from this workbook. Keep payables and site PO/receipts separate.

The workbook was not modified. Formula caches were read rather than recalculated by Excel; outstanding was independently checked from the recorded invoice and paid amounts at paise precision. This audit does not validate the underlying business transactions.
