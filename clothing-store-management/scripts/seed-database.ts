// scripts/seed-database.ts
import { connectDatabase } from '../src/infrastructure/database/mongodb/connection';
import {
  User,
  UserRole,
  Product,
  ProductCategory,
  ProductCondition,
  ProductStatus,
  Supplier,
  SupplierType,
  Employee,
  EmploymentType,
  SystemSettings
} from '../src/infrastructure/database/mongodb/models';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Connect to database
    await connectDatabase();

    // Clear existing data (optional - comment out in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🗑️  Clearing existing data...');
      await Promise.all([
        User.deleteMany({}),
        Product.deleteMany({}),
        Supplier.deleteMany({}),
        Employee.deleteMany({})
      ]);
    }

    // 1. Create Owner/Admin User
    console.log('👤 Creating owner account...');
    const ownerPassword = await bcrypt.hash('Admin@123', 12);
    const owner = await User.create({
      userId: uuidv4(),
      email: 'owner@clothingstore.com',
      password: ownerPassword,
      firstName: 'Store',
      lastName: 'Owner',
      phoneNumber: '+36301234567',
      whatsappNumber: '+36301234567',
      role: UserRole.OWNER,
      permissions: [
        {
          resource: '*',
          actions: ['*']
        }
      ],
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      language: 'ar',
      timezone: 'Europe/Budapest',
      currency: 'EUR',
      gdprConsent: {
        marketing: true,
        dataProcessing: true,
        consentDate: new Date()
      }
    });

    // 2. Create Other Staff Users
    console.log('👥 Creating staff accounts...');
    
    // Lawyer
    const lawyer = await User.create({
      userId: uuidv4(),
      email: 'lawyer@clothingstore.com',
      password: await bcrypt.hash('Lawyer@123', 12),
      firstName: 'Legal',
      lastName: 'Advisor',
      phoneNumber: '+36302234567',
      role: UserRole.LAWYER,
      permissions: [
        {
          resource: 'financial',
          actions: ['view']
        },
        {
          resource: 'reports',
          actions: ['view', 'export']
        },
        {
          resource: 'employees',
          actions: ['view']
        },
        {
          resource: 'contracts',
          actions: ['view', 'create', 'update']
        }
      ],
      isActive: true,
      isEmailVerified: true
    });

    // Accountant
    const accountant = await User.create({
      userId: uuidv4(),
      email: 'accountant@clothingstore.com',
      password: await bcrypt.hash('Account@123', 12),
      firstName: 'Finance',
      lastName: 'Manager',
      phoneNumber: '+36303234567',
      role: UserRole.ACCOUNTANT,
      permissions: [
        {
          resource: 'financial',
          actions: ['*']
        },
        {
          resource: 'invoices',
          actions: ['*']
        },
        {
          resource: 'reports',
          actions: ['*']
        },
        {
          resource: 'expenses',
          actions: ['*']
        }
      ],
      isActive: true,
      isEmailVerified: true
    });

    // Warehouse Manager
    const warehouseManager = await User.create({
      userId: uuidv4(),
      email: 'warehouse@clothingstore.com',
      password: await bcrypt.hash('Warehouse@123', 12),
      firstName: 'Warehouse',
      lastName: 'Manager',
      phoneNumber: '+36304234567',
      role: UserRole.WAREHOUSE_MANAGER,
      permissions: [
        {
          resource: 'inventory',
          actions: ['*']
        },
        {
          resource: 'products',
          actions: ['*']
        },
        {
          resource: 'batches',
          actions: ['*']
        },
        {
          resource: 'rfid',
          actions: ['*']
        }
      ],
      isActive: true,
      isEmailVerified: true
    });

    // Sorting Worker
    const sortingWorker = await User.create({
      userId: uuidv4(),
      email: 'sorter@clothingstore.com',
      password: await bcrypt.hash('Sorter@123', 12),
      firstName: 'Sorting',
      lastName: 'Worker',
      phoneNumber: '+36305234567',
      role: UserRole.SORTING_WORKER,
      permissions: [
        {
          resource: 'products',
          actions: ['view', 'create', 'update']
        },
        {
          resource: 'batches',
          actions: ['view', 'update']
        },
        {
          resource: 'rfid',
          actions: ['scan']
        }
      ],
      isActive: true,
      isEmailVerified: true
    });

    // 3. Create Employees
    console.log('🏢 Creating employee records...');
    
    await Employee.create({
      employeeId: 'EMP-00001',
      userId: owner._id,
      nationalId: 'HU123456789',
      dateOfBirth: new Date('1980-01-01'),
      nationality: 'Hungarian',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phoneNumber: '+36306234567'
      },
      department: 'Management',
      position: 'CEO/Owner',
      employmentType: EmploymentType.FULL_TIME,
      hireDate: new Date('2020-01-01'),
      baseSalary: 5000,
      currency: 'EUR',
      workingHours: {
        startTime: '09:00',
        endTime: '18:00',
        breakDuration: 60,
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      leaveBalance: {
        annual: 25,
        sick: 15,
        emergency: 5,
        unpaid: 0
      },
      createdBy: owner._id
    });

    // 4. Create Sample Suppliers
    console.log('🏭 Creating sample suppliers...');
    
    const supplier1 = await Supplier.create({
      supplierId: uuidv4(),
      companyName: 'European Textile Collectors',
      type: SupplierType.WHOLESALE_SUPPLIER,
      primaryContact: {
        name: 'John Smith',
        email: 'contact@eurotext.com',
        phoneNumber: '+49123456789',
        language: 'en'
      },
      address: {
        street: 'Industrial Street 123',
        city: 'Berlin',
        country: 'Germany',
        postalCode: '10115'
      },
      defaultCurrency: 'EUR',
      acceptedCurrencies: ['EUR', 'USD'],
      paymentTerms: 30,
      suppliedCategories: [
        ProductCategory.MIXED,
        ProductCategory.MENS_SHIRTS,
        ProductCategory.WOMENS_DRESSES
      ],
      hasActiveContract: true,
      contracts: [{
        contractId: uuidv4(),
        contractNumber: 'CT-2024-001',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-12-31'),
        terms: 'Standard wholesale terms',
        minimumOrderQuantity: 500,
        paymentTerms: 30,
        priceAgreement: {
          pricePerKg: 2.5,
          currency: 'EUR'
        },
        isActive: true
      }],
      rating: {
        qualityScore: 4.5,
        deliveryScore: 4.2,
        communicationScore: 4.8,
        priceScore: 4.0,
        overallScore: 4.4,
        totalShipments: 0,
        successfulShipments: 0,
        lastRatingUpdate: new Date()
      },
      createdBy: owner._id
    });

    const supplier2 = await Supplier.create({
      supplierId: uuidv4(),
      companyName: 'Polish Clothing Recyclers',
      type: SupplierType.DIRECT_SUPPLIER,
      primaryContact: {
        name: 'Anna Kowalski',
        email: 'anna@polishrecyclers.pl',
        phoneNumber: '+48987654321',
        language: 'pl'
      },
      address: {
        street: 'Recycling Ave 45',
        city: 'Warsaw',
        country: 'Poland',
        postalCode: '00-001'
      },
      defaultCurrency: 'PLN',
      acceptedCurrencies: ['PLN', 'EUR'],
      paymentTerms: 15,
      suppliedCategories: [
        ProductCategory.UNSORTED,
        ProductCategory.MIXED
      ],
      hasActiveContract: false,
      rating: {
        qualityScore: 3.8,
        deliveryScore: 4.5,
        communicationScore: 4.0,
        priceScore: 4.5,
        overallScore: 4.2,
        totalShipments: 0,
        successfulShipments: 0,
        lastRatingUpdate: new Date()
      },
      createdBy: owner._id
    });

    // 5. Create Sample Products
    console.log('👕 Creating sample products...');
    
    const sampleProducts = [
      {
        productId: uuidv4(),
        sku: 'MENS-001',
        rfidTag: 'RFID001',
        name: 'Blue Denim Jeans',
        brand: 'Levi\'s',
        category: ProductCategory.MENS_PANTS,
        condition: ProductCondition.VERY_GOOD,
        status: ProductStatus.IN_WAREHOUSE,
        color: ['Blue'],
        measurements: {
          waist: 32,
          length: 34,
          size: '32/34',
          sizeRegion: 'US'
        },
        weight: 500,
        basePrice: 25,
        currentPrice: 25,
        currency: 'EUR',
        quantity: 1,
        availableQuantity: 1,
        warehouseLocation: 'A-01-05',
        supplierId: supplier1._id,
        sourceType: 'DIRECT_PURCHASE',
        purchasePrice: 5,
        purchaseCurrency: 'EUR',
        createdBy: warehouseManager._id
      },
      {
        productId: uuidv4(),