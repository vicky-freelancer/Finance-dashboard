import { SHEETS_APP_TOKEN, SHEETS_WEB_APP_URL, isSheetsConfigured } from "@/config";
import type { Invoice, PurchaseOrder, Site, Vendor } from "@/types/accounting";

export interface AccountingData {
  vendors: Vendor[];
  invoices: Invoice[];
  sites: Site[];
  purchaseOrders: PurchaseOrder[];
}

export interface AccountingService {
  readAll(): Promise<AccountingData>;
  saveInvoice(invoice: Invoice): Promise<void>;
  deleteInvoice(id: string): Promise<void>;
  savePurchaseOrder(po: PurchaseOrder): Promise<void>;
  deletePurchaseOrder(id: string): Promise<void>;
  saveVendor(vendor: Vendor): Promise<void>;
  deleteVendor(id: string): Promise<void>;
  saveSite(site: Site): Promise<void>;
  deleteSite(id: string): Promise<void>;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function endpoint(): URL {
  if (!isSheetsConfigured) {
    throw new Error("Google Sheets is not connected. Add VITE_SHEETS_WEB_APP_URL to .env, then restart the dev server.");
  }
  try {
    return new URL(SHEETS_WEB_APP_URL);
  } catch {
    throw new Error("VITE_SHEETS_WEB_APP_URL is not a valid URL.");
  }
}

async function parse(response: Response): Promise<ApiResponse<unknown>> {
  const text = await response.text();
  try {
    return JSON.parse(text) as ApiResponse<unknown>;
  } catch {
    throw new Error("Google Sheets returned a sign-in page or HTML instead of data. Publish the Web App with access set to 'Anyone' and redeploy.");
  }
}

async function read<T>(action: string): Promise<T> {
  const url = endpoint();
  url.searchParams.set("action", action);
  if (SHEETS_APP_TOKEN) url.searchParams.set("token", SHEETS_APP_TOKEN);

  let response: Response;
  try {
    response = await fetch(url, { method: "GET", credentials: "omit" });
  } catch {
    throw new Error("Could not reach Google Sheets. Check the Web App URL and your internet connection.");
  }

  const result = await parse(response);
  if (!result.ok || result.data === undefined) throw new Error(result.error ?? "Google Sheets did not return any data.");
  return result.data as T;
}

async function write(payload: Record<string, unknown>): Promise<void> {
  const url = endpoint();
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ ...payload, token: SHEETS_APP_TOKEN }),
    });
  } catch {
    throw new Error("Could not reach Google Sheets. Check the Web App URL and your internet connection.");
  }

  const result = await parse(response);
  if (!result.ok) throw new Error(result.error ?? "Google Sheets rejected this change.");
}

export const accountingService: AccountingService = {
  readAll() {
    return read<AccountingData>("read");
  },
  saveInvoice(invoice) {
    return write({ action: "save", entity: "invoices", record: invoice });
  },
  deleteInvoice(id) {
    return write({ action: "delete", entity: "invoices", id });
  },
  savePurchaseOrder(po) {
    return write({ action: "save", entity: "purchaseOrders", record: po });
  },
  deletePurchaseOrder(id) {
    return write({ action: "delete", entity: "purchaseOrders", id });
  },
  saveVendor(vendor) {
    return write({ action: "save", entity: "vendors", record: vendor });
  },
  deleteVendor(id) {
    return write({ action: "delete", entity: "vendors", id });
  },
  saveSite(site) {
    return write({ action: "save", entity: "sites", record: site });
  },
  deleteSite(id) {
    return write({ action: "delete", entity: "sites", id });
  },
};
