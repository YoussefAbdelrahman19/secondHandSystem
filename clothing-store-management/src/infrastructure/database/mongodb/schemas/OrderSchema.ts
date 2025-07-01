// src/infrastructure/database/mongodb/schemas/OrderSchema.ts
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Enums
export enum OrderType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE',
  ONLINE = 'ONLINE',
  B2B = 'B2B',
  MARKETPLACE = 'MARKETPLACE'
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  RETURNED = 'RETURNED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  INVOICE = 'INVOICE',
  STORE_CREDIT = 'STORE_CREDIT'
}

export enum ShippingMethod {
  PICKUP = 'PICKUP',
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  ECONOMY = 'ECONOMY',
  FREIGHT = 'FREIGHT',
  WHITE_GLOVE = 'WHITE_GLOVE'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  VOLUME_DISCOUNT = 'VOLUME_DISCOUNT'
}

// Interfaces
export interface IOrderItem {
  productId: Types.ObjectId;
  sku: string;
  name: string;
  category: string;
  
  // Pricing
  unitPrice: number;
  quantity: number;
  subtotal: number;
  discount?: {
    type: DiscountType;
    value: number;
    amount: number;
  };
  tax?: number;
  total: number;
  
  // Fulfillment
  warehouseLocation?: string;
  pickedBy?: Types.ObjectId;
  pickedAt?: Date;
  packedBy?: Types.ObjectId;
  packedAt?: Date;
  
  // Returns
  returnedQuantity?: number;
  returnReason?: string;
  returnDate?: Date;
  
  // Notes
  notes?: string;
}

export interface IShippingAddress {
  fullName: string;
  company?: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email?: string;
  instructions?: string;
}

export interface IPayment {
  paymentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  
  // Transaction Details
  transactionId?: string;
  gatewayResponse?: any;
  
  // Card Details (masked)
  cardLast4?: string;
  cardBrand?: string;
  
  // Bank Transfer
  bankName?: string;
  transferReference?: string;
  
  // Dates
  paidAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
  
  // Refund
  refundAmount?: number;
  refundReason?: string;
  refundedBy?: Types.ObjectId;
  
  // Metadata
  metadata?: Record<string, any>;
}

export interface IOrder extends Document {
  orderId: string;
  orderNumber: string;
  
  // Customer
  customerId: Types.ObjectId;
  customerType: 'RETAIL' | 'WHOLESALE';
  customerEmail: string;
  customerPhone: string;
  
  // Order Details
  type: OrderType;
  status: OrderStatus;
  channel: 'STORE' | 'ONLINE' | 'PHONE' | 'WHATSAPP' | 'B2B_PORTAL';
  
  // Items
  items: IOrderItem[];
  totalItems: number;
  totalQuantity: number;
  
  // Pricing
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCost: number;
  handlingFee?: number;
  total: number;
  currency: string;
  exchangeRate?: number;
  
  // Discounts
  discounts?: Array<{
    code?: string;
    type: DiscountType;
    value: number;
    amount: number;
    description?: string;
  }>;
  
  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentTerms?: number; // days for invoice
  dueDate?: Date;
  payments: IPayment[];
  totalPaid: number;
  balanceDue: number;
  
  // Shipping
  shippingMethod: ShippingMethod;
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  
  // Fulfillment
  warehouseId?: Types.ObjectId;
  picklistGenerated?: boolean;
  picklistGeneratedAt?: Date;
  packedAt?: Date;
  shippedAt?: Date;
  
  // Returns
  returnEligible: boolean;
  returnDeadline?: Date;
  hasReturns: boolean;
  returns?: Array<{
    returnId: string;
    items: Array<{
      productId: Types.ObjectId;
      quantity: number;
      reason: string;
      condition: string;
    }>;
    requestedAt: Date;
    approvedAt?: Date;
    receivedAt?: Date;
    refundAmount?: number;
    restockingFee?: number;
    processedBy?: Types.ObjectId;
  }>;
  
  // Customer Communication
  customerNotes?: string;
  internalNotes?: string;
  giftMessage?: string;
  notifications?: Array<{
    type: string;
    sentAt: Date;
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP';
    status: 'SENT' | 'DELIVERED' | 'FAILED';
  }>;
  
  // Repeat Order
  isRepeatOrder: boolean;
  originalOrderId?: Types.ObjectId;
  repeatCount?: number;
  
  // B2B Specific
  purchaseOrderNumber?: string;
  taxExempt?: boolean;
  taxExemptId?: string;
  approvedBy?: Types.ObjectId;
  approvalDate?: Date;
  
  // Analytics
  source?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  deviceType?: string;
  ipAddress?: string;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  cancelledBy?: Types.ObjectId;
  cancelledAt?: Date;
  cancellationReason?: string;
  
  // Methods
  calculateTotals(): void;
  canBeCancelled(): boolean;
  canBeReturned(): boolean;
  generateInvoice(): Promise<string>;
}

// Schema
const OrderSchema = new Schema<IOrder>({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Customer
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  customerType: {
    type: String,
    enum: ['RETAIL', 'WHOLESALE'],
    required: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  
  // Order Details
  type: {
    type: String,
    enum: Object.values(OrderType),
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.DRAFT,
    index: true
  },
  channel: {
    type: String,
    enum: ['STORE', 'ONLINE', 'PHONE', 'WHATSAPP', 'B2B_PORTAL'],
    required: true
  },
  
  // Items
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
    discount: {
      type: { type: String, enum: Object.values(DiscountType) },
      value: Number,
      amount: Number
    },
    tax: Number,
    total: { type: Number, required: true },
    
    warehouseLocation: String,
    pickedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    pickedAt: Date,
    packedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    packedAt: Date,
    
    returnedQuantity: { type: Number, default: 0 },
    returnReason: String,
    returnDate: Date,
    
    notes: String
  }],
  totalItems: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discountTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  taxTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  handlingFee: {
    type: Number,
    default: 0,
    min: 0
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
  
  // Discounts
  discounts: [{
    code: String,
    type: { type: String, enum: Object.values(DiscountType) },
    value: Number,
    amount: Number,
    description: String
  }],
  
  // Payment
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod)
  },
  paymentTerms: Number,
  dueDate: Date,
  payments: [{
    paymentId: { type: String, default: () => uuidv4() },
    method: { type: String, enum: Object.values(PaymentMethod) },
    status: { type: String, enum: Object.values(PaymentStatus) },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    
    transactionId: String,
    gatewayResponse: Schema.Types.Mixed,
    
    cardLast4: String,
    cardBrand: String,
    
    bankName: String,
    transferReference: String,
    
    paidAt: Date,
    failedAt: Date,
    refundedAt: Date,
    
    refundAmount: Number,
    refundReason: String,
    refundedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    
    metadata: Schema.Types.Mixed
  }],
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceDue: {
    type: Number,
    default: 0
  },
  
  // Shipping
  shippingMethod: {
    type: String,
    enum: Object.values(ShippingMethod),
    required: true
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    company: String,
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: String,
    instructions: String
  },
  billingAddress: {
    fullName: String,
    company: String,
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    phoneNumber: String,
    email: String
  },
  estimatedDeliveryDate: Date,
  actualDeliveryDate: Date,
  trackingNumber: String,
  carrier: String,
  
  // Fulfillment
  warehouseId: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryLocation'
  },
  picklistGenerated: {
    type: Boolean,
    default: false
  },
  picklistGeneratedAt: Date,
  packedAt: Date,
  shippedAt: Date,
  
  // Returns
  returnEligible: {
    type: Boolean,
    default: true
  },
  returnDeadline: Date,
  hasReturns: {
    type: Boolean,
    default: false
  },
  returns: [{
    returnId: { type: String, default: () => uuidv4() },
    items: [{
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
      reason: String,
      condition: String
    }],
    requestedAt: Date,
    approvedAt: Date,
    receivedAt: Date,
    refundAmount: Number,
    restockingFee: Number,
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Customer Communication
  customerNotes: String,
  internalNotes: String,
  giftMessage: String,
  notifications: [{
    type: String,
    sentAt: Date,
    channel: { type: String, enum: ['EMAIL', 'SMS', 'WHATSAPP'] },
    status: { type: String, enum: ['SENT', 'DELIVERED', 'FAILED'] }
  }],
  
  // Repeat Order
  isRepeatOrder: {
    type: Boolean,
    default: false
  },
  originalOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  repeatCount: {
    type: Number,
    default: 0
  },
  
  // B2B Specific
  purchaseOrderNumber: String,
  taxExempt: {
    type: Boolean,
    default: false
  },
  taxExemptId: String,
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: Date,
  
  // Analytics
  source: String,
  utm: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  deviceType: String,
  ipAddress: String,
  
  // Audit
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true,
  collection: 'orders'
});

// Indexes
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, status: 1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ 'items.productId': 1 });
OrderSchema.index({ type: 1, status: 1, createdAt: -1 });
OrderSchema.index({ trackingNumber: 1 });
OrderSchema.index({ dueDate: 1, paymentStatus: 1 });

// Text search
OrderSchema.index({
  orderNumber: 'text',
  customerEmail: 'text',
  'shippingAddress.fullName': 'text',
  trackingNumber: 'text'
});

// Pre-save middleware
OrderSchema.pre('save', async function(next) {
  // Generate order number if new
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    });
    const sequence = String(count + 1).padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${sequence}`;
  }
  
  // Calculate totals
  this.calculateTotals();
  
  // Set payment due date
  if (this.paymentMethod === PaymentMethod.INVOICE && this.paymentTerms) {
    this.dueDate = new Date(Date.now() + this.paymentTerms * 24 * 60 * 60 * 1000);
  }
  
  // Set return deadline
  if (this.returnEligible && !this.returnDeadline) {
    this.returnDeadline = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  }
  
  next();
});

// Methods
OrderSchema.methods.calculateTotals = function(): void {
  // Calculate item totals
  let subtotal = 0;
  let totalQuantity = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  
  this.items.forEach(item => {
    item.subtotal = item.unitPrice * item.quantity;
    
    if (item.discount) {
      if (item.discount.type === DiscountType.PERCENTAGE) {
        item.discount.amount = item.subtotal * (item.discount.value / 100);
      } else {
        item.discount.amount = item.discount.value;
      }
      discountTotal += item.discount.amount;
    }
    
    if (item.tax) {
      taxTotal += item.tax;
    }
    
    item.total = item.subtotal - (item.discount?.amount || 0) + (item.tax || 0);
    subtotal += item.subtotal;
    totalQuantity += item.quantity;
  });
  
  this.subtotal = subtotal;
  this.totalQuantity = totalQuantity;
  this.totalItems = this.items.length;
  this.discountTotal = discountTotal;
  this.taxTotal = taxTotal;
  
  // Apply order-level discounts
  if (this.discounts) {
    this.discounts.forEach(discount => {
      if (discount.type === DiscountType.PERCENTAGE) {
        discount.amount = this.subtotal * (discount.value / 100);
      } else {
        discount.amount = discount.value;
      }
      this.discountTotal += discount.amount;
    });
  }
  
  // Calculate final total
  this.total = this.subtotal - this.discountTotal + this.taxTotal + 
    this.shippingCost + (this.handlingFee || 0);
  
  // Calculate payment totals
  this.totalPaid = this.payments
    .filter(p => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount, 0);
  
  this.balanceDue = this.total - this.totalPaid;
  
  // Update payment status
  if (this.balanceDue <= 0) {
    this.paymentStatus = PaymentStatus.COMPLETED;
  } else if (this.totalPaid > 0) {
    this.paymentStatus = PaymentStatus.PARTIALLY_PAID;
  }
};

OrderSchema.methods.canBeCancelled = function(): boolean {
  const nonCancellableStatuses = [
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.RETURNED
  ];
  return !nonCancellableStatuses.includes(this.status);
};

OrderSchema.methods.canBeReturned = function(): boolean {
  return this.returnEligible && 
    this.status === OrderStatus.DELIVERED && 
    this.returnDeadline && 
    new Date() <= this.returnDeadline;
};

OrderSchema.methods.generateInvoice = async function(): Promise<string> {
  // Implementation would generate PDF invoice
  return `INV-${this.orderNumber}`;
};

export const Order = model<IOrder>('Order', OrderSchema);