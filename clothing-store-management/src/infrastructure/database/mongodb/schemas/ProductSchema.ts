// src/infrastructure/database/mongodb/schemas/ProductSchema.ts
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Enums
export enum ProductCategory {
  // Men's Clothing
  MENS_SHIRTS = 'MENS_SHIRTS',
  MENS_PANTS = 'MENS_PANTS',
  MENS_JACKETS = 'MENS_JACKETS',
  MENS_SUITS = 'MENS_SUITS',
  MENS_SPORTSWEAR = 'MENS_SPORTSWEAR',
  
  // Women's Clothing
  WOMENS_DRESSES = 'WOMENS_DRESSES',
  WOMENS_TOPS = 'WOMENS_TOPS',
  WOMENS_PANTS = 'WOMENS_PANTS',
  WOMENS_SKIRTS = 'WOMENS_SKIRTS',
  WOMENS_JACKETS = 'WOMENS_JACKETS',
  
  // Kids
  KIDS_BOYS = 'KIDS_BOYS',
  KIDS_GIRLS = 'KIDS_GIRLS',
  KIDS_BABY = 'KIDS_BABY',
  
  // Shoes
  MENS_SHOES = 'MENS_SHOES',
  WOMENS_SHOES = 'WOMENS_SHOES',
  KIDS_SHOES = 'KIDS_SHOES',
  SPORTS_SHOES = 'SPORTS_SHOES',
  
  // Accessories
  BAGS = 'BAGS',
  BELTS = 'BELTS',
  HATS = 'HATS',
  SCARVES = 'SCARVES',
  JEWELRY = 'JEWELRY',
  
  // Other
  MIXED = 'MIXED',
  UNSORTED = 'UNSORTED'
}

export enum ProductCondition {
  NEW_WITH_TAGS = 'NEW_WITH_TAGS',
  LIKE_NEW = 'LIKE_NEW',
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  FOR_RECYCLING = 'FOR_RECYCLING'
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  INCOMING = 'INCOMING',
  IN_SORTING = 'IN_SORTING',
  SORTED = 'SORTED',
  IN_WAREHOUSE = 'IN_WAREHOUSE',
  LISTED = 'LISTED',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  RETURNED = 'RETURNED',
  DAMAGED = 'DAMAGED',
  LOST = 'LOST',
  DISPOSED = 'DISPOSED'
}

export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER',
  ALL_SEASON = 'ALL_SEASON'
}

// Interfaces
export interface IRFIDReading {
  timestamp: Date;
  readerId: string;
  location: string;
  signalStrength: number;
  temperature?: number;
  humidity?: number;
}

export interface IProductImage {
  url: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  order: number;
  tags?: string[];
  aiAnalysis?: {
    colors: string[];
    patterns: string[];
    style: string;
    condition: string;
    defects?: string[];
    confidence: number;
  };
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface IProductMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  length?: number;
  shoulders?: number;
  sleeves?: number;
  inseam?: number;
  size?: string;
  sizeRegion?: 'EU' | 'US' | 'UK' | 'ASIA';
}

export interface IPriceHistory {
  price: number;
  currency: string;
  validFrom: Date;
  validTo?: Date;
  reason?: string;
  setBy: Types.ObjectId;
}

export interface IProduct extends Document {
  productId: string;
  sku: string;
  barcode?: string;
  rfidTag?: string;
  
  // Basic Info
  name: string;
  description?: string;
  brand?: string;
  category: ProductCategory;
  subcategory?: string;
  condition: ProductCondition;
  status: ProductStatus;
  season?: Season;
  year?: number;
  material?: string[];
  color: string[];
  pattern?: string;
  style?: string;
  
  // Measurements
  measurements?: IProductMeasurements;
  weight?: number; // in grams
  
  // Sourcing
  batchId?: Types.ObjectId;
  supplierId?: Types.ObjectId;
  sourceType: 'DIRECT_PURCHASE' | 'CONSIGNMENT' | 'DONATION' | 'RETURN';
  purchasePrice?: number;
  purchaseCurrency?: string;
  purchaseDate?: Date;
  
  // Pricing
  basePrice: number;
  currentPrice: number;
  currency: string;
  priceHistory: IPriceHistory[];
  discount?: {
    percentage: number;
    reason: string;
    validUntil?: Date;
  };
  
  // Inventory
  warehouseLocation?: string;
  shelfNumber?: string;
  binNumber?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  
  // Sorting & Processing
  sortedBy?: Types.ObjectId;
  sortedAt?: Date;
  sortingDuration?: number; // in minutes
  qualityCheckBy?: Types.ObjectId;
  qualityCheckAt?: Date;
  qualityNotes?: string;
  
  // RFID Tracking
  rfidReadings: IRFIDReading[];
  lastSeenLocation?: string;
  lastSeenAt?: Date;
  
  // Images & Media
  images: IProductImage[];
  videos?: Array<{
    url: string;
    thumbnailUrl?: string;
    duration?: number;
  }>;
  
  // Sales Info
  listedAt?: Date;
  soldAt?: Date;
  soldTo?: Types.ObjectId;
  soldPrice?: number;
  soldCurrency?: string;
  salesChannel?: 'STORE' | 'ONLINE' | 'WHOLESALE' | 'MARKETPLACE';
  
  // Returns
  returnEligible: boolean;
  returnDeadline?: Date;
  returnHistory?: Array<{
    returnedAt: Date;
    reason: string;
    condition: ProductCondition;
    refundAmount?: number;
    processedBy: Types.ObjectId;
  }>;
  
  // Analytics
  viewCount: number;
  wishlistCount: number;
  daysInInventory?: number;
  turnoverRate?: number;
  
  // Compliance
  careInstructions?: string[];
  countryOfOrigin?: string;
  importDuties?: number;
  customsCode?: string;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  
  // Methods
  calculateAvailableQuantity(): number;
  updateRFIDLocation(reading: IRFIDReading): void;
  applyDiscount(percentage: number, reason: string): void;
}

// Schema
const ProductSchema = new Schema<IProduct>({
  productId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  barcode: {
    type: String,
    sparse: true,
    index: true
  },
  rfidTag: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  
  // Basic Info
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  brand: {
    type: String,
    index: true
  },
  category: {
    type: String,
    enum: Object.values(ProductCategory),
    required: true,
    index: true
  },
  subcategory: String,
  condition: {
    type: String,
    enum: Object.values(ProductCondition),
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.DRAFT,
    index: true
  },
  season: {
    type: String,
    enum: Object.values(Season)
  },
  year: Number,
  material: [String],
  color: [{
    type: String,
    required: true
  }],
  pattern: String,
  style: String,
  
  // Measurements
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    length: Number,
    shoulders: Number,
    sleeves: Number,
    inseam: Number,
    size: String,
    sizeRegion: {
      type: String,
      enum: ['EU', 'US', 'UK', 'ASIA']
    }
  },
  weight: Number,
  
  // Sourcing
  batchId: {
    type: Schema.Types.ObjectId,
    ref: 'Batch',
    index: true
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    index: true
  },
  sourceType: {
    type: String,
    enum: ['DIRECT_PURCHASE', 'CONSIGNMENT', 'DONATION', 'RETURN'],
    required: true
  },
  purchasePrice: Number,
  purchaseCurrency: {
    type: String,
    default: 'EUR'
  },
  purchaseDate: Date,
  
  // Pricing
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
    index: true
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  priceHistory: [{
    price: Number,
    currency: String,
    validFrom: Date,
    validTo: Date,
    reason: String,
    setBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    reason: String,
    validUntil: Date
  },
  
  // Inventory
  warehouseLocation: {
    type: String,
    index: true
  },
  shelfNumber: String,
  binNumber: String,
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  availableQuantity: {
    type: Number,
    default: 1,
    min: 0
  },
  
  // Sorting & Processing
  sortedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sortedAt: Date,
  sortingDuration: Number,
  qualityCheckBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  qualityCheckAt: Date,
  qualityNotes: String,
  
  // RFID Tracking
  rfidReadings: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    readerId: String,
    location: String,
    signalStrength: Number,
    temperature: Number,
    humidity: Number
  }],
  lastSeenLocation: String,
  lastSeenAt: Date,
  
  // Images & Media
  images: [{
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    tags: [String],
    aiAnalysis: {
      colors: [String],
      patterns: [String],
      style: String,
      condition: String,
      defects: [String],
      confidence: Number
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  videos: [{
    url: String,
    thumbnailUrl: String,
    duration: Number
  }],
  
  // Sales Info
  listedAt: Date,
  soldAt: Date,
  soldTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  soldPrice: Number,
  soldCurrency: String,
  salesChannel: {
    type: String,
    enum: ['STORE', 'ONLINE', 'WHOLESALE', 'MARKETPLACE']
  },
  
  // Returns
  returnEligible: {
    type: Boolean,
    default: true
  },
  returnDeadline: Date,
  returnHistory: [{
    returnedAt: Date,
    reason: String,
    condition: {
      type: String,
      enum: Object.values(ProductCondition)
    },
    refundAmount: Number,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  daysInInventory: Number,
  turnoverRate: Number,
  
  // Compliance
  careInstructions: [String],
  countryOfOrigin: String,
  importDuties: Number,
  customsCode: String,
  
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
  deletedAt: Date,
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'products'
});

// Indexes
ProductSchema.index({ category: 1, status: 1, condition: 1 });
ProductSchema.index({ brand: 1, category: 1 });
ProductSchema.index({ currentPrice: 1, currency: 1 });
ProductSchema.index({ warehouseLocation: 1, status: 1 });
ProductSchema.index({ createdAt: -1, status: 1 });
ProductSchema.index({ soldAt: -1 });
ProductSchema.index({ 'measurements.size': 1, category: 1 });
ProductSchema.index({ batchId: 1, status: 1 });

// Text search
ProductSchema.index({
  name: 'text',
  description: 'text',
  brand: 'text',
  sku: 'text'
});

// Compound indexes for common queries
ProductSchema.index({ status: 1, category: 1, currentPrice: 1 });
ProductSchema.index({ supplierId: 1, status: 1, createdAt: -1 });

// Pre-save middleware
ProductSchema.pre('save', async function(next) {
  // Generate SKU if not provided
  if (this.isNew && !this.sku) {
    const categoryPrefix = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.sku = `${categoryPrefix}-${timestamp}-${random}`;
  }
  
  // Calculate available quantity
  this.availableQuantity = this.quantity - this.reservedQuantity;
  
  // Calculate days in inventory
  if (this.status === ProductStatus.SOLD && this.soldAt) {
    this.daysInInventory = Math.floor((this.soldAt.getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Update price history
  if (this.isModified('currentPrice') && !this.isNew) {
    this.priceHistory.push({
      price: this.currentPrice,
      currency: this.currency,
      validFrom: new Date(),
      setBy: this.updatedBy
    });
  }
  
  next();
});

// Methods
ProductSchema.methods.calculateAvailableQuantity = function(): number {
  return this.quantity - this.reservedQuantity;
};

ProductSchema.methods.updateRFIDLocation = function(reading: IRFIDReading): void {
  this.rfidReadings.push(reading);
  this.lastSeenLocation = reading.location;
  this.lastSeenAt = reading.timestamp;
  
  // Keep only last 100 readings
  if (this.rfidReadings.length > 100) {
    this.rfidReadings = this.rfidReadings.slice(-100);
  }
};

ProductSchema.methods.applyDiscount = function(percentage: number, reason: string): void {
  this.currentPrice = this.basePrice * (1 - percentage / 100);
  this.discount = {
    percentage,
    reason,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  };
};

// Virtual for profit margin
ProductSchema.virtual('profitMargin').get(function() {
  if (this.purchasePrice && this.currentPrice) {
    return ((this.currentPrice - this.purchasePrice) / this.purchasePrice) * 100;
  }
  return 0;
});

export const Product = model<IProduct>('Product', ProductSchema);