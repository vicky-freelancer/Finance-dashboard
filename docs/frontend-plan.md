# Frontend plan

Status: Phase 1 proposal, awaiting approval. The workbook is historical reference data; its totals must not be presented as current live balances. The client will update live records later. Backend choice and real-data storage remain undecided.

## Modules

1. Dashboard: clearly labelled historical or live context, supported invoice, paid, outstanding, pending-invoice, vendor and site KPIs, vendor payment summary, monthly trends, paid-versus-outstanding, top outstanding vendors, recent invoice dates and financial-year filter once its rule is agreed.
2. Vendor bills: searchable and filterable mobile cards and desktop table, detail, validated forms, duplicate warning and deletion confirmation.
3. Payments and outstanding: paid, partial, unpaid and outstanding views. A payment-history feature needs separate approval; preserve blanks.
4. Payment alerts: outstanding and high-value balances. Due alerts only for supplied due dates; recently updated payments only when an actual update timestamp exists.
5. Vendors: original names and categories, a human-review workflow for unmatched names, invoice history and financial summaries. Keep unmatched values visible in category reports.
6. Sites and purchase orders: the seven recorded sites, PO register and future entry forms. Historical PO fields are all blank, displayed as “Not Recorded”. Do not infer site allocations, revenue or profit.
7. Reports: vendor, outstanding, monthly, financial-year, category and site PO reports where data supports them, with filters and CSV export. Reconcile totals and show exclusions.

## Design and architecture

Use the user's `SKILLs designer.md` as visual design inspiration where relevant: a cohesive, intentional visual direction, restrained accents, clear hierarchy and polished mobile experience. Its cinematic marketing-site workflow, paid external tools and deployment steps do not govern this accountant dashboard, whose explicitly requested stack and approval gates take precedence. Use deep navy navigation, white and light-gray surfaces, electric blue actions, meaningful green, amber and red, clear typography and subtle motion. Prioritize mobile cards, bottom navigation, readable amounts, searchable selectors, touch targets, responsive forms, sticky actions and filter drawers; provide a collapsible desktop sidebar and tables.

Use React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, React Router, Recharts, React Hook Form, Zod and date-fns with free open-source dependencies. Separate typed models, precise financial calculations and `src/services/accountingService.ts` from UI. Use clearly labelled mock data unless local workbook use is approved. No database, live connection, persistent real-data browser storage or deployment is authorized by this phase. Format Indian currency and dates as DD/MM/YYYY.

After approval, test calculations, source reconciliation, missing and duplicate data, filters, forms, navigation and representative mobile and desktop widths; run TypeScript checks and a production build. No application implementation or tests have been performed yet.
