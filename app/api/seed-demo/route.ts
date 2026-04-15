import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Faqat admin demo qo\'sha oladi' }, { status: 401 });
  }

  try {
    await connectDB();
    const db = mongoose.connection.db!;

    // 1. USERS
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedKassir = await bcrypt.hash('kassir123', 10);
    const hashedYordam = await bcrypt.hash('yordam123', 10);

    await db.collection('users').deleteMany({ login: { $in: ['admin', 'kassir', 'yordam'] } });
    const users = await db.collection('users').insertMany([
      { name: 'Admin', login: 'admin', password: hashedAdmin, role: 'admin', status: 'active', phone: '+998901234567', createdAt: new Date() },
      { name: 'Kassir Aziza', login: 'kassir', password: hashedKassir, role: 'kassir', status: 'active', phone: '+998901234568', createdAt: new Date() },
      { name: 'Yordamchi Bobur', login: 'yordam', password: hashedYordam, role: 'yordamchi', status: 'active', phone: '+998901234569', createdAt: new Date() },
    ]);
    const adminId = users.insertedIds[0];

    // 2. PRODUCTS
    const products = await db.collection('products').insertMany([
      { name: 'Asus VivoBook 15 X1500EA', category: 'Noutbuk', buyPrice: 4500000, sellPrice: 5200000, quantity: 15, barcode: '000001', status: 'active' },
      { name: 'HP 15s-fq5000', category: 'Noutbuk', buyPrice: 3800000, sellPrice: 4400000, quantity: 12, barcode: '000002', status: 'active' },
      { name: 'Lenovo IdeaPad 3 15ALC6', category: 'Noutbuk', buyPrice: 5200000, sellPrice: 5900000, quantity: 8, barcode: '000003', status: 'active' },
      { name: 'Acer Aspire 5 A515-56', category: 'Noutbuk', buyPrice: 4800000, sellPrice: 5500000, quantity: 10, barcode: '000004', status: 'active' },
      { name: 'Dell Inspiron 15 3511', category: 'Noutbuk', buyPrice: 5500000, sellPrice: 6200000, quantity: 6, barcode: '000005', status: 'active' },
      { name: 'Apple MacBook Air M2 13"', category: 'Noutbuk', buyPrice: 12000000, sellPrice: 14500000, quantity: 3, barcode: '000006', status: 'active' },
      { name: 'Logitech MX Keys Wireless', category: 'Aksessuar', buyPrice: 350000, sellPrice: 450000, quantity: 20, barcode: '000007', status: 'active' },
      { name: 'HP USB Optical Mouse', category: 'Aksessuar', buyPrice: 55000, sellPrice: 80000, quantity: 35, barcode: '000008', status: 'active' },
      { name: 'TP-Link USB Wi-Fi Adapter', category: 'Aksessuar', buyPrice: 80000, sellPrice: 120000, quantity: 25, barcode: '000009', status: 'active' },
      { name: 'SanDisk 256GB USB Flash Drive', category: 'Aksessuar', buyPrice: 95000, sellPrice: 140000, quantity: 30, barcode: '000010', status: 'active' },
    ]);

    // 3. CUSTOMERS
    const customers = await db.collection('customers').insertMany([
      { name: 'Aliyev Sardor', phone: '+998901111111', address: 'Toshkent, Chilonzor', debt: 0, createdAt: new Date() },
      { name: 'Karimova Dilnoza', phone: '+998902222222', address: 'Toshkent, Yunusobod', debt: 500000, createdAt: new Date() },
      { name: 'Rahimov Jasur', phone: '+998903333333', address: 'Toshkent, Mirzo Ulug\'bek', debt: 0, createdAt: new Date() },
      { name: 'Toshmatova Nigora', phone: '+998904444444', address: 'Toshkent, Yakkasaroy', debt: 1200000, createdAt: new Date() },
      { name: 'Ergashev Otabek', phone: '+998905555555', address: 'Toshkent, Sergeli', debt: 0, createdAt: new Date() },
    ]);

    // 4. SUPPLIERS
    const suppliers = await db.collection('suppliers').insertMany([
      { companyName: 'TechnoMarket LLC', contactPerson: 'Azimov Akmal', phone: '+998712345678', address: 'Toshkent, Sergeli', totalPurchased: 25000000, totalPaid: 20000000, createdAt: new Date() },
      { companyName: 'Digital World', contactPerson: 'Karimov Sherzod', phone: '+998712345679', address: 'Toshkent, Chilonzor', totalPurchased: 15000000, totalPaid: 15000000, createdAt: new Date() },
      { companyName: 'Aksessuar Plus', contactPerson: 'Tursunova Malika', phone: '+998712345680', address: 'Toshkent, Yunusobod', totalPurchased: 5000000, totalPaid: 4500000, createdAt: new Date() },
    ]);

    // 5. WORKERS
    await db.collection('workers').insertMany([
      { name: 'Abdullayev Javohir', phone: '+998906666666', position: 'Sotuvchi', salary: 3000000, address: 'Toshkent, Mirzo Ulug\'bek', hireDate: new Date('2024-01-15'), status: 'active', createdAt: new Date() },
      { name: 'Yusupova Madina', phone: '+998907777777', position: 'Kassa', salary: 2800000, address: 'Toshkent, Yunusobod', hireDate: new Date('2024-02-01'), status: 'active', createdAt: new Date() },
      { name: 'Saidov Bekzod', phone: '+998908888888', position: 'Ombor', salary: 2500000, address: 'Toshkent, Sergeli', hireDate: new Date('2024-03-10'), status: 'active', createdAt: new Date() },
    ]);

    // 6. SALES
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const productIds = Object.values(products.insertedIds);
    await db.collection('sales').insertMany([
      {
        items: [
          { productId: productIds[1], productName: 'HP 15s-fq5000', quantity: 1, sellPrice: 4400000 },
          { productId: productIds[7], productName: 'HP USB Optical Mouse', quantity: 1, sellPrice: 80000 },
        ],
        total: 4480000,
        totalCost: 3855000,
        paymentType: 'naqt',
        status: 'active',
        createdBy: adminId,
        createdByName: 'Admin',
        date: today,
      },
      {
        items: [
          { productId: productIds[0], productName: 'Asus VivoBook 15 X1500EA', quantity: 2, sellPrice: 5200000 },
        ],
        total: 10400000,
        totalCost: 9000000,
        paymentType: 'karta',
        kartaAmount: 10400000,
        status: 'active',
        createdBy: adminId,
        createdByName: 'Admin',
        date: yesterday,
      },
      {
        items: [
          { productId: productIds[6], productName: 'Logitech MX Keys Wireless', quantity: 3, sellPrice: 450000 },
          { productId: productIds[9], productName: 'SanDisk 256GB USB Flash Drive', quantity: 2, sellPrice: 140000 },
        ],
        total: 1630000,
        totalCost: 1240000,
        paymentType: 'naqt',
        status: 'active',
        createdBy: adminId,
        createdByName: 'Kassir Aziza',
        date: twoDaysAgo,
      },
    ]);

    // 7. EXPENSES
    await db.collection('expenses').insertMany([
      { title: 'Ijara to\'lovi', amount: 5000000, category: 'Ijara', note: 'Yanvar oyi', createdBy: adminId, createdByName: 'Admin', date: new Date('2025-01-05') },
      { title: 'Elektr energiya', amount: 800000, category: 'Kommunal to\'lovlar', note: 'Dekabr oyi', createdBy: adminId, createdByName: 'Admin', date: new Date('2025-01-10') },
      { title: 'Internet', amount: 300000, category: 'Kommunal to\'lovlar', note: 'Yanvar oyi', createdBy: adminId, createdByName: 'Admin', date: new Date('2025-01-15') },
      { title: 'Reklama (Instagram)', amount: 1500000, category: 'Reklama', note: 'Yanvar kampaniyasi', createdBy: adminId, createdByName: 'Admin', date: today },
    ]);

    // 8. NASIYA
    const customerId1 = customers.insertedIds[1];
    const customerId2 = customers.insertedIds[3];
    
    await db.collection('nasiyas').insertMany([
      {
        customer: customerId1,
        customerName: 'Karimova Dilnoza',
        customerPhone: '+998902222222',
        totalAmount: 500000,
        paidAmount: 0,
        remainingAmount: 500000,
        status: 'open',
        dueDate: new Date('2025-02-15'),
        payments: [],
        date: new Date('2025-01-15'),
      },
      {
        customer: customerId2,
        customerName: 'Toshmatova Nigora',
        customerPhone: '+998904444444',
        totalAmount: 1500000,
        paidAmount: 300000,
        remainingAmount: 1200000,
        status: 'open',
        dueDate: new Date('2025-02-20'),
        payments: [
          { amount: 300000, date: new Date('2025-01-20'), note: 'Birinchi to\'lov' },
        ],
        date: new Date('2025-01-10'),
      },
    ]);

    // 9. WAREHOUSE
    await db.collection('warehouses').insertMany([
      { name: 'Lenovo IdeaPad 3 15ALC6', category: 'Noutbuk', quantity: 5, buyPrice: 5200000, sellPrice: 5900000, supplierName: 'TechnoMarket LLC', status: 'in_warehouse', createdAt: new Date() },
      { name: 'Dell Inspiron 15 3511', category: 'Noutbuk', quantity: 3, buyPrice: 5500000, sellPrice: 6200000, supplierName: 'TechnoMarket LLC', status: 'in_warehouse', createdAt: new Date() },
      { name: 'TP-Link USB Wi-Fi Adapter', category: 'Aksessuar', quantity: 15, buyPrice: 80000, sellPrice: 120000, supplierName: 'Aksessuar Plus', status: 'in_warehouse', createdAt: new Date() },
    ]);

    // 10. ORDERS
    await db.collection('orders').insertMany([
      {
        yordamchi: users.insertedIds[2],
        yordamchiName: 'Yordamchi Bobur',
        customerName: 'Ergashev Otabek',
        customerPhone: '+998905555555',
        items: [
          { productId: productIds[3], name: 'Acer Aspire 5 A515-56', quantity: 1, sellPrice: 5500000 },
        ],
        total: 5500000,
        status: 'pending',
        createdAt: today,
      },
      {
        yordamchi: users.insertedIds[2],
        yordamchiName: 'Yordamchi Bobur',
        customerName: 'Aliyev Sardor',
        customerPhone: '+998901111111',
        items: [
          { productId: productIds[5], name: 'Apple MacBook Air M2 13"', quantity: 1, sellPrice: 14500000 },
          { productId: productIds[6], name: 'Logitech MX Keys Wireless', quantity: 1, sellPrice: 450000 },
        ],
        total: 14950000,
        status: 'pending',
        createdAt: yesterday,
      },
    ]);

    // 11. SETTINGS
    await db.collection('settings').deleteMany({});
    await db.collection('settings').insertOne({
      shopName: 'Noutbuk ERP',
      address: 'Toshkent sh., Chilonzor tumani, Bunyodkor ko\'chasi 1-uy',
      phone: '+998 71 234 56 78',
      checkText: 'Xaridingiz uchun rahmat! Bizni tanlaganingiz uchun minnatdormiz.',
      categories: ['Noutbuk', 'Aksessuar', 'Telefon', 'Boshqa'],
      telegramBotToken: '',
      telegramChatId: '',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Demo ma\'lumotlar muvaffaqiyatli qo\'shildi!',
      stats: {
        users: 3,
        products: 10,
        customers: 5,
        suppliers: 3,
        workers: 3,
        sales: 3,
        expenses: 4,
        nasiya: 2,
        warehouse: 3,
        orders: 2
      }
    });
  } catch (error: any) {
    console.error('Seed demo error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
