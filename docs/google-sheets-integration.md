# Google Sheets integration plan

Status: awaiting the destination spreadsheet and a decision on historical import. The existing frontend remains a mock and does not save to Google Sheets yet. Do not use the historical workbook as a live database or modify it.

## Intended behavior

Use a Google Sheet as the live source for invoices, vendors, sites and purchase orders. Keep the existing typed accounting service boundary; successful create, update and delete operations must be confirmed by the sheet before reporting success. Reloading or signing in from another device should retrieve saved records. Clearly expose connection errors and never substitute sample values when the live sheet is selected.

Use authenticated access tied to the user's Google account and the spreadsheet's sharing permissions. Do not embed service-account private keys or shared write secrets in frontend code. The integration requires suitable Google Cloud/OAuth configuration and authorized origins, or a separately secured backend. Spreadsheet access and deployment configuration must be set up before end-to-end testing.

## Data design for review

Store stable IDs for records. Preserve original invoice values, recorded year/month and dates where historical records are imported; do not silently normalize or merge vendors. Amounts require exact paise arithmetic. Missing payments, receipt values and due dates remain distinguishable from zero. Invoice, vendor, site and purchase-order records should have clearly documented columns and relationships; historical import needs a reviewed mapping because vendor names mismatch and stored financial years conflict with invoice dates.

The original Sheet1 has one row per site and mostly blank PO columns. A live PO register must support multiple POs per site without overwriting site records. Decide whether to create separate app-managed tabs in a new spreadsheet or map to existing tabs after inspecting the actual target. Preserve existing formulas, formatting and data; never clear or overwrite unrecognized content.

## Reliability and testing

- Protect against duplicate submissions, partial saves and conflicting simultaneous edits; Sheets is not a transactional database. Surface conflicts and failures rather than reporting unsaved changes as saved.
- Confirm deletion and prevent breaking vendor/invoice or site/PO links. Add a reviewable change history and a backup/restore process before relying on the sheet for accounting.
- Restrict sharing, verify each user's access, avoid public unauthenticated write endpoints, and handle expired sign-in sessions.
- Test reads, create/edit/delete, reload, two-device access, authorization denial, network failure, concurrent edits, blank values, totals and preservation of existing sheet content using non-production test data first.
- Document that access, Google service availability and quotas affect live operations.

## Required information

1. Google Sheet URL and whether a new empty spreadsheet or existing populated spreadsheet is intended.
2. Whether historical workbook records should be imported after review, or live records should start empty.
3. Who will use the dashboard and whether they will sign in using individual Google accounts.
4. Who can configure the Google Cloud project and approved application origins, if browser-based Google authentication is selected.
