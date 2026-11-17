import type { Invoice, PurchaseOrder, Site, Vendor } from "@/types/accounting";

/** Sample records are fictitious, live only in memory, and reset on refresh. */
let vendors: Vendor[] = [
  { id: "v1", name: "Sample Steel Supplier", category: "STEELS" },
  { id: "v2", name: "Sample Electrical Supplier", category: "ELECTRICALS" },
  { id: "v3", name: "Sample Hardware Supplier", category: "HARDWARES" },
];
let invoices: Invoice[] = [
  { id: "i1", vendorName: vendors[0].name, invoiceNumber: "DEMO-101", invoiceDate: "2026-08-12", invoiceValue: 24500000, paidAmount: 14500000, paymentDate: "2026-08-20", recordedFinancialYear: null },
  { id: "i2", vendorName: vendors[1].name, invoiceNumber: "DEMO-102", invoiceDate: "2026-09-05", invoiceValue: 8200000, paidAmount: null, paymentDate: null, recordedFinancialYear: null },
  { id: "i3", vendorName: vendors[2].name, invoiceNumber: "DEMO-103", invoiceDate: "2026-09-19", invoiceValue: 5600000, paidAmount: 5600000, paymentDate: "2026-09-24", recordedFinancialYear: null },
];
let sites: Site[] = ["STS", "DALIS SAMEER", "FLEXOPACK", "SELZER", "HATSUN SALEM", "HATSUN KOLA", "HATSUN RED HILLS"].map((name, index) => ({ id: `s${index + 1}`, name }));
let purchaseOrders: PurchaseOrder[] = [];
export interface AccountingService {
  listInvoices(): Promise<Invoice[]>; listVendors(): Promise<Vendor[]>; listSites(): Promise<Site[]>; listPurchaseOrders(): Promise<PurchaseOrder[]>;
  saveInvoice(invoice: Invoice): Promise<void>; deleteInvoice(id: string): Promise<void>; savePurchaseOrder(po: PurchaseOrder): Promise<void>; deletePurchaseOrder(id: string): Promise<void>;
  saveVendor(vendor: Vendor): Promise<void>; deleteVendor(id: string): Promise<void>; saveSite(site: Site): Promise<void>; deleteSite(id: string): Promise<void>;
}
export const accountingService: AccountingService = {
  async listInvoices() { return structuredClone(invoices); }, async listVendors() { return structuredClone(vendors); },
  async listSites() { return structuredClone(sites); }, async listPurchaseOrders() { return structuredClone(purchaseOrders); },
  async saveInvoice(invoice) { invoices = [...invoices.filter((item) => item.id !== invoice.id), structuredClone(invoice)]; },
  async deleteInvoice(id) { invoices = invoices.filter((item) => item.id !== id); },
  async saveVendor(vendor) {
    const previous = vendors.find(v => v.id === vendor.id);
    if (vendors.some(v => v.id !== vendor.id && v.name.trim().toLowerCase() === vendor.name.trim().toLowerCase())) throw new Error("A vendor with this name already exists.");
    if (previous && previous.name !== vendor.name && invoices.some(i => i.vendorName === previous.name)) throw new Error("This vendor has invoices. Its name cannot be changed until those invoices are reviewed.");
    vendors = [...vendors.filter(v => v.id !== vendor.id), structuredClone(vendor)];
  },
  async deleteVendor(id) {
    const vendor = vendors.find(v => v.id === id);
    if (vendor && invoices.some(i => i.vendorName === vendor.name)) throw new Error("This vendor has invoices. Remove or reassign them before deleting the vendor.");
    vendors = vendors.filter(v => v.id !== id);
  },
  async saveSite(site) {
    if (sites.some(s => s.id !== site.id && s.name.trim().toLowerCase() === site.name.trim().toLowerCase())) throw new Error("A site with this name already exists.");
    sites = [...sites.filter(s => s.id !== site.id), structuredClone(site)];
  },
  async deleteSite(id) {
    if (purchaseOrders.some(p => p.siteId === id)) throw new Error("This site has purchase orders. Delete those orders before deleting the site.");
    sites = sites.filter(s => s.id !== id);
  },
  async deletePurchaseOrder(id) { purchaseOrders = purchaseOrders.filter(p => p.id !== id); },
  async savePurchaseOrder(po) { purchaseOrders = [...purchaseOrders.filter((item) => item.id !== po.id), structuredClone(po)]; },
};
