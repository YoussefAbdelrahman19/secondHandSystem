// src/infrastructure/database/mongodb/schemas/EmployeeSchema.ts
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Enums
export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  TEMPORARY = 'TEMPORARY',
  INTERN = 'INTERN'
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK'
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  EMERGENCY = 'EMERGENCY',
  STUDY = 'STUDY',
  PUBLIC_HOLIDAY = 'PUBLIC_HOLIDAY'
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EARLY_LEAVE = 'EARLY_LEAVE',
  HALF_DAY = 'HALF_DAY',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND',
  ON_LEAVE = 'ON_LEAVE'
}

export enum ShiftType {
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  NIGHT = 'NIGHT',
  FLEXIBLE = 'FLEXIBLE',
  SPLIT = 'SPLIT'
}

// Employee Schema - بيانات الموظفين
export interface IEmployee extends Document {
  employeeId: string;
  userId: Types.ObjectId; // Link to User
  
  // Personal Information
  nationalId: string;
  passportNumber?: string;
  dateOfBirth: Date;
  nationality: string;
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
    address?: string;
  };
  
  // Employment Details
  department: string;
  position: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  hireDate: Date;
  confirmationDate?: Date;
  terminationDate?: Date;
  terminationReason?: string;
  
  // Manager
  reportingTo?: Types.ObjectId;
  teamMembers?: Types.ObjectId[];
  
  // Salary & Compensation
  baseSalary: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentFrequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    iban?: string;
    swiftCode?: string;
  };
  allowances?: Array<{
    type: string;
    amount: number;
    frequency: string;
  }>;
  deductions?: Array<{
    type: string;
    amount: number;
    frequency: string;
  }>;
  
  // Working Hours
  workingHours: {
    startTime: string;
    endTime: string;
    breakDuration: number; // minutes
    workingDays: string[];
  };
  shiftType?: ShiftType;
  isFlexibleHours: boolean;
  
  // Leave Balance
  leaveBalance: {
    annual: number;
    sick: number;
    emergency: number;
    unpaid: number;
    carryOver?: number;
  };
  leaveHistory?: Array<{
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    days: number;
    reason?: string;
    approvedBy?: Types.ObjectId;
    approvedAt?: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  }>;
  
  // Documents
  documents?: Array<{
    type: string; // 'CONTRACT', 'ID', 'PASSPORT', 'CERTIFICATE', etc.
    name: string;
    url: string;
    expiryDate?: Date;
    uploadedAt: Date;
    uploadedBy: Types.ObjectId;
  }>;
  
  // Performance
  performanceReviews?: Array<{
    reviewDate: Date;
    reviewer: Types.ObjectId;
    rating: number;
    comments?: string;
    goals?: string[];
  }>;
  
  // RFID/Access
  rfidCard?: string;
  accessCode?: string;
  biometricId?: string;
  
  // Benefits
  insurance?: {
    provider: string;
    policyNumber: string;
    startDate: Date;
    endDate?: Date;
    coverage: string[];
  };
  
  // Notes
  notes?: string;
  
  // Audit
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const EmployeeSchema = new Schema<IEmployee>({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  nationalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  passportNumber: {
    type: String,
    sparse: true,
    index: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  nationality: {
    type: String,
    required: true
  },
  maritalStatus: {
    type: String,
    enum: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']
  },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: String
  },
  
  department: {
    type: String,
    required: true,
    index: true
  },
  position: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    enum: Object.values(EmploymentType),
    required: true,
    index: true
  },
  employmentStatus: {
    type: String,
    enum: Object.values(EmploymentStatus),
    default: EmploymentStatus.ACTIVE,
    index: true
  },
  hireDate: {
    type: Date,
    required: true
  },
  confirmationDate: Date,
  terminationDate: Date,
  terminationReason: String,
  
  reportingTo: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  teamMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  
  baseSalary: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    default: PaymentMethod.BANK_TRANSFER
  },
  paymentFrequency: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'],
    default: 'MONTHLY'
  },
  bankAccount: {
    bankName: String,
    accountNumber: String,
    iban: String,
    swiftCode: String
  },
  allowances: [{
    type: String,
    amount: Number,
    frequency: String
  }],
  deductions: [{
    type: String,
    amount: Number,
    frequency: String
  }],
  
  workingHours: {
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '18:00' },
    breakDuration: { type: Number, default: 60 },
    workingDays: [{ type: String }]
  },
  shiftType: {
    type: String,
    enum: Object.values(ShiftType)
  },
  isFlexibleHours: {
    type: Boolean,
    default: false
  },
  
  leaveBalance: {
    annual: { type: Number, default: 21 },
    sick: { type: Number, default: 10 },
    emergency: { type: Number, default: 5 },
    unpaid: { type: Number, default: 0 },
    carryOver: { type: Number, default: 0 }
  },
  leaveHistory: [{
    type: { type: String, enum: Object.values(LeaveType) },
    startDate: Date,
    endDate: Date,
    days: Number,
    reason: String,
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING'
    }
  }],
  
  documents: [{
    type: String,
    name: String,
    url: String,
    expiryDate: Date,
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  
  performanceReviews: [{
    reviewDate: Date,
    reviewer: { type: Schema.Types.ObjectId, ref: 'Employee' },
    rating: { type: Number, min: 1, max: 5 },
    comments: String,
    goals: [String]
  }],
  
  rfidCard: {
    type: String,
    sparse: true,
    unique: true
  },
  accessCode: String,
  biometricId: String,
  
  insurance: {
    provider: String,
    policyNumber: String,
    startDate: Date,
    endDate: Date,
    coverage: [String]
  },
  
  notes: String,
  
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
  collection: 'employees'
});

// Attendance Schema - نظام الحضور والانصراف
export interface IAttendance extends Document {
  attendanceId: string;
  employeeId: Types.ObjectId;
  date: Date;
  
  // Check In/Out
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualCheckIn?: Date;
  actualCheckOut?: Date;
  
  // Manual Entry
  manualEntry: boolean;
  manualEntryReason?: string;
  enteredBy?: Types.ObjectId;
  
  // RFID/Biometric
  checkInMethod?: 'RFID' | 'BIOMETRIC' | 'MANUAL' | 'MOBILE';
  checkOutMethod?: 'RFID' | 'BIOMETRIC' | 'MANUAL' | 'MOBILE';
  
  // Location
  checkInLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  checkOutLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  
  // Status
  status: AttendanceStatus;
  
  // Working Hours
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  
  // Breaks
  breaks?: Array<{
    startTime: Date;
    endTime?: Date;
    duration?: number;
    reason?: string;
  }>;
  totalBreakTime?: number;
  
  // Overtime
  isOvertime: boolean;
  overtimeApproved?: boolean;
  overtimeApprovedBy?: Types.ObjectId;
  overtimeRate?: number;
  
  // Leave
  leaveType?: LeaveType;
  leaveId?: string;
  
  // Notes
  notes?: string;
  
  // Verification
  isVerified: boolean;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  attendanceId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  scheduledStartTime: {
    type: String,
    required: true
  },
  scheduledEndTime: {
    type: String,
    required: true
  },
  actualCheckIn: Date,
  actualCheckOut: Date,
  
  manualEntry: {
    type: Boolean,
    default: false
  },
  manualEntryReason: String,
  enteredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  checkInMethod: {
    type: String,
    enum: ['RFID', 'BIOMETRIC', 'MANUAL', 'MOBILE']
  },
  checkOutMethod: {
    type: String,
    enum: ['RFID', 'BIOMETRIC', 'MANUAL', 'MOBILE']
  },
  
  checkInLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  checkOutLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  
  status: {
    type: String,
    enum: Object.values(AttendanceStatus),
    required: true,
    index: true
  },
  
  totalHours: Number,
  regularHours: Number,
  overtimeHours: Number,
  lateMinutes: Number,
  earlyLeaveMinutes: Number,
  
  breaks: [{
    startTime: Date,
    endTime: Date,
    duration: Number,
    reason: String
  }],
  totalBreakTime: Number,
  
  isOvertime: {
    type: Boolean,
    default: false
  },
  overtimeApproved: Boolean,
  overtimeApprovedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  overtimeRate: Number,
  
  leaveType: {
    type: String,
    enum: Object.values(LeaveType)
  },
  leaveId: String,
  
  notes: String,
  
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true,
  collection: 'attendance'
});

// Payroll Schema - نظام الرواتب
export interface IPayroll extends Document {
  payrollId: string;
  employeeId: Types.ObjectId;
  
  // Period
  payPeriod: {
    startDate: Date;
    endDate: Date;
    month: number;
    year: number;
  };
  
  // Earnings
  basicSalary: number;
  allowances: Array<{
    type: string;
    amount: number;
    taxable: boolean;
  }>;
  overtime: {
    hours: number;
    rate: number;
    amount: number;
  };
  bonus?: {
    type: string;
    amount: number;
    reason?: string;
  };
  commission?: number;
  totalEarnings: number;
  
  // Deductions
  deductions: Array<{
    type: string;
    amount: number;
    isStatutory: boolean;
  }>;
  tax: {
    incomeHUF: number;
    socialSecurity: number;
    healthInsurance: number;
    pensionContribution: number;
    totalTax: number;
  };
  totalDeductions: number;
  
  // Net Pay
  netPay: number;
  currency: string;
  
  // Attendance Summary
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeDays: number;
  leaveDays: {
    paid: number;
    unpaid: number;
  };
  
  // Payment Details
  paymentMethod: PaymentMethod;
  paymentDate?: Date;
  paymentReference?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    transactionId?: string;
  };
  
  // Status
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';
  
  // Approval
  preparedBy: Types.ObjectId;
  preparedAt: Date;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  
  // Documents
  payslipUrl?: string;
  
  // Notes
  notes?: string;
}

const PayrollSchema = new Schema<IPayroll>({
  payrollId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4(),
    index: true
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    index: true
  },
  
  payPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true }
  },
  
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: [{
    type: String,
    amount: Number,
    taxable: { type: Boolean, default: true }
  }],
  overtime: {
    hours: { type: Number, default: 0 },
    rate: { type: Number, default: 1.5 },
    amount: { type: Number, default: 0 }
  },
  bonus: {
    type: String,
    amount: Number,
    reason: String
  },
  commission: Number,
  totalEarnings: {
    type: Number,
    required: true
  },
  
  deductions: [{
    type: String,
    amount: Number,
    isStatutory: { type: Boolean, default: false }
  }],
  tax: {
    incomeTax: { type: Number, default: 0 },
    socialSecurity: { type: Number, default: 0 },
    healthInsurance: { type: Number, default: 0 },
    pensionContribution: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 }
  },
  totalDeductions: {
    type: Number,
    required: true
  },
  
  netPay: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  
  workingDays: Number,
  presentDays: Number,
  absentDays: Number,
  lateDays: Number,
  overtimeDays: Number,
  leaveDays: {
    paid: { type: Number, default: 0 },
    unpaid: { type: Number, default: 0 }
  },
  
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  paymentDate: Date,
  paymentReference: String,
  bankDetails: {
    bankName: String,
    accountNumber: String,
    transactionId: String
  },
  
  status: {
    type: String,
    enum: ['DRAFT', 'APPROVED', 'PAID', 'CANCELLED'],
    default: 'DRAFT',
    index: true
  },
  
  preparedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  preparedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  payslipUrl: String,
  notes: String
}, {
  timestamps: true,
  collection: 'payroll'
});

// Shift Schema - نظام الورديات
export interface IShift extends Document {
  shiftId: string;
  name: string;
  type: ShiftType;
  
  // Timing
  startTime: string;
  endTime: string;
  breakDuration: number;
  
  // Days
  applicableDays: string[];
  
  // Employees
  assignedEmployees: Types.ObjectId[];
  
  // Overtime Rules
  overtimeThreshold: number; // hours
  overtimeRate: number;
  
  // Status
  isActive: boolean;
  
  // Validity
  effectiveFrom: Date;
  effectiveTo?: Date;
}

const ShiftSchema = new Schema<IShift>({
  shiftId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4()
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(ShiftType),
    required: true
  },
  
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  breakDuration: {
    type: Number,
    default: 60
  },
  
  applicableDays: [{
    type: String
  }],
  
  assignedEmployees: [{
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  
  overtimeThreshold: {
    type: Number,
    default: 8
  },
  overtimeRate: {
    type: Number,
    default: 1.5
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  effectiveFrom: {
    type: Date,
    required: true
  },
  effectiveTo: Date
}, {
  timestamps: true,
  collection: 'shifts'
});

// Indexes
EmployeeSchema.index({ department: 1, employmentStatus: 1 });
EmployeeSchema.index({ employmentType: 1, employmentStatus: 1 });
EmployeeSchema.index({ reportingTo: 1 });
EmployeeSchema.index({ hireDate: 1 });

AttendanceSchema.index({ employeeId: 1, date: -1 });
AttendanceSchema.index({ date: -1, status: 1 });
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

PayrollSchema.index({ employeeId: 1, 'payPeriod.year': -1, 'payPeriod.month': -1 });
PayrollSchema.index({ status: 1, 'payPeriod.year': -1, 'payPeriod.month': -1 });
PayrollSchema.index(
  { employeeId: 1, 'payPeriod.year': 1, 'payPeriod.month': 1 }, 
  { unique: true }
);

ShiftSchema.index({ type: 1, isActive: 1 });
ShiftSchema.index({ assignedEmployees: 1 });

// Pre-save middleware for Attendance
AttendanceSchema.pre('save', function(next) {
  // Calculate working hours
  if (this.actualCheckIn && this.actualCheckOut) {
    const checkIn = this.actualCheckIn.getTime();
    const checkOut = this.actualCheckOut.getTime();
    const totalMs = checkOut - checkIn;
    
    // Subtract break time
    const breakMs = (this.totalBreakTime || 0) * 60 * 1000;
    const workingMs = totalMs - breakMs;
    
    this.totalHours = workingMs / (1000 * 60 * 60);
    
    // Calculate late minutes
    const scheduledStart = new Date(this.date);
    const [startHour, startMinute] = this.scheduledStartTime.split(':').map(Number);
    scheduledStart.setHours(startHour, startMinute, 0, 0);
    
    if (this.actualCheckIn > scheduledStart) {
      this.lateMinutes = Math.floor((this.actualCheckIn.getTime() - scheduledStart.getTime()) / (1000 * 60));
    }
    
    // Calculate overtime
    const regularHours = 8; // Standard working hours
    if (this.totalHours > regularHours) {
      this.overtimeHours = this.totalHours - regularHours;
      this.regularHours = regularHours;
      this.isOvertime = true;
    } else {
      this.regularHours = this.totalHours;
      this.overtimeHours = 0;
    }
    
    // Update status
    if (!this.status || this.status === AttendanceStatus.PRESENT) {
      if (this.lateMinutes > 30) {
        this.status = AttendanceStatus.LATE;
      } else if (this.earlyLeaveMinutes > 30) {
        this.status = AttendanceStatus.EARLY_LEAVE;
      }
    }
  }
  
  next();
});

// Pre-save middleware for Payroll
PayrollSchema.pre('save', function(next) {
  // Calculate total earnings
  const allowancesTotal = this.allowances.reduce((sum, a) => sum + a.amount, 0);
  this.totalEarnings = this.basicSalary + allowancesTotal + 
    this.overtime.amount + (this.bonus?.amount || 0) + (this.commission || 0);
  
  // Calculate total deductions
  const deductionsTotal = this.deductions.reduce((sum, d) => sum + d.amount, 0);
  this.totalDeductions = deductionsTotal + this.tax.totalTax;
  
  // Calculate net pay
  this.netPay = this.totalEarnings - this.totalDeductions;
  
  next();
});

// Virtual for Employee full name
EmployeeSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Methods
EmployeeSchema.methods.calculateLeaveDays = function(leaveType: LeaveType): number {
  const currentYear = new Date().getFullYear();
  const leaves = this.leaveHistory?.filter(leave => 
    leave.type === leaveType &&
    leave.status === 'APPROVED' &&
    new Date(leave.startDate).getFullYear() === currentYear
  ) || [];
  
  return leaves.reduce((total, leave) => total + leave.days, 0);
};

AttendanceSchema.methods.calculateBreakTime = function(): number {
  if (!this.breaks || this.breaks.length === 0) return 0;
  
  return this.breaks.reduce((total, breakItem) => {
    if (breakItem.duration) {
      return total + breakItem.duration;
    } else if (breakItem.startTime && breakItem.endTime) {
      const duration = (breakItem.endTime.getTime() - breakItem.startTime.getTime()) / (1000 * 60);
      return total + duration;
    }
    return total;
  }, 0);
};

// Export models
export const Employee = model<IEmployee>('Employee', EmployeeSchema);
export const Attendance = model<IAttendance>('Attendance', AttendanceSchema);
export const Payroll = model<IPayroll>('Payroll', PayrollSchema);
export const Shift = model<IShift>('Shift', ShiftSchema);