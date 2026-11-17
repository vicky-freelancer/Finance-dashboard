# PTS Infra dashboard prototype

The prototype uses fictional invoice and vendor examples and the seven site names from the historical workbook. It stores edits only in memory, resets on refresh, and does not connect a backend. The workbook is ignored by Git.

With npm registry access, run `npm install`, then `npm run typecheck`, `npm run build`, and `npm run dev`. Dependency installation and verification were blocked in the current environment because npm is configured for offline cache-only access and the required packages are not cached.

The interface and workflows require validation before use. In particular, the financial-year display currently derives April–March years from sample invoice dates as a provisional assumption, pending approval of the business rule. Do not use the prototype as an accounting system or as a record of live balances.
