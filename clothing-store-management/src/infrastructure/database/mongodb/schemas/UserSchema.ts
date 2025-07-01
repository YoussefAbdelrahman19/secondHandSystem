// src/infrastructure/database/mongodb/schemas/UserSchema.ts
import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Enums
export enum UserRole {
  OWNER = 'OWNER',
  LAWYER = 'LAWYER',
  ACCOUNTANT = 'ACCOUNTANT',
  MANAGER = 'MANAGER',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  SORTING_WORKER = 'SORTING_WORKER',
  PACKING_WORKER = 'PACKING_WORKER',
  TEMPORARY_WORKER = 'TEMPORARY_WORKER',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER'
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  WHATSAPP = 'WHATSAPP'
}

// Interfaces
export interface IPermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface ITwoFactorAuth {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
  lastUsedBackupCode?: string;
  verifiedAt?: Date;
}

export interface ILoginAttempt {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string;
}

export interface INotificationPreferences {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    reports: boolean;
  };
  whatsapp: {
    orderUpdates: boolean;
    promotions: boolean;
    reports: boolean;
  };
  sms: {
    orderUpdates: boolean;
    criticalAlerts: boolean;
  };
}

export interface IUser extends Document {
  userId: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  whatsappNumber?: string;
  role: UserRole;
  permissions: IPermission[];
  
  // Profile
  profileImage?: string;
  dateOfBirth?: Date;
  nationalId?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode: string;
  };
  
  // Auth & Security
  authProvider: AuthProvider;
  googleId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorAuth: ITwoFactorAuth;
  loginAttempts: ILoginAttempt[];
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  
  // Preferences
  language: string;
  timezone: string;
  currency: string;
  notificationPreferences: INotificationPreferences;
  
  // Employee specific
  employeeId?: string;
  department?: string;
  position?: string;
  hireDate?: Date;
  contractType?: 'PERMANENT' | 'TEMPORARY' | 'CONTRACT';
  
  // Customer specific
  customerType?: 'RETAIL' | 'WHOLESALE';
  creditLimit?: number;
  paymentTerms?: number; // days
  
  // GDPR
  gdprConsent: {
    marketing: boolean;
    dataProcessing: boolean;
    consentDate?: Date;
    ip?: string;
  };
  dataExportRequests: Array<{
    requestedAt: Date;
    completedAt?: Date;
    downloadUrl?: string;
  }>;
  
  // Audit
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
}

// Schema
const UserSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === AuthProvider.LOCAL;
    }
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    index: true
  },
  whatsappNumber: {
    type: String,
    sparse: true,
    index: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    index: true
  },
  permissions: [{
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      required: true
    }],
    conditions: {
      type: Schema.Types.Mixed
    }
  }],
  
  // Profile
  profileImage: String,
  dateOfBirth: Date,
  nationalId: {
    type: String,
    sparse: true,
    index: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  // Auth & Security
  authProvider: {
    type: String,
    enum: Object.values(AuthProvider),
    default: AuthProvider.LOCAL
  },
  googleId: {
    type: String,
    sparse: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: String,
    backupCodes: [String],
    lastUsedBackupCode: String,
    verifiedAt: Date
  },
  loginAttempts: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    success: Boolean,
    reason: String
  }],
  lastLoginAt: Date,
  lastActivityAt: Date,
  
  // Preferences
  language: {
    type: String,
    default: 'ar'
  },
  timezone: {
    type: String,
    default: 'Europe/Budapest'
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  notificationPreferences: {
    email: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      reports: { type: Boolean, default: true }
    },
    whatsapp: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      reports: { type: Boolean, default: false }
    },
    sms: {
      orderUpdates: { type: Boolean, default: false },
      criticalAlerts: { type: Boolean, default: true }
    }
  },
  
  // Employee specific
  employeeId: {
    type: String,
    sparse: true,
    index: true
  },
  department: String,
  position: String,
  hireDate: Date,
  contractType: {
    type: String,
    enum: ['PERMANENT', 'TEMPORARY', 'CONTRACT']
  },
  
  // Customer specific
  customerType: {
    type: String,
    enum: ['RETAIL', 'WHOLESALE']
  },
  creditLimit: {
    type: Number,
    default: 0
  },
  paymentTerms: {
    type: Number,
    default: 0
  },
  
  // GDPR
  gdprConsent: {
    marketing: { type: Boolean, default: false },
    dataProcessing: { type: Boolean, default: true },
    consentDate: Date,
    ip: String
  },
  dataExportRequests: [{
    requestedAt: { type: Date, default: Date.now },
    completedAt: Date,
    downloadUrl: String
  }],
  
  // Audit
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
  collection: 'users'
});

// Indexes
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ 'address.country': 1, 'address.city': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActivityAt: -1 });
UserSchema.index({ deletedAt: 1 }, { sparse: true });

// Text search index
UserSchema.index({
  email: 'text',
  firstName: 'text',
  lastName: 'text',
  phoneNumber: 'text'
});

// Pre-save middleware
UserSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Generate employee ID for employees
  if (this.isNew && this.role !== UserRole.CUSTOMER && this.role !== UserRole.SUPPLIER && !this.employeeId) {
    const count = await this.constructor.countDocuments({ role: this.role });
    const prefix = this.role.substring(0, 3).toUpperCase();
    this.employeeId = `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
  
  next();
});

// Methods
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateAuthToken = function(): string {
  // Implementation in JWTService
  return '';
};

UserSchema.methods.generatePasswordResetToken = function(): string {
  const resetToken = uuidv4();
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
  return resetToken;
};

UserSchema.methods.generateEmailVerificationToken = function(): string {
  const verificationToken = uuidv4();
  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = new Date(Date.now() + 86400000); // 24 hours
  return verificationToken;
};

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.__v;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.twoFactorAuth.secret;
    delete ret.twoFactorAuth.backupCodes;
    return ret;
  }
});

export const User = model<IUser>('User', UserSchema);