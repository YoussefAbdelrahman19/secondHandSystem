// src/infrastructure/database/mongodb/schemas/FinancialSchema.ts
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Enums
export enum InvoiceType {
  PURCHASE = 'PURCHASE',
  SALES = 'SALES',
  CREDIT_NOTE = 'CREDIT_NOTE',
  DEBIT_NOTE = 'DEBIT_NOTE',
  PROFORMA = 'PROFORMA'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum ExpenseCategory {
  // Fixed Costs
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  INSURANCE = 'INSURANCE',
  LICENSES = 'LICENSES',
  
  // Variable Costs
  INVENTORY_PURCHASE = 'INVENTORY_PURCHASE',
  SHIPPING_INBOUND = 'SHIPPING_INBOUND',
  SHIPPING_OUTBOUND = 'SHIPPING_OUTBOUND',
  CUSTOMS_DUTIES = 'CUSTOMS_DUTIES',
  PACKAGING = 'PACKAGING',
  
  // Personnel
  SALARIES = 'SALARIES',
  WAGES = 'WAGES',
  BONUSES = 'BONUSES',
  SOCIAL_SECURITY = 'SOCIAL_SECURITY',
  EMPLOYEE_BENEFITS = 'EMPLOYEE_BENEFITS',
  
  // Operations
  WAREHOUSE_SUPPLIES = 'WAREHOUSE_SUPPLIES',
  EQUIPMENT = 'EQUIPMENT',
  MAINTENANCE = 'MAINTENANCE',
  FUEL = 'FUEL',
  
  // Marketing
  ADVERTISING = 'ADVERTISING',
  MARKETING = 'MARKETING',
  
  // Professional Services
  LEGAL_FEES = 'LEGAL_FEES',
  ACCOUNTING_FEES = 'ACCOUNTING_FEES',
  CONSULTING_FEES = 'CONSULTING_FEES',
  
  // Taxes
  VAT = 'VAT',
  INCOME_TAX = 'INCOME_TAX',
  OTHER_TAXES = 'OTHER_TAXES',
  
  // Other
  BANK_FEES = 'BANK_FEES',
  INTEREST = 'INTEREST',
  MISCELLANEOUS = 'MISCELLANEOUS'
}

export enum TaxType {
  VAT = 'VAT',
  GST = 'GST',
  SALES_TAX = 'SALES_TAX',
  WITHHOLDING = 'WITHHOLDING',
  CUSTOMS = 'CUSTOMS'
}

// Invoice Schema
export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  productId?: Types.ObjectId;
  category?: string;
}

export interface IInvoice extends Document {
  invoiceId: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  
  // Parties
  issuedBy: {
    type: 'COMPANY' | 'SUPPLIER' | 'CUSTOMER';
    id?: Types.ObjectId;
    name: string;
    address?: string;
    taxId?: string;
    email?: string;
    phone?: string;
  };
  issuedTo: {
    type: 'COMPANY' | 'SUPPLIER' | 'CUSTOMER';
    id?: Types.ObjectId;
    name: string;
    address?: string;
    taxId?: string;
    email?: string;
    phone?: string;
  };
  
  // Dates
  issueDate: Date;
  dueDate: Date;
  paymentTerms?: number;
  
  // Items
  items: IInvoiceItem[];
  
  // Amounts
  subtotal: number;
  taxBreakdown?: Array<{
    type: TaxType;
    rate: number;
    amount: number;
  }>;
  totalTax: number;
  shippingCost?: number;
  otherCharges?: number;
  discount?: {
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    amount: number;
  };
  total: number;
  currency: string;
  exchangeRate?: number;
  totalInEuro?: number;
  
  // Payment
  paidAmount: number;
  outstandingAmount: number;
  payments?: Array<{
    paymentId: string;
    date: Date;
    amount: number;
    method: string;
    reference?: string;
  }>;
  
  // References
  orderId?: Types.ObjectId;
  shipmentId?: string;
  purchaseOrderNumber?: string;
  
  // Documents
  originalDocument?: {
    url: string;
    uploadedAt: Date;
    uploadedBy: Types.ObjectId;
  };
  ocrData?: {
    extractedAt: Date;
    confidence: number;
    rawData: any;
    verifiedBy?: Types.ObjectId;
    verifiedAt?: Date;
  };
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;
  
  // Notes
  notes?: string;
  internalNotes?: string;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  cancelledBy?: Types.ObjectId;
  cancelledAt?: Date;
  
  // Methods
  calculateTotals(): void;
  markAsPaid(): void;
  sendReminder(): Promise<void>;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(InvoiceType),
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(InvoiceStatus),
    default: InvoiceStatus.DRAFT,
    index: true
  },
  
  issuedBy: {
    type: { type: String, enum: ['COMPANY', 'SUPPLIER', 'CUSTOMER'] },
    id: { type: Schema.Types.ObjectId, refPath: 'issuedBy.type' },
    name: { type: String, required: true },
    address: String,
    taxId: String,
    email: String,
    phone: String
  },
  issuedTo: {
    type: { type: String, enum: ['COMPANY', 'SUPPLIER', 'CUSTOMER'] },
    id: { type: Schema.Types.ObjectId, refPath: 'issuedTo.type' },
    name: { type: String, required: true },
    address: String,
    taxId: String,
    email: String,
    phone: String
  },
  
  issueDate: {
    type: Date,
    required: true,
    index: true
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  paymentTerms: Number,
  
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true },
    taxRate: Number,
    taxAmount: Number,
    total: { type: Number, required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    category: String
  }],
  
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxBreakdown: [{
    type: { type: String, enum: Object.values(TaxType) },
    rate: Number,
    amount: Number
  }],
  totalTax: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: Number,
  otherCharges: Number,
  discount: {
    type: { type: String, enum: ['PERCENTAGE', 'FIXED'] },
    value: Number,
    amount: Number
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  exchangeRate: Number,
  totalInEuro: Number,
  
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  outstandingAmount: {
    type: Number,
    default: 0
  },
  payments: [{
    paymentId: { type: String, default: () => uuidv4() },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, required: true },
    reference: String
  }],
  
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  shipmentId: String,
  purchaseOrderNumber: String,
  
  originalDocument: {
    url: String,
    uploadedAt: Date,
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  ocrData: {
    extractedAt: Date,
    confidence: Number,
    rawData: Schema.Types.Mixed,
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  notes: String,
  internalNotes: String,
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date
}, {
  timestamps: true,
  collection: 'invoices'
});

// Transaction Schema - المعاملات المالية
export interface ITransaction extends Document {
  transactionId: string;
  type: TransactionType;
  category?: ExpenseCategory;
  
  // Amount
  amount: number;
  currency: string;
  exchangeRate?: number;
  amountInEuro: number;
  
  // Accounts
  fromAccount?: string;
  toAccount?: string;
  
  // Details
  description: string;
  reference?: string;
  
  // Related Documents
  invoiceId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  expenseId?: Types.ObjectId;
  
  // Bank Details
  bankTransactionId?: string;
  bankName?: string;
  
  // Date
  transactionDate: Date;
  valueDate?: Date;
  
  // Reconciliation
  isReconciled: boolean;
  reconciledAt?: Date;
  reconciledBy?: Types.ObjectId;
  
  // Attachments
  receipts?: Array<{
    url: string;
    uploadedAt: Date;
  }>;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: Object.values(ExpenseCategory)
  },
  
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  exchangeRate: Number,
  amountInEuro: {
    type: Number,
    required: true
  },
  
  fromAccount: String,
  toAccount: String,
  
  description: {
    type: String,
    required: true
  },
  reference: String,
  
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  expenseId: {
    type: Schema.Types.ObjectId,
    ref: 'Expense'
  },
  
  bankTransactionId: String,
  bankName: String,
  
  transactionDate: {
    type: Date,
    required: true,
    index: true
  },
  valueDate: Date,
  
  isReconciled: {
    type: Boolean,
    default: false,
    index: true
  },
  reconciledAt: Date,
  reconciledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  receipts: [{
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'transactions'
});

// Expense Schema - المصروفات
export interface IExpense extends Document {
  expenseId: string;
  category: ExpenseCategory;
  subcategory?: string;
  
  // Amount
  amount: number;
  currency: string;
  amountInEuro: number;
  
  // Details
  description: string;
  vendor?: string;
  
  // Dates
  expenseDate: Date;
  dueDate?: Date;
  paidDate?: Date;
  
  // Payment
  paymentMethod?: string;
  paymentReference?: string;
  isPaid: boolean;
  
  // Recurring
  isRecurring: boolean;
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  nextDueDate?: Date;
  
  // Tax
  isTaxDeductible: boolean;
  taxAmount?: number;
  
  // Related
  invoiceId?: Types.ObjectId;
  contractId?: string;
  employeeId?: Types.ObjectId;
  
  // Attachments
  receipts: Array<{
    url: string;
    uploadedAt: Date;
  }>;
  
  // Approval
  requiresApproval: boolean;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const ExpenseSchema = new Schema<IExpense>({
  expenseId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  category: {
    type: String,
    enum: Object.values(ExpenseCategory),
    required: true,
    index: true
  },
  subcategory: String,
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  amountInEuro: {
    type: Number,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  vendor: String,
  
  expenseDate: {
    type: Date,
    required: true,
    index: true
  },
  dueDate: Date,
  paidDate: Date,
  
  paymentMethod: String,
  paymentReference: String,
  isPaid: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']
  },
  nextDueDate: Date,
  
  isTaxDeductible: {
    type: Boolean,
    default: true
  },
  taxAmount: Number,
  
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  contractId: String,
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  receipts: [{
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  requiresApproval: {
    type: Boolean,
    default: function() {
      return this.amount > 1000; // Requires approval if > 1000 EUR
    }
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'expenses'
});

// Exchange Rate Schema - أسعار الصرف
export interface IExchangeRate extends Document {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: Date;
  source: string;
  
  // Historical rates
  bid?: number;
  ask?: number;
  mid?: number;
  
  // Validity
  validFrom: Date;
  validTo?: Date;
  
  isActive: boolean;
}

const ExchangeRateSchema = new Schema<IExchangeRate>({
  fromCurrency: {
    type: String,
    required: true,
    index: true
  },
  toCurrency: {
    type: String,
    required: true,
    index: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true
  },
  
  bid: Number,
  ask: Number,
  mid: Number,
  
  validFrom: {
    type: Date,
    required: true
  },
  validTo: Date,
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'exchange_rates'
});

// Indexes
InvoiceSchema.index({ type: 1, status: 1, issueDate: -1 });
InvoiceSchema.index({ dueDate: 1, status: 1 });
InvoiceSchema.index({ 'issuedBy.id': 1, type: 1 });
InvoiceSchema.index({ 'issuedTo.id': 1, type: 1 });
InvoiceSchema.index({ outstandingAmount: -1, status: 1 });

TransactionSchema.index({ type: 1, transactionDate: -1 });
TransactionSchema.index({ category: 1, transactionDate: -1 });
TransactionSchema.index({ isReconciled: 1, transactionDate: -1 });

ExpenseSchema.index({ category: 1, expenseDate: -1 });
ExpenseSchema.index({ isPaid: 1, dueDate: 1 });
ExpenseSchema.index({ isRecurring: 1, nextDueDate: 1 });

ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, date: -1 });
ExchangeRateSchema.index({ date: -1, isActive: 1 });

// Unique compound index for exchange rates
ExchangeRateSchema.index(
  { fromCurrency: 1, toCurrency: 1, date: 1 }, 
  { unique: true }
);

// Pre-save middleware for Invoice
InvoiceSchema.pre('save', async function(next) {
  // Generate invoice number
  if (this.isNew && !this.invoiceNumber) {
    const year = new Date().getFullYear();
    const prefix = this.type === InvoiceType.PURCHASE ? 'PINV' : 'SINV';
    const count = await this.constructor.countDocuments({
      type: this.type,
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.invoiceNumber = `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Calculate totals
  this.calculateTotals();
  
  // Update status based on payment
  if (this.outstandingAmount <= 0) {
    this.status = InvoiceStatus.PAID;
  } else if (this.paidAmount > 0) {
    this.status = InvoiceStatus.PARTIALLY_PAID;
  } else if (new Date() > this.dueDate && this.status !== InvoiceStatus.CANCELLED) {
    this.status = InvoiceStatus.OVERDUE;
  }
  
  next();
});

// Methods
InvoiceSchema.methods.calculateTotals = function(): void {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => {
    item.subtotal = item.quantity * item.unitPrice;
    
    if (item.taxRate) {
      item.taxAmount = item.subtotal * (item.taxRate / 100);
    }
    
    item.total = item.subtotal + (item.taxAmount || 0);
    return sum + item.subtotal;
  }, 0);
  
  // Calculate tax
  this.totalTax = this.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  
  // Apply discount
  let discountAmount = 0;
  if (this.discount) {
    if (this.discount.type === 'PERCENTAGE') {
      discountAmount = this.subtotal * (this.discount.value / 100);
    } else {
      discountAmount = this.discount.value;
    }
    this.discount.amount = discountAmount;
  }
  
  // Calculate total
  this.total = this.subtotal + this.totalTax - discountAmount + 
    (this.shippingCost || 0) + (this.otherCharges || 0);
  
  // Calculate paid and outstanding
  this.paidAmount = this.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  this.outstandingAmount = this.total - this.paidAmount;
  
  // Convert to Euro if needed
  if (this.currency !== 'EUR' && this.exchangeRate) {
    this.totalInEuro = this.total / this.exchangeRate;
  } else if (this.currency === 'EUR') {
    this.totalInEuro = this.total;
  }
};

InvoiceSchema.methods.markAsPaid = function(): void {
  this.paidAmount = this.total;
  this.outstandingAmount = 0;
  this.status = InvoiceStatus.PAID;
};

InvoiceSchema.methods.sendReminder = async function(): Promise<void> {
  // Implementation would send reminder via email/WhatsApp
  console.log(`Sending reminder for invoice ${this.invoiceNumber}`);
};

// Pre-save middleware for Transaction
TransactionSchema.pre('save', function(next) {
  // Convert to Euro
  if (this.currency !== 'EUR' && this.exchangeRate) {
    this.amountInEuro = this.amount / this.exchangeRate;
  } else if (this.currency === 'EUR') {
    this.amountInEuro = this.amount;
  }
  
  next();
});

// Pre-save middleware for Expense
ExpenseSchema.pre('save', async function(next) {
  // Convert to Euro
  if (this.currency !== 'EUR') {
    // Get exchange rate
    const rate = await ExchangeRate.findOne({
      fromCurrency: this.currency,
      toCurrency: 'EUR',
      date: { $lte: this.expenseDate },
      isActive: true
    }).sort({ date: -1 });
    
    if (rate) {
      this.amountInEuro = this.amount / rate.rate;
    }
  } else {
    this.amountInEuro = this.amount;
  }
  
  // Set next due date for recurring expenses
  if (this.isRecurring && this.recurringFrequency && !this.nextDueDate) {
    const date = new Date(this.expenseDate);
    switch (this.recurringFrequency) {
      case 'DAILY':
        date.setDate(date.getDate() + 1);
        break;
      case 'WEEKLY':
        date.setDate(date.getDate() + 7);
        break;
      case 'MONTHLY':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'QUARTERLY':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'YEARLY':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    this.nextDueDate = date;
  }
  
  next();
});

// Export models
export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
export const Expense = model<IExpense>('Expense', ExpenseSchema);
export const ExchangeRate = model<IExchangeRate>('ExchangeRate', ExchangeRateSchema);