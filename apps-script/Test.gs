function runCrudTests() {
  const properties = PropertiesService.getScriptProperties();
  const previousToken = properties.getProperty("APP_TOKEN");
  const previousOverride = OVERRIDE_SPREADSHEET_ID;
  const testSheet = SpreadsheetApp.create("Dashboard AC CRUD test " + new Date().toISOString());
  const checks = [];

  OVERRIDE_SPREADSHEET_ID = testSheet.getId();
  properties.deleteProperty("APP_TOKEN");

  try {
    expect(response({ action: "setup" }).data.setup === true, "setup creates the tabs");

    const empty = read().data;
    expect(empty.vendors.length === 0 && empty.invoices.length === 0 && empty.sites.length === 0 && empty.purchaseOrders.length === 0, "a new sheet starts empty");

    const site = { id: "test-site", name: "Test Site" };
    const vendor = { id: "test-vendor", name: "Test Vendor", category: null };
    const invoice = {
      id: "test-invoice", vendorName: vendor.name, invoiceNumber: "T-001", invoiceDate: "2026-04-10",
      invoiceValue: 123456789, paidAmount: null, paymentDate: null, recordedFinancialYear: null,
    };
    const po = {
      id: "test-po", siteId: site.id, poNumber: "PO-001", poDate: "2026-04-11", value: 500000,
      amountReceived: null, receivedDate: null, balance: null,
    };

    write("site", "save", site);
    write("vendor", "save", vendor);
    write("invoice", "save", invoice);
    write("purchaseOrder", "save", po);

    let data = read().data;
    expect(data.vendors.length === 1 && data.invoices.length === 1 && data.sites.length === 1 && data.purchaseOrders.length === 1, "save creates one record per table");
    expect(data.invoices[0].invoiceValue === 123456789, "paise amounts are stored exactly");
    expect(data.invoices[0].paidAmount === null && data.purchaseOrders[0].amountReceived === null, "blank amounts stay distinct from zero");

    const updated = Object.assign({}, invoice, { paidAmount: 100, paymentDate: "2026-04-20" });
    write("invoice", "save", updated);

    data = read().data;
    expect(data.invoices.length === 1 && data.invoices[0].paidAmount === 100 && data.invoices[0].paymentDate === "2026-04-20", "save updates an existing record by id");
    expect(data.invoices[0].invoiceDate === "2026-04-10", "updating a record does not change other fields");

    const duplicate = response({ action: "save", entity: "vendor", record: { id: "other-vendor", name: "test vendor", category: null } });
    expect(duplicate.ok === false, "duplicate vendor names are rejected");
    const linkedDelete = response({ action: "delete", entity: "vendor", id: vendor.id });
    expect(linkedDelete.ok === false, "a vendor with invoices cannot be deleted");

    write("purchaseOrder", "delete", null, po.id);
    write("invoice", "delete", null, invoice.id);
    write("vendor", "delete", null, vendor.id);
    write("site", "delete", null, site.id);

    data = read().data;
    expect(data.vendors.length === 0 && data.invoices.length === 0 && data.sites.length === 0 && data.purchaseOrders.length === 0, "delete removes records from every table");

    checks.push("setup, read, create, update, delete, validation and empty-state checks passed");
  } finally {
    OVERRIDE_SPREADSHEET_ID = previousOverride;
    if (previousToken) properties.setProperty("APP_TOKEN", previousToken);
    DriveApp.getFileById(testSheet.getId()).setTrashed(true);
  }

  return checks.join("\n");
}

function runVendorImportTest() {
  const previousOverride = OVERRIDE_SPREADSHEET_ID;
  const testSheet = SpreadsheetApp.create("Dashboard AC vendor import test " + new Date().toISOString());
  OVERRIDE_SPREADSHEET_ID = testSheet.getId();
  try {
    const first = importVendorCatalog();
    expect(first.inserted === VENDOR_CATALOG.length, "import inserts every catalog entry");
    const second = importVendorCatalog();
    expect(second.inserted === 0 && second.existing === VENDOR_CATALOG.length, "re-running the import skips existing vendors");
    const vendors = read().data.vendors;
    expect(vendors.length === VENDOR_CATALOG.length, "the catalog has no duplicate names");
    expect(vendors.some(function (vendor) { return vendor.name === "AAI MATHAJI ELECTRICALS & HARDWARE" && vendor.category === "ELECTRICALS"; }), "name and category are imported");
    return "Vendor catalog import test passed: " + vendors.length + " vendors.";
  } finally {
    OVERRIDE_SPREADSHEET_ID = previousOverride;
    DriveApp.getFileById(testSheet.getId()).setTrashed(true);
  }
}

function response(payload) {
  return JSON.parse(doPost({ postData: { contents: JSON.stringify(payload) }, parameter: {} }).getContent());
}

function read() {
  return JSON.parse(doGet({ parameter: { action: "read" } }).getContent());
}

function write(entity, action, record, id) {
  const payload = { action: action, entity: entity };
  if (record) payload.record = record;
  if (id) payload.id = id;
  const result = response(payload);
  expect(result.ok === true, action + " " + entity + " succeeded: " + (result.error || ""));
  return result;
}

function expect(condition, message) {
  if (!condition) throw new Error("CRUD test failed: " + message);
}
