/** Currency is represented as integer paise, never floating-point rupees. */
export type Paise = number;
export interface Vendor { id: string; name: string; category: string | null }
export interface Invoice { id: string; vendorName: string; invoiceNumber: string; invoiceDate: string; invoiceValue: Paise; paidAmount: Paise | null; paymentDate: string | null; recordedFinancialYear: string | null }
export interface Site { id: string; name: string }
export interface PurchaseOrder { id: string; siteId: string; poNumber: string | null; poDate: string | null; value: Paise | null; amountReceived: Paise | null; receivedDate: string | null; balance: Paise | null }
