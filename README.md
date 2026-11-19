# PTS Infra dashboard

React/Vite finance dashboard backed by a Google Sheet through a Google Apps Script Web App. It reads and writes the rows in your sheet.

## Connect your sheet

1. Create a Google Spreadsheet with four tabs named `Vendors`, `Invoices`, `Sites` and `PurchaseOrders`, or let the script create them on first run. Do not point it at the historical workbook.
2. Open Apps Script (`Extensions → Apps Script`) from that spreadsheet and copy `apps-script/Code.gs`, `apps-script/Test.gs` and `apps-script/appsscript.json` into the project.
3. `Code.gs` already points at the project spreadsheet. If you switch spreadsheets, replace the value of `SPREADSHEET_ID` with the ID from its URL.
4. Deploy → New deployment → Web app. Set **Execute as: Me** and **Who has access: Anyone**, then authorize and copy the Web App URL.
5. Copy `.env.example` to `.env` and set `VITE_SHEETS_WEB_APP_URL` to that URL. Restart the dev server after changing it.
6. Copy `apps-script/VendorCatalog.gs` into the Apps Script project and run `importVendorCatalog()` once. It adds 180 vendors with their categories to the `Vendors` tab, skips names already present, and is safe to re-run. Reload the dashboard to see them.
7. Optionally set an `APP_TOKEN` script property in Apps Script (Project Settings → Script properties) and the same value in `VITE_SHEETS_APP_TOKEN`. This keeps the endpoint from being usable by anyone who finds the URL, but the value is visible in the built frontend, so do not treat it as a secret.

Amounts are stored as integer paise. Blank payment, receipt and date values stay blank rather than becoming zero. The script creates the four tabs and their headers if missing and never clears other tabs or existing rows.

## Run and verify

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

- Inside Apps Script, run `runCrudTests` and `runVendorImportTest` to check setup, read, create, update, delete, validation, blank-value handling and the vendor import against temporary spreadsheets that are trashed afterwards.
- With the Web App deployed and `.env` set, run `npm run test:sheets` to exercise the same CRUD flow over HTTP against your live sheet. Test records are created with a timestamp prefix and removed at the end.
- Reload the dashboard or open it on another device after a save: records come from the sheet, not from browser storage.

See `docs/google-sheets-integration.md` for the data layout and operational notes.
