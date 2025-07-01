// src/infrastructure/database/mongodb/schemas/InventorySchema.ts
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Enums
export enum BatchStatus {
  ORDERED = 'ORDERED',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  IN_SORTING = 'IN_SORTING',
  SORTED = 'SORTED',
  PARTIALLY_SORTED = 'PARTIALLY_SORTED',
  IN_STORAGE = 'IN_STORAGE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum BatchType {
  MIXED_CLOTHING = 'MIXED_CLOTHING',
  SORTED_CLOTHING = 'SORTED_CLOTHING',
  SHOES_ONLY = 'SHOES_ONLY',
  ACCESSORIES_ONLY = 'ACCESSORIES_ONLY',
  PREMIUM_BRANDS = 'PREMIUM_BRANDS',
  VINTAGE = 'VINTAGE',
  RECYCLING = 'RECYCLING'
}

export enum LocationType {
  WAREHOUSE = 'WAREHOUSE',
  SORTING_AREA = 'SORTING_AREA',
  RETAIL_STORE = 'RETAIL_STORE',
  TRANSIT = 'TRANSIT',
  RETURNED = 'RETURNED',
  DISPOSED = 'DISPOSED'
}

export enum MovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  THEFT = 'THEFT'
}

// Batch Schema - دفعات البضائع
export interface IBatch extends Document {
  batchId: string;
  batchNumber: string;
  supplierId: Types.ObjectId;
  shipmentId?: string;
  
  // Basic Info
  type: BatchType;
  status: BatchStatus;
  description?: string;
  
  // Quantities
  orderedQuantity: number;
  receivedQuantity?: number;
  sortedQuantity?: number;
  unit: 'KG' | 'PIECES' | 'BALES' | 'CONTAINERS';
  
  // Financial
  purchasePrice: number;
  currency: string;
  euroEquivalent: number;
  shippingCost?: number;
  customsDuty?: number;
  otherCosts?: number;
  totalCost?: number;
  costPerKg?: number;
  
  // Dates
  orderDate: Date;
  expectedDeliveryDate?: Date;
  receivedDate?: Date;
  sortingStartDate?: Date;
  sortingEndDate?: Date;
  
  // Sorting Details
  sortingWorkers?: Array<{
    userId: Types.ObjectId;
    startTime: Date;
    endTime?: Date;
    quantitySorted?: number;
    productsCreated?: number;
  }>;
  sortingDuration?: number; // total hours
  sortingProductivity?: number; // pieces per hour
  
  // Products Created
  productsCreated: Types.ObjectId[];
  articlesSummary?: Map<string, number>; // category -> count
  
  // Quality
  qualityCheckBy?: Types.ObjectId;
  qualityCheckDate?: Date;
  qualityScore?: number;
  qualityNotes?: string;
  defectiveQuantity?: number;
  recyclingQuantity?: number;
  
  // Storage
  warehouseLocation?: string;
  palletNumbers?: string[];
  occupiedSpace?: number; // cubic meters
  
  // Documents
  documents?: Array<{
    type: 'INVOICE' | 'PACKING_LIST' | 'CUSTOMS' | 'QUALITY_REPORT' | 'OTHER';
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  
  // RFID
  rfidBulkScan?: {
    totalTags: number;
    scannedAt: Date;
    scannedBy: Types.ObjectId;
  };
  
  // Analytics
  profitMargin?: number;
  turnoverDays?: number;
  roi?: number;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  completedBy?: Types.ObjectId;
  completedAt?: Date;
}

const BatchSchema = new Schema<IBatch>({
  batchId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  batchNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  supplierId: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true
  },
  shipmentId: String,
  
  type: {
    type: String,
    enum: Object.values(BatchType),
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(BatchStatus),
    default: BatchStatus.ORDERED,
    index: true
  },
  description: String,
  
  orderedQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  receivedQuantity: {
    type: Number,
    min: 0
  },
  sortedQuantity: {
    type: Number,
    min: 0,
    default: 0
  },
  unit: {
    type: String,
    enum: ['KG', 'PIECES', 'BALES', 'CONTAINERS'],
    default: 'KG'
  },
  
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  euroEquivalent: {
    type: Number,
    required: true
  },
  shippingCost: Number,
  customsDuty: Number,
  otherCosts: Number,
  totalCost: Number,
  costPerKg: Number,
  
  orderDate: {
    type: Date,
    required: true
  },
  expectedDeliveryDate: Date,
  receivedDate: Date,
  sortingStartDate: Date,
  sortingEndDate: Date,
  
  sortingWorkers: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    startTime: Date,
    endTime: Date,
    quantitySorted: Number,
    productsCreated: Number
  }],
  sortingDuration: Number,
  sortingProductivity: Number,
  
  productsCreated: [{
    type: Schema.Types.ObjectId,
    ref: 'Product'
  }],
  articlesSummary: {
    type: Map,
    of: Number
  },
  
  qualityCheckBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  qualityCheckDate: Date,
  qualityScore: {
    type: Number,
    min: 0,
    max: 5
  },
  qualityNotes: String,
  defectiveQuantity: Number,
  recyclingQuantity: Number,
  
  warehouseLocation: {
    type: String,
    index: true
  },
  palletNumbers: [String],
  occupiedSpace: Number,
  
  documents: [{
    type: {
      type: String,
      enum: ['INVOICE', 'PACKING_LIST', 'CUSTOMS', 'QUALITY_REPORT', 'OTHER']
    },
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  rfidBulkScan: {
    totalTags: Number,
    scannedAt: Date,
    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  profitMargin: Number,
  turnoverDays: Number,
  roi: Number,
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date
}, {
  timestamps: true,
  collection: 'batches'
});

// Inventory Location Schema - مواقع المخزون
export interface IInventoryLocation extends Document {
  locationId: string;
  code: string;
  name: string;
  type: LocationType;
  
  // Address
  address?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
  
  // Capacity
  totalCapacity?: number; // cubic meters
  usedCapacity?: number;
  availableCapacity?: number;
  
  // Organization
  zones?: Array<{
    zoneId: string;
    name: string;
    rows: Array<{
      rowId: string;
      shelves: Array<{
        shelfId: string;
        bins: Array<{
          binId: string;
          capacity: number;
          currentItems: number;
          rfidAntennaId?: string;
        }>;
      }>;
    }>;
  }>;
  
  // RFID Coverage
  rfidCoverage?: {
    antennas: Array<{
      antennaId: string;
      location: string;
      range: number;
      isActive: boolean;
    }>;
    readers: Array<{
      readerId: string;
      ipAddress: string;
      isActive: boolean;
    }>;
  };
  
  // Staff
  manager?: Types.ObjectId;
  staff?: Types.ObjectId[];
  
  // Operating Hours
  operatingHours?: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  
  isActive: boolean;
}

const InventoryLocationSchema = new Schema<IInventoryLocation>({
  locationId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4()
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(LocationType),
    required: true,
    index: true
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  totalCapacity: Number,
  usedCapacity: { type: Number, default: 0 },
  availableCapacity: Number,
  
  zones: [{
    zoneId: { type: String, default: () => uuidv4() },
    name: String,
    rows: [{
      rowId: { type: String, default: () => uuidv4() },
      shelves: [{
        shelfId: { type: String, default: () => uuidv4() },
        bins: [{
          binId: { type: String, default: () => uuidv4() },
          capacity: Number,
          currentItems: { type: Number, default: 0 },
          rfidAntennaId: String
        }]
      }]
    }]
  }],
  
  rfidCoverage: {
    antennas: [{
      antennaId: String,
      location: String,
      range: Number,
      isActive: { type: Boolean, default: true }
    }],
    readers: [{
      readerId: String,
      ipAddress: String,
      isActive: { type: Boolean, default: true }
    }]
  },
  
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  staff: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  operatingHours: {
    type: Map,
    of: {
      open: String,
      close: String
    }
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'inventory_locations'
});

// Inventory Movement Schema - حركات المخزون
export interface IInventoryMovement extends Document {
  movementId: string;
  type: MovementType;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
  // Items
  items: Array<{
    productId: Types.ObjectId;
    quantity: number;
    fromLocation?: string;
    toLocation?: string;
    rfidTag?: string;
  }>;
  
  // Batch Movement
  batchId?: Types.ObjectId;
  isBulkMovement: boolean;
  
  // Locations
  fromLocation?: Types.ObjectId;
  toLocation?: Types.ObjectId;
  fromBin?: string;
  toBin?: string;
  
  // Related Documents
  orderId?: Types.ObjectId;
  returnId?: string;
  adjustmentReason?: string;
  
  // Execution
  requestedBy: Types.ObjectId;
  requestedAt: Date;
  executedBy?: Types.ObjectId;
  executedAt?: Date;
  
  // Verification
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  discrepancies?: Array<{
    productId: Types.ObjectId;
    expectedQuantity: number;
    actualQuantity: number;
    notes?: string;
  }>;
  
  // Notes
  notes?: string;
  attachments?: string[];
}

const InventoryMovementSchema = new Schema<IInventoryMovement>({
  movementId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  type: {
    type: String,
    enum: Object.values(MovementType),
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  
  items: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    fromLocation: String,
    toLocation: String,
    rfidTag: String
  }],
  
  batchId: {
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  },
  isBulkMovement: {
    type: Boolean,
    default: false
  },
  
  fromLocation: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryLocation'
  },
  toLocation: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryLocation'
  },
  fromBin: String,
  toBin: String,
  
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  returnId: String,
  adjustmentReason: String,
  
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  executedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  executedAt: Date,
  
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  discrepancies: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    expectedQuantity: Number,
    actualQuantity: Number,
    notes: String
  }],
  
  notes: String,
  attachments: [String]
}, {
  timestamps: true,
  collection: 'inventory_movements'
});

// Indexes
BatchSchema.index({ supplierId: 1, status: 1 });
BatchSchema.index({ status: 1, createdAt: -1 });
BatchSchema.index({ warehouseLocation: 1, status: 1 });
BatchSchema.index({ 'sortingWorkers.userId': 1 });

InventoryLocationSchema.index({ type: 1, isActive: 1 });
InventoryLocationSchema.index({ 'address.city': 1, 'address.country': 1 });

InventoryMovementSchema.index({ type: 1, status: 1, createdAt: -1 });
InventoryMovementSchema.index({ 'items.productId': 1 });
InventoryMovementSchema.index({ requestedBy: 1, createdAt: -1 });

// Pre-save middleware for Batch
BatchSchema.pre('save', async function(next) {
  // Generate batch number if not provided
  if (this.isNew && !this.batchNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1)
      }
    });
    this.batchNumber = `BATCH-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate total cost
  if (this.purchasePrice) {
    this.totalCost = this.purchasePrice + 
      (this.shippingCost || 0) + 
      (this.customsDuty || 0) + 
      (this.otherCosts || 0);
    
    // Calculate cost per kg
    if (this.receivedQuantity && this.unit === 'KG') {
      this.costPerKg = this.totalCost / this.receivedQuantity;
    }
  }
  
  // Calculate sorting productivity
  if (this.sortingWorkers && this.sortingWorkers.length > 0) {
    const totalHours = this.sortingWorkers.reduce((sum, worker) => {
      if (worker.startTime && worker.endTime) {
        const hours = (worker.endTime.getTime() - worker.startTime.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }
      return sum;
    }, 0);
    
    this.sortingDuration = totalHours;
    
    if (totalHours > 0 && this.sortedQuantity) {
      this.sortingProductivity = this.sortedQuantity / totalHours;
    }
  }
  
  next();
});

// Models
export const Batch = model<IBatch>('Batch', BatchSchema);
export const InventoryLocation = model<IInventoryLocation>('InventoryLocation', InventoryLocationSchema);
export const InventoryMovement = model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);