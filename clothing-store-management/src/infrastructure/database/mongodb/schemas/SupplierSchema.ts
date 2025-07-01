// src/infrastructure/database/mongodb/schemas/SupplierSchema.ts
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Enums
export enum SupplierType {
  DIRECT_SUPPLIER = 'DIRECT_SUPPLIER',
  WHOLESALE_SUPPLIER = 'WHOLESALE_SUPPLIER',
  CHARITY_ORGANIZATION = 'CHARITY_ORGANIZATION',
  INDIVIDUAL_COLLECTOR = 'INDIVIDUAL_COLLECTOR',
  RECYCLING_CENTER = 'RECYCLING_CENTER',
  MANUFACTURER = 'MANUFACTURER'
}

export enum SupplierStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLACKLISTED = 'BLACKLISTED',
  INACTIVE = 'INACTIVE'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK',
  PAYPAL = 'PAYPAL',
  CRYPTO = 'CRYPTO',
  LETTER_OF_CREDIT = 'LETTER_OF_CREDIT'
}

export enum ShippingMethod {
  TRUCK = 'TRUCK',
  CONTAINER = 'CONTAINER',
  AIR_FREIGHT = 'AIR_FREIGHT',
  SEA_FREIGHT = 'SEA_FREIGHT',
  RAIL = 'RAIL',
  COURIER = 'COURIER'
}

// Interfaces
export interface IBankAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
  swiftCode?: string;
  iban?: string;
  currency: string;
  country: string;
  isDefault: boolean;
}

export interface IContract {
  contractId: string;
  contractNumber: string;
  startDate: Date;
  endDate?: Date;
  terms: string;
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  paymentTerms: number; // days
  priceAgreement?: {
    pricePerKg?: number;
    currency: string;
    validUntil?: Date;
  };
  documents: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  signedBy: {
    supplier?: {
      name: string;
      date: Date;
    };
    company?: {
      name: string;
      date: Date;
    };
  };
  isActive: boolean;
}

export interface IShipment {
  shipmentId: string;
  shipmentNumber: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  shippingMethod: ShippingMethod;
  
  // Driver/Carrier Info
  driver?: {
    name: string;
    phoneNumber: string;
    licenseNumber?: string;
    vehicleNumber?: string;
  };
  carrier?: {
    company: string;
    trackingNumber?: string;
    containerNumber?: string;
  };
  
  // Quantities
  orderedQuantity: number;
  receivedQuantity?: number;
  unit: 'KG' | 'PIECES' | 'BALES' | 'CONTAINERS';
  
  // Financial
  totalAmount: number;
  currency: string;
  exchangeRate?: number;
  euroEquivalent?: number;
  
  // Documents
  invoices: Array<{
    invoiceNumber: string;
    issueDate: Date;
    dueDate: Date;
    amount: number;
    currency: string;
    imageUrl?: string;
    ocrData?: any;
    paidAmount?: number;
    paymentDate?: Date;
  }>;
  
  packingList?: string;
  billOfLading?: string;
  customsDocuments?: string[];
  
  // Quality
  qualityRating?: number;
  qualityNotes?: string;
  rejectedQuantity?: number;
  
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
}

export interface IPaymentRecord {
  paymentId: string;
  date: Date;
  amount: number;
  currency: string;
  euroEquivalent: number;
  method: PaymentMethod;
  reference: string;
  invoiceNumbers?: string[];
  proofOfPayment?: Array<{
    url: string;
    uploadedAt: Date;
  }>;
  notes?: string;
  processedBy: Types.ObjectId;
}

export interface ISupplierRating {
  qualityScore: number; // 1-5
  deliveryScore: number; // 1-5
  communicationScore: number; // 1-5
  priceScore: number; // 1-5
  overallScore: number; // calculated
  totalShipments: number;
  successfulShipments: number;
  lastRatingUpdate: Date;
}

export interface ISupplier extends Document {
  supplierId: string;
  
  // Basic Information
  companyName: string;
  tradingName?: string;
  type: SupplierType;
  status: SupplierStatus;
  registrationNumber?: string;
  taxId?: string;
  
  // Contact Information
  primaryContact: {
    name: string;
    position?: string;
    email: string;
    phoneNumber: string;
    whatsapp?: string;
    language?: string;
  };
  secondaryContacts?: Array<{
    name: string;
    position?: string;
    email?: string;
    phoneNumber?: string;
    whatsapp?: string;
  }>;
  
  // Address
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  warehouseAddresses?: Array<{
    name: string;
    address: string;
    contactPerson?: string;
    phoneNumber?: string;
  }>;
  
  // Financial Information
  defaultCurrency: string;
  acceptedCurrencies: string[];
  paymentTerms: number; // days
  creditLimit?: number;
  currentBalance: number;
  totalPurchases: number;
  outstandingAmount: number;
  
  // Banking
  bankAccounts: IBankAccount[];
  preferredPaymentMethod: PaymentMethod;
  
  // Contracts
  contracts: IContract[];
  hasActiveContract: boolean;
  
  // Shipments
  shipments: IShipment[];
  lastShipmentDate?: Date;
  nextExpectedShipment?: Date;
  
  // Payments
  payments: IPaymentRecord[];
  lastPaymentDate?: Date;
  
  // Products & Pricing
  suppliedCategories: string[];
  priceList?: Array<{
    category: string;
    pricePerKg: number;
    currency: string;
    minQuantity?: number;
    validFrom: Date;
    validTo?: Date;
  }>;
  
  // Rating & Performance
  rating: ISupplierRating;
  complaints?: Array<{
    date: Date;
    issue: string;
    resolution?: string;
    resolvedAt?: Date;
  }>;
  
  // Compliance
  certifications?: Array<{
    name: string;
    issuedBy: string;
    validUntil?: Date;
    documentUrl?: string;
  }>;
  insurancePolicy?: {
    provider: string;
    policyNumber: string;
    coverage: string;
    validUntil: Date;
    documentUrl?: string;
  };
  
  // Communication Preferences
  communicationLanguage: string;
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'WHATSAPP';
  sendOrderConfirmations: boolean;
  sendPaymentReceipts: boolean;
  
  // Notes & Documents
  notes?: string;
  documents?: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
    uploadedBy: Types.ObjectId;
  }>;
  
  // Integration
  apiCredentials?: {
    apiKey?: string;
    webhookUrl?: string;
    lastSync?: Date;
  };
  
  // Audit
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  
  // Methods
  calculateBalance(): number;
  updateRating(): void;
  getActiveContract(): IContract | null;
}

// Schema
const SupplierSchema = new Schema<ISupplier>({
  supplierId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  
  // Basic Information
  companyName: {
    type: String,
    required: true,
    index: true
  },
  tradingName: String,
  type: {
    type: String,
    enum: Object.values(SupplierType),
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(SupplierStatus),
    default: SupplierStatus.PENDING_APPROVAL,
    index: true
  },
  registrationNumber: {
    type: String,
    sparse: true,
    index: true
  },
  taxId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // Contact Information
  primaryContact: {
    name: { type: String, required: true },
    position: String,
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    whatsapp: String,
    language: { type: String, default: 'en' }
  },
  secondaryContacts: [{
    name: String,
    position: String,
    email: String,
    phoneNumber: String,
    whatsapp: String
  }],
  
  // Address
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    country: { type: String, required: true, index: true },
    postalCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  warehouseAddresses: [{
    name: String,
    address: String,
    contactPerson: String,
    phoneNumber: String
  }],
  
  // Financial Information
  defaultCurrency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  acceptedCurrencies: [{
    type: String
  }],
  paymentTerms: {
    type: Number,
    default: 30
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  outstandingAmount: {
    type: Number,
    default: 0
  },
  
  // Banking
  bankAccounts: [{
    accountName: String,
    accountNumber: String,
    bankName: String,
    swiftCode: String,
    iban: String,
    currency: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  preferredPaymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.BANK_TRANSFER
  },
  
  // Contracts
  contracts: [{
    contractId: { type: String, default: () => uuidv4() },
    contractNumber: String,
    startDate: Date,
    endDate: Date,
    terms: String,
    minimumOrderQuantity: Number,
    maximumOrderQuantity: Number,
    paymentTerms: Number,
    priceAgreement: {
      pricePerKg: Number,
      currency: String,
      validUntil: Date
    },
    documents: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    signedBy: {
      supplier: {
        name: String,
        date: Date
      },
      company: {
        name: String,
        date: Date
      }
    },
    isActive: { type: Boolean, default: true }
  }],
  hasActiveContract: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Shipments (stored separately for performance)
  shipments: [{
    shipmentId: { type: String, default: () => uuidv4() },
    shipmentNumber: String,
    orderDate: Date,
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    shippingMethod: {
      type: String,
      enum: Object.values(ShippingMethod)
    },
    driver: {
      name: String,
      phoneNumber: String,
      licenseNumber: String,
      vehicleNumber: String
    },
    carrier: {
      company: String,
      trackingNumber: String,
      containerNumber: String
    },
    orderedQuantity: Number,
    receivedQuantity: Number,
    unit: {
      type: String,
      enum: ['KG', 'PIECES', 'BALES', 'CONTAINERS']
    },
    totalAmount: Number,
    currency: String,
    exchangeRate: Number,
    euroEquivalent: Number,
    invoices: [{
      invoiceNumber: String,
      issueDate: Date,
      dueDate: Date,
      amount: Number,
      currency: String,
      imageUrl: String,
      ocrData: Schema.Types.Mixed,
      paidAmount: Number,
      paymentDate: Date
    }],
    packingList: String,
    billOfLading: String,
    customsDocuments: [String],
    qualityRating: Number,
    qualityNotes: String,
    rejectedQuantity: Number,
    status: {
      type: String,
      enum: ['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']
    },
    notes: String
  }],
  lastShipmentDate: Date,
  nextExpectedShipment: Date,
  
  // Payments
  payments: [{
    paymentId: { type: String, default: () => uuidv4() },
    date: Date,
    amount: Number,
    currency: String,
    euroEquivalent: Number,
    method: {
      type: String,
      enum: Object.values(PaymentMethod)
    },
    reference: String,
    invoiceNumbers: [String],
    proofOfPayment: [{
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    notes: String,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  lastPaymentDate: Date,
  
  // Products & Pricing
  suppliedCategories: [String],
  priceList: [{
    category: String,
    pricePerKg: Number,
    currency: String,
    minQuantity: Number,
    validFrom: Date,
    validTo: Date
  }],
  
  // Rating & Performance
  rating: {
    qualityScore: { type: Number, default: 0, min: 0, max: 5 },
    deliveryScore: { type: Number, default: 0, min: 0, max: 5 },
    communicationScore: { type: Number, default: 0, min: 0, max: 5 },
    priceScore: { type: Number, default: 0, min: 0, max: 5 },
    overallScore: { type: Number, default: 0, min: 0, max: 5 },
    totalShipments: { type: Number, default: 0 },
    successfulShipments: { type: Number, default: 0 },
    lastRatingUpdate: Date
  },
  complaints: [{
    date: { type: Date, default: Date.now },
    issue: String,
    resolution: String,
    resolvedAt: Date
  }],
  
  // Compliance
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date,
    documentUrl: String
  }],
  insurancePolicy: {
    provider: String,
    policyNumber: String,
    coverage: String,
    validUntil: Date,
    documentUrl: String
  },
  
  // Communication Preferences
  communicationLanguage: {
    type: String,
    default: 'en'
  },
  preferredContactMethod: {
    type: String,
    enum: ['EMAIL', 'PHONE', 'WHATSAPP'],
    default: 'EMAIL'
  },
  sendOrderConfirmations: {
    type: Boolean,
    default: true
  },
  sendPaymentReceipts: {
    type: Boolean,
    default: true
  },
  
  // Notes & Documents
  notes: String,
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Integration
  apiCredentials: {
    apiKey: String,
    webhookUrl: String,
    lastSync: Date
  },
  
  // Audit
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
  },
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'suppliers'
});

// Indexes
SupplierSchema.index({ status: 1, type: 1 });
SupplierSchema.index({ 'address.country': 1, status: 1 });
SupplierSchema.index({ defaultCurrency: 1, status: 1 });
SupplierSchema.index({ 'rating.overallScore': -1, status: 1 });
SupplierSchema.index({ lastShipmentDate: -1 });
SupplierSchema.index({ outstandingAmount: -1 });
SupplierSchema.index({ hasActiveContract: 1, status: 1 });

// Text search
SupplierSchema.index({
  companyName: 'text',
  tradingName: 'text',
  'primaryContact.name': 'text',
  'address.city': 'text'
});

// Compound indexes
SupplierSchema.index({ type: 1, 'address.country': 1, status: 1 });
SupplierSchema.index({ status: 1, outstandingAmount: -1 });

// Pre-save middleware
SupplierSchema.pre('save', async function(next) {
  // Update hasActiveContract flag
  this.hasActiveContract = this.contracts.some(contract => 
    contract.isActive && 
    (!contract.endDate || contract.endDate > new Date())
  );
  
  // Calculate outstanding amount
  const totalInvoiced = this.shipments.reduce((sum, shipment) => {
    return sum + shipment.invoices.reduce((invSum, invoice) => {
      return invSum + (invoice.euroEquivalent || invoice.amount);
    }, 0);
  }, 0);
  
  const totalPaid = this.payments.reduce((sum, payment) => {
    return sum + payment.euroEquivalent;
  }, 0);
  
  this.outstandingAmount = totalInvoiced - totalPaid;
  
  // Update rating
  if (this.shipments.length > 0) {
    this.updateRating();
  }
  
  next();
});

// Methods
SupplierSchema.methods.calculateBalance = function(): number {
  return this.currentBalance;
};

SupplierSchema.methods.updateRating = function(): void {
  const recentShipments = this.shipments.slice(-10); // Last 10 shipments
  
  if (recentShipments.length === 0) return;
  
  // Calculate quality score
  const qualityScores = recentShipments
    .filter(s => s.qualityRating !== undefined)
    .map(s => s.qualityRating!);
  
  if (qualityScores.length > 0) {
    this.rating.qualityScore = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
  }
  
  // Calculate delivery score
  const deliveredShipments = recentShipments.filter(s => s.status === 'DELIVERED');
  const onTimeDeliveries = deliveredShipments.filter(s => {
    if (!s.expectedDeliveryDate || !s.actualDeliveryDate) return true;
    return s.actualDeliveryDate <= s.expectedDeliveryDate;
  });
  
  this.rating.deliveryScore = deliveredShipments.length > 0
    ? (onTimeDeliveries.length / deliveredShipments.length) * 5
    : 0;
  
  // Communication score (based on response time - would need separate tracking)
  this.rating.communicationScore = this.rating.communicationScore || 4;
  
  // Price score (based on market comparison - would need market data)
  this.rating.priceScore = this.rating.priceScore || 4;
  
  // Overall score
  this.rating.overallScore = (
    this.rating.qualityScore +
    this.rating.deliveryScore +
    this.rating.communicationScore +
    this.rating.priceScore
  ) / 4;
  
  this.rating.totalShipments = this.shipments.length;
  this.rating.successfulShipments = this.shipments.filter(s => s.status === 'DELIVERED').length;
  this.rating.lastRatingUpdate = new Date();
};

SupplierSchema.methods.getActiveContract = function(): IContract | null {
  return this.contracts.find(contract => 
    contract.isActive && 
    (!contract.endDate || contract.endDate > new Date())
  ) || null;
};

// Virtual for success rate
SupplierSchema.virtual('successRate').get(function() {
  if (this.rating.totalShipments === 0) return 0;
  return (this.rating.successfulShipments / this.rating.totalShipments) * 100;
});

// Virtual for payment history
SupplierSchema.virtual('paymentHistory').get(function() {
  return {
    totalPaid: this.payments.reduce((sum, p) => sum + p.euroEquivalent, 0),
    lastPayment: this.payments[this.payments.length - 1],
    averagePaymentTime: this.calculateAveragePaymentTime()
  };
});

// Helper method for average payment time
SupplierSchema.methods.calculateAveragePaymentTime = function(): number {
  const paymentTimes: number[] = [];
  
  this.shipments.forEach(shipment => {
    shipment.invoices.forEach(invoice => {
      if (invoice.paymentDate && invoice.issueDate) {
        const days = Math.floor(
          (invoice.paymentDate.getTime() - invoice.issueDate.getTime()) / 
          (1000 * 60 * 60 * 24)
        );
        paymentTimes.push(days);
      }
    });
  });
  
  if (paymentTimes.length === 0) return 0;
  return paymentTimes.reduce((a, b) => a + b, 0) / paymentTimes.length;
};

export const Supplier = model<ISupplier>('Supplier', SupplierSchema);