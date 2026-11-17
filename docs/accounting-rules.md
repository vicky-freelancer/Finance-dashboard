# Accounting rules

Status: proposed for review. The workbook holds historical reference records, not verified current balances. The client plans to update live records later; the storage and import approach remain undecided.

## Supported observations and proposed treatment

- Preserve imported source values, dates, vendor names, categories and formulas or traceable references. Show reconciliation differences rather than silently correcting them. Exclude year-only rows from invoice counts; agree on rules for incomplete future records.
- The workbook uses invoice value minus paid amount for outstanding. For prototype calculations use precise paise arithmetic. Keep a blank payment distinct from a recorded zero even if it is treated as zero in a clearly labelled calculation. Four records show partial payments, but one payment date and amount per row do not establish multiple-payment history. Propose a payment-history feature for approval, not as an existing rule.
- Recorded year `2024-2025` conflicts with every invoice date under an April–March interpretation. Retain both source and derived values and agree which controls filters and reports.
- Flag repeated invoice references for review in vendor context; references can repeat across different vendors. Do not automatically merge vendor names or assign categories to unmatched vendors.
- Unpaid is not overdue. Without explicit due dates use “Outstanding — Due Date Unknown”. A proposed due-date field and any payment terms need approval. Recent-update alerts require actual update timestamps.
- Keep vendor payables separate from site PO and receipts. Do not associate invoices with sites without a valid mapping. Show missing PO amounts as “Not Recorded”, not zero. Do not calculate unsupported site revenue or profit.
- Proposed new entries should validate currency, reject negative amounts pending approval of rules for credits and adjustments, and avoid binary floating-point errors. Imported exceptions must be preserved and disclosed.
- Historical financial data must not be hardcoded into public source or persistently stored in a browser without explicit approval. No backend or database is selected or connected.

## Open questions

1. Should FY filters use an April–March convention derived from invoice dates, the stored YEAR, or both? Why is every stored year 2024–2025?
2. Is blank paid amount equivalent to zero for operational totals? How should missing payment dates, credits, advances, deductions and rounding be handled?
3. Should multiple payments be recorded as a history? Does the existing amount represent a cumulative total and the date the most recent payment?
4. Which unmatched vendor names correspond to directory entries? Who approves mappings, and is there a stable vendor identifier?
5. What defines a duplicate invoice: vendor plus reference, or another combination? How should incomplete records be handled?
6. Will due dates be entered individually or derived from approved payment terms? Which date governs any alert?
7. Is there a reliable invoice-to-site mapping? What do the PO and receipt fields represent operationally?
8. How will the client supply and maintain live records, and may historical workbook data be used locally for the prototype? What access, retention and storage rules apply?
