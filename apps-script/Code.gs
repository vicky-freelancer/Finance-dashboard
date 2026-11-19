const SPREADSHEET_ID = "1nUDs_Bwzwj-0yg2QiBN-k4X3h1SoTUKFebxSkZJP9vk";
var OVERRIDE_SPREADSHEET_ID = null;

const NUMERIC_FIELDS = ["invoiceValue", "paidAmount", "value", "amountReceived", "balance"];
const NULLABLE_TEXT_FIELDS = ["category", "paymentDate", "recordedFinancialYear", "poNumber", "poDate", "receivedDate"];

const TABLES = {
  vendors: {
    sheet: "Vendors",
    headers: ["id", "name", "category"],
    text: ["id", "name", "category"],
  },
  invoices: {
    sheet: "Invoices",
    headers: ["id", "vendorName", "invoiceNumber", "invoiceDate", "invoiceValue", "paidAmount", "paymentDate", "recordedFinancialYear"],
    text: ["id", "vendorName", "invoiceNumber", "invoiceDate", "paymentDate", "recordedFinancialYear"],
  },
  sites: {
    sheet: "Sites",
    headers: ["id", "name"],
    text: ["id", "name"],
  },
  purchaseOrders: {
    sheet: "PurchaseOrders",
    headers: ["id", "siteId", "poNumber", "poDate", "value", "amountReceived", "receivedDate", "balance"],
    text: ["id", "siteId", "poNumber", "poDate", "receivedDate"],
  },
};

function doGet(e) {
  return reply(function () {
    assertAuthorized(e && e.parameter ? e.parameter.token : "");
    const action = e && e.parameter ? e.parameter.action : "read";
    if (action === "ping") {
      return { service: "pts-infra-accounting", version: 1, spreadsheetConfigured: isSpreadsheetConfigured() };
    }
    if (action === "read") {
      const ss = ensureSetup();
      return readAll(ss);
    }
    throw new Error("Unsupported read action: " + action);
  });
}

function doPost(e) {
  return reply(function () {
    const raw = e && e.postData ? e.postData.contents : "";
    let payload;
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch (error) {
      throw new Error("Request body must be valid JSON.");
    }
    assertAuthorized(payload.token || (e && e.parameter ? e.parameter.token : ""));

    const action = payload.action;
    if (action === "setup") {
      ensureSetup();
      return { setup: true };
    }
    if (action !== "save" && action !== "delete") {
      throw new Error("Unsupported write action: " + String(action));
    }
    if (!TABLES[payload.entity]) {
      throw new Error("Unknown entity: " + String(payload.entity));
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const ss = ensureSetup();
      if (action === "save") {
        const record = normalizeRecord(payload.entity, payload.record);
        validateSave(ss, payload.entity, record);
        writeRecord(ss, payload.entity, record);
        return { record: record };
      }
      const id = String(payload.id || "");
      if (!id) throw new Error("A record id is required for deletion.");
      validateDelete(ss, payload.entity, id);
      deleteRecord(ss, payload.entity, id);
      return { deleted: id };
    } finally {
      lock.releaseLock();
    }
  });
}

function reply(handler) {
  try {
    const result = handler();
    return output({ ok: true, data: result === undefined ? null : result });
  } catch (error) {
    return output({ ok: false, error: error && error.message ? error.message : String(error) });
  }
}

function output(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function assertAuthorized(token) {
  const expected = PropertiesService.getScriptProperties().getProperty("APP_TOKEN");
  if (expected && String(token || "") !== expected) {
    throw new Error("Access denied. Check the app token in the dashboard settings.");
  }
}

function getSpreadsheetId() {
  return OVERRIDE_SPREADSHEET_ID || SPREADSHEET_ID;
}

function isSpreadsheetConfigured() {
  const id = String(getSpreadsheetId() || "");
  return id.length > 0 && id.indexOf("PASTE_") !== 0;
}

function ensureSetup() {
  if (!isSpreadsheetConfigured()) {
    throw new Error("Set a valid SPREADSHEET_ID in apps-script/Code.gs, then redeploy the Web App.");
  }
  const ss = SpreadsheetApp.openById(getSpreadsheetId());
  Object.keys(TABLES).forEach(function (entity) {
    setupSheet(ss, TABLES[entity]);
  });
  return ss;
}

function setupSheet(ss, table) {
  let sheet = ss.getSheetByName(table.sheet);
  if (!sheet) sheet = ss.insertSheet(table.sheet);
  const lastColumn = table.headers.length;
  const current = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  const matches = table.headers.every(function (header, index) {
    return String(current[index] || "").trim() === header;
  });
  if (!matches || sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, lastColumn).setValues([table.headers]);
  }
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, lastColumn).setFontWeight("bold");
  table.text.forEach(function (field) {
    const column = table.headers.indexOf(field) + 1;
    sheet.getRange(2, column, Math.max(sheet.getMaxRows() - 1, 1), 1).setNumberFormat("@");
  });
  return sheet;
}

function getSheet(ss, entity) {
  const sheet = ss.getSheetByName(TABLES[entity].sheet);
  if (!sheet) throw new Error("The " + TABLES[entity].sheet + " tab is missing.");
  return sheet;
}

function headerIndex(ss, entity) {
  const table = TABLES[entity];
  const sheet = getSheet(ss, entity);
  const headers = sheet.getRange(1, 1, 1, table.headers.length).getValues()[0].map(function (value) {
    return String(value || "").trim();
  });
  const index = {};
  table.headers.forEach(function (header) {
    index[header] = headers.indexOf(header);
  });
  if (Object.keys(index).some(function (key) { return index[key] < 0; })) {
    throw new Error("The " + table.sheet + " tab is missing required columns.");
  }
  return { sheet: sheet, index: index };
}

function readAll(ss) {
  return {
    vendors: readTable(ss, "vendors"),
    invoices: readTable(ss, "invoices"),
    sites: readTable(ss, "sites"),
    purchaseOrders: readTable(ss, "purchaseOrders"),
  };
}

function readTable(ss, entity) {
  const table = TABLES[entity];
  const meta = headerIndex(ss, entity);
  const values = meta.sheet.getDataRange().getValues();
  const rows = [];
  for (let r = 1; r < values.length; r += 1) {
    const raw = values[r];
    const id = cell(raw, meta.index.id);
    if (!id) continue;
    const record = {};
    table.headers.forEach(function (header) {
      record[header] = normalizeValue(ss, header, cell(raw, meta.index[header]));
    });
    rows.push(record);
  }
  return rows;
}

function cell(row, index) {
  return index < 0 ? "" : row[index];
}

function normalizeValue(ss, header, value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, ss.getSpreadsheetTimeZone(), "yyyy-MM-dd");
  }
  if (NUMERIC_FIELDS.indexOf(header) >= 0) {
    return value === "" || value === null || value === undefined ? null : Number(value);
  }
  const text = value === null || value === undefined ? "" : String(value).trim();
  return NULLABLE_TEXT_FIELDS.indexOf(header) >= 0 ? text || null : text;
}

function serializeValue(header, value) {
  if (value === null || value === undefined) return "";
  return NUMERIC_FIELDS.indexOf(header) >= 0 ? Number(value) : String(value);
}

function normalizeRecord(entity, input) {
  const table = TABLES[entity];
  if (!input || typeof input !== "object") throw new Error("A record is required.");
  const id = String(input.id || "").trim();
  if (!id) throw new Error("A record id is required.");
  const record = { id: id };
  table.headers.forEach(function (header) {
    if (header !== "id") record[header] = input[header] === undefined ? null : input[header];
  });
  return record;
}

function validateSave(ss, entity, record) {
  const data = readAll(ss);
  if (entity === "vendors") {
    const name = String(record.name || "").trim();
    if (!name) throw new Error("Enter a vendor name.");
    const previous = data.vendors.find(function (vendor) { return vendor.id === record.id; });
    if (data.vendors.some(function (vendor) { return vendor.id !== record.id && vendor.name.toLowerCase() === name.toLowerCase(); })) {
      throw new Error("A vendor with this name already exists.");
    }
    if (previous && previous.name !== name && data.invoices.some(function (invoice) { return invoice.vendorName === previous.name; })) {
      throw new Error("This vendor has invoices. Its name cannot be changed until those invoices are reviewed.");
    }
  }
  if (entity === "sites") {
    const name = String(record.name || "").trim();
    if (!name) throw new Error("Enter a site name.");
    if (data.sites.some(function (site) { return site.id !== record.id && site.name.toLowerCase() === name.toLowerCase(); })) {
      throw new Error("A site with this name already exists.");
    }
  }
  if (entity === "invoices") {
    if (!String(record.vendorName || "").trim()) throw new Error("Choose a vendor.");
    if (!String(record.invoiceNumber || "").trim()) throw new Error("Enter an invoice number.");
    if (!String(record.invoiceDate || "").trim()) throw new Error("Choose an invoice date.");
  }
  if (entity === "purchaseOrders") {
    if (!String(record.siteId || "").trim()) throw new Error("A site is required.");
    if (!data.sites.some(function (site) { return site.id === record.siteId; })) {
      throw new Error("This site no longer exists. Refresh and try again.");
    }
  }
}

function validateDelete(ss, entity, id) {
  const data = readAll(ss);
  if (entity === "vendors") {
    const vendor = data.vendors.find(function (item) { return item.id === id; });
    if (vendor && data.invoices.some(function (invoice) { return invoice.vendorName === vendor.name; })) {
      throw new Error("This vendor has invoices. Remove or reassign them before deleting the vendor.");
    }
  }
  if (entity === "sites") {
    if (data.purchaseOrders.some(function (po) { return po.siteId === id; })) {
      throw new Error("This site has purchase orders. Delete those orders before deleting the site.");
    }
  }
}

function writeRecord(ss, entity, record) {
  const table = TABLES[entity];
  const meta = headerIndex(ss, entity);
  const values = meta.sheet.getDataRange().getValues();
  let rowNumber = -1;
  for (let r = 1; r < values.length; r += 1) {
    if (String(cell(values[r], meta.index.id)) === record.id) {
      rowNumber = r + 1;
      break;
    }
  }
  const row = table.headers.map(function (header) { return serializeValue(header, record[header]); });
  if (rowNumber > 0) {
    meta.sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  } else {
    meta.sheet.appendRow(row);
  }
}

function deleteRecord(ss, entity, id) {
  const meta = headerIndex(ss, entity);
  const values = meta.sheet.getDataRange().getValues();
  for (let r = values.length - 1; r >= 1; r -= 1) {
    if (String(cell(values[r], meta.index.id)) === id) {
      meta.sheet.deleteRow(r + 1);
    }
  }
}
