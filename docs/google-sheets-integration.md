# Google Sheets integration

The dashboard reads and writes Google Sheets through the Apps Script Web App in `apps-script/`. The sheet is the only source of records and there is no browser-side persistence. Reloading fetches the sheet again.

## Setup

1. Create a dedicated spreadsheet. Do not use the historical workbook as the live database.
2. Copy `apps-script/Code.gs`, `apps-script/Test.gs` and `apps-script/appsscript.json` into the spreadsheet's Apps Script project.
3. `Code.gs` already contains the project spreadsheet ID. Replace `SPREADSHEET_ID` if you use a different spreadsheet.
4. Deploy as a Web App with **Execute as: Me** and **Who has access: Anyone**. Authorize the script for the spreadsheet.
5. Set `VITE_SHEETS_WEB_APP_URL` in `.env` to the Web App URL. Optionally set `VITE_SHEETS_APP_TOKEN` together with an `APP_TOKEN` script property.

Deployment as "Me" means all users of this dashboard share the sheet and the deployer's quota. The URL (and optional token) grants write access, so keep both out of public repositories and use HTTPS. The token is embedded in the frontend bundle and is a deterrent, not real authentication; for multi-user or sensitive deployments use a secured backend with per-user Google sign-in instead.

## Data layout

| Tab | Columns |
| --- | --- |
| `Vendors` | `id`, `name`, `category` |
| `Invoices` | `id`, `vendorName`, `invoiceNumber`, `invoiceDate`, `invoiceValue`, `paidAmount`, `paymentDate`, `recordedFinancialYear` |
| `Sites` | `id`, `name` |
| `PurchaseOrders` | `id`, `siteId`, `poNumber`, `poDate`, `value`, `amountReceived`, `receivedDate`, `balance` |

Header names are matched by column name, so columns can be reordered. Rows without an `id` are ignored. Money columns are integer paise; blank payment and receipt values remain blank. The script creates missing tabs and headers, freezes the header row and formats text columns as plain text. It never deletes unrecognized tabs or content.

## Vendor catalog import

`apps-script/VendorCatalog.gs` contains the 180 vendor names and categories supplied for this project. Run `importVendorCatalog()` once in Apps Script after connecting the spreadsheet. It creates IDs, collapses repeated whitespace in names, skips vendors whose names already exist (case-insensitive), and leaves existing categories untouched. Re-running it adds nothing. The two differently-cased entries for `SRI BALAJI TRADERS` are consolidated into one record.

## API

- `GET ?action=read` returns `{ ok: true, data: { vendors, invoices, sites, purchaseOrders } }`.
- `POST` with `action: "save"` and `entity` plus `record`, or `action: "delete"` with `entity` plus `id`, writes to the sheet.
- `POST` with `action: "setup"` creates missing tabs.
- `?action=ping` reports whether a spreadsheet ID is configured.
- Errors return `{ ok: false, error: "..." }` and are shown in the dashboard instead of being silently ignored.

Writes use `LockService` to reduce concurrent-edit conflicts, and the sheet is the source of truth for validation such as duplicate vendor names and links between vendors/invoices and sites/purchase orders.

## Testing

- `runCrudTests` in Apps Script uses a temporary spreadsheet, verifies setup, reads, creates, updates, deletes, duplicate/referential validation and blank-value handling, then trashes the temporary spreadsheet.
- `npm run test:sheets` performs the same flow over HTTP using the deployed Web App and `.env`, then removes its timestamp-prefixed records. Run it against a test spreadsheet first.
- `npm run typecheck` and `npm run build` verify the frontend.

## Operational notes

Google availability, Apps Script quotas and sheet sharing affect live operations. Keep a backup of the spreadsheet, review bulk edits before import, and confirm deletion prompts, since deletes remove rows immediately. Due dates are not part of the model, so "unpaid" does not mean "overdue".
