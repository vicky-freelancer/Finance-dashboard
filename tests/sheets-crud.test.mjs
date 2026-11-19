import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
    return Object.fromEntries(
      text
        .split(/\r?\n/)
        .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
        .filter(Boolean)
        .map(([, key, value]) => [key, value.replace(/^["']|["']$/g, "")]),
    );
  } catch {
    return {};
  }
}

const env = loadEnv();
const url = env.VITE_SHEETS_WEB_APP_URL;
const token = env.VITE_SHEETS_APP_TOKEN ?? "";

if (!url) {
  console.error("Set VITE_SHEETS_WEB_APP_URL in .env before running the Sheets CRUD test.");
  process.exit(1);
}

function readUrl() {
  const target = new URL(url);
  target.searchParams.set("action", "read");
  if (token) target.searchParams.set("token", token);
  return target;
}

async function json(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from the Web App, received: ${text.slice(0, 200)}`);
  }
}

async function read() {
  const result = await json(await fetch(readUrl()));
  assert.equal(result.ok, true, result.error);
  return result.data;
}

async function write(payload) {
  const result = await json(
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ ...payload, token }),
    }),
  );
  assert.equal(result.ok, payload.expectFailure === true, `unexpected result: ${result.error ?? ""}`);
  return result;
}

async function main() {
  const suffix = `${Date.now()}`;
  const site = { id: `test-site-${suffix}`, name: `Test Site ${suffix}` };
  const vendor = { id: `test-vendor-${suffix}`, name: `Test Vendor ${suffix}`, category: null };
  const invoice = {
    id: `test-invoice-${suffix}`,
    vendorName: vendor.name,
    invoiceNumber: `TEST-${suffix}`,
    invoiceDate: "2026-04-10",
    invoiceValue: 123456789,
    paidAmount: null,
    paymentDate: null,
    recordedFinancialYear: null,
  };
  const po = {
    id: `test-po-${suffix}`,
    siteId: site.id,
    poNumber: `PO-${suffix}`,
    poDate: "2026-04-11",
    value: 500000,
    amountReceived: null,
    receivedDate: null,
    balance: null,
  };

  await write({ action: "setup" });

  try {
    await write({ action: "save", entity: "sites", record: site });
    await write({ action: "save", entity: "vendors", record: vendor });
    await write({ action: "save", entity: "invoices", record: invoice });
    await write({ action: "save", entity: "purchaseOrders", record: po });

    let data = await read();
    assert.equal(data.vendors.filter((item) => item.id === vendor.id).length, 1);
    assert.equal(data.invoices.filter((item) => item.id === invoice.id).length, 1);
    assert.equal(data.sites.filter((item) => item.id === site.id).length, 1);
    assert.equal(data.purchaseOrders.filter((item) => item.id === po.id).length, 1);
    assert.equal(data.invoices.find((item) => item.id === invoice.id).invoiceValue, 123456789);
    assert.equal(data.invoices.find((item) => item.id === invoice.id).paidAmount, null);

    await write({ action: "save", entity: "invoices", record: { ...invoice, paidAmount: 100, paymentDate: "2026-04-20" } });

    data = await read();
    const saved = data.invoices.find((item) => item.id === invoice.id);
    assert.equal(saved.paidAmount, 100);
    assert.equal(saved.paymentDate, "2026-04-20");
    assert.equal(saved.invoiceValue, 123456789);

    await write({ action: "save", entity: "vendors", record: { ...vendor, id: `duplicate-${suffix}` }, expectFailure: true });
    await write({ action: "delete", entity: "vendors", id: vendor.id, expectFailure: true });

    console.log("Sheets CRUD test passed: setup, read, create, update, validation and null handling.");
  } finally {
    for (const [entity, id] of [
      ["purchaseOrders", po.id],
      ["invoices", invoice.id],
      ["vendors", vendor.id],
      ["sites", site.id],
    ]) {
      try {
        await write({ action: "delete", entity, id });
      } catch (error) {
        console.error(`Cleanup failed for ${entity} ${id}: ${error.message}`);
      }
    }
  }

  const data = await read();
  const leftovers = [data.vendors, data.invoices, data.sites, data.purchaseOrders]
    .flat()
    .filter((item) => item.id.endsWith(suffix));
  assert.equal(leftovers.length, 0, `leftover test records: ${JSON.stringify(leftovers)}`);
  console.log("Sheets CRUD test passed: delete and cleanup.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
