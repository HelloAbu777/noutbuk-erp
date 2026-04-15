import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Faqat admin demo qo'sha oladi" }, { status: 401 });
  }

  try {
    // 1. USERS
    const [hashedAdmin, hashedKassir, hashedYordam] = await Promise.all([
      bcrypt.hash('admin123', 10),
      bcrypt.hash('kassir123', 10),
      bcrypt.hash('yordam123', 10),
    ]);

    await prisma.user.deleteMany({ where: { email: { in: ['admin', 'kassir', 'yordam'] } } });
    const [adminUser, , yordamUser] = await Promise.all([
      prisma.user.create({ data: { name: 'Admin', email: 'admin', password: hashedAdmin, role: 'admin' } }),
      prisma.user.create({ data: { name: 'Kassir Aziza', email: 'kassir', password: hashedKassir, role: 'kassir' } }),
      prisma.user.create({ data: { name: 'Yordamchi Bobur', email: 'yordam', password: hashedYordam, role: 'yordamchi' } }),
    ]);

    // 2. PRODUCTS
    const productData = [
      { name: 'Asus VivoBook 15 X1500EA', category: 'Noutbuk', buyPrice: 4500000, sellPrice: 5200000, quantity: 15, barcode: '000001' },
      { name: 'HP 15s-fq5000', category: 'Noutbuk', buyPrice: 3800000, sellPrice: 4400000, quantity: 12, barcode: '000002' },
      { name: 'Lenovo IdeaPad 3 15ALC6', category: 'Noutbuk', buyPrice: 5200000, sellPrice: 5900000, quantity: 8, barcode: '000003' },
      { name: 'Acer Aspire 5 A515-56', category: 'Noutbuk', buyPrice: 4800000, sellPrice: 5500000, quantity: 10, barcode: '000004' },
      { name: 'Dell Inspiron 15 3511', category: 'Noutbuk', buyPrice: 5500000, sellPrice: 6200000, quantity: 6, barcode: '000005' },
      { name: 'Apple MacBook Air M2 13"', category: 'Noutbuk', buyPrice: 12000000, sellPrice: 14500000, quantity: 3, barcode: '000006' },
      { name: 'Logitech MX Keys Wireless', category: 'Aksessuar', buyPrice: 350000, sellPrice: 450000, quantity: 20, barcode: '000007' },
      { name: 'HP USB Optical Mouse', category: 'Aksessuar', buyPrice: 55000, sellPrice: 80000, quantity: 35, barcode: '000008' },
      { name: 'TP-Link USB Wi-Fi Adapter', category: 'Aksessuar', buyPrice: 80000, sellPrice: 120000, quantity: 25, barcode: '000009' },
      { name: 'SanDisk 256GB USB Flash Drive', category: 'Aksessuar', buyPrice: 95000, sellPrice: 140000, quantity: 30, barcode: '000010' },
    ];
    const products = await Promise.all(productData.map(p => prisma.product.create({ data: p })));

    // 3. CUSTOMERS
    const [cust1, cust2, , cust4] = await Promise.all([
      prisma.customer.create({ data: { name: 'Aliyev Sardor', phone: '+998901111111', address: 'Toshkent, Chilonzor', debt: 0 } }),
      prisma.customer.create({ data: { name: 'Karimova Dilnoza', phone: '+998902222222', address: 'Toshkent, Yunusobod', debt: 500000 } }),
      prisma.customer.create({ data: { name: 'Rahimov Jasur', phone: '+998903333333', address: "Toshkent, Mirzo Ulug'bek", debt: 0 } }),
      prisma.customer.create({ data: { name: 'Toshmatova Nigora', phone: '+998904444444', address: 'Toshkent, Yakkasaroy', debt: 1200000 } }),
      prisma.customer.create({ data: { name: 'Ergashev Otabek', phone: '+998905555555', address: 'Toshkent, Sergeli', debt: 0 } }),
    ]);

    // 4. SUPPLIERS
    await Promise.all([
      prisma.supplier.create({ data: { companyName: 'TechnoMarket LLC', contactPerson: 'Azimov Akmal', phone: '+998712345678', address: 'Toshkent, Sergeli', totalPurchased: 25000000, totalPaid: 20000000 } }),
      prisma.supplier.create({ data: { companyName: 'Digital World', contactPerson: 'Karimov Sherzod', phone: '+998712345679', address: 'Toshkent, Chilonzor', totalPurchased: 15000000, totalPaid: 15000000 } }),
      prisma.supplier.create({ data: { companyName: 'Aksessuar Plus', contactPerson: 'Tursunova Malika', phone: '+998712345680', address: 'Toshkent, Yunusobod', totalPurchased: 5000000, totalPaid: 4500000 } }),
    ]);

    // 5. WORKERS
    await Promise.all([
      prisma.worker.create({ data: { name: 'Abdullayev Javohir', phone: '+998906666666', position: 'Sotuvchi', salary: 3000000 } }),
      prisma.worker.create({ data: { name: 'Yusupova Madina', phone: '+998907777777', position: 'Kassa', salary: 2800000 } }),
      prisma.worker.create({ data: { name: 'Saidov Bekzod', phone: '+998908888888', position: 'Ombor', salary: 2500000 } }),
    ]);

    // 6. SALES
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);

    await Promise.all([
      prisma.sale.create({
        data: {
          total: 4480000, totalCost: 3855000, paymentType: 'naqt',
          createdById: adminUser.id, createdByName: 'Admin', date: today,
          items: { create: [
            { productId: products[1].id, productName: 'HP 15s-fq5000', quantity: 1, buyPrice: 3800000, sellPrice: 4400000 },
            { productId: products[7].id, productName: 'HP USB Optical Mouse', quantity: 1, buyPrice: 55000, sellPrice: 80000 },
          ]},
        },
      }),
      prisma.sale.create({
        data: {
          total: 10400000, totalCost: 9000000, paymentType: 'karta', kartaAmount: 10400000,
          createdById: adminUser.id, createdByName: 'Admin', date: yesterday,
          items: { create: [
            { productId: products[0].id, productName: 'Asus VivoBook 15 X1500EA', quantity: 2, buyPrice: 4500000, sellPrice: 5200000 },
          ]},
        },
      }),
      prisma.sale.create({
        data: {
          total: 1630000, totalCost: 1240000, paymentType: 'naqt',
          createdById: adminUser.id, createdByName: 'Kassir Aziza', date: twoDaysAgo,
          items: { create: [
            { productId: products[6].id, productName: 'Logitech MX Keys Wireless', quantity: 3, buyPrice: 350000, sellPrice: 450000 },
            { productId: products[9].id, productName: 'SanDisk 256GB USB Flash Drive', quantity: 2, buyPrice: 95000, sellPrice: 140000 },
          ]},
        },
      }),
    ]);

    // 7. EXPENSES
    await Promise.all([
      prisma.expense.create({ data: { title: "Ijara to'lovi", amount: 5000000, category: 'Ijara', date: new Date('2025-01-05') } }),
      prisma.expense.create({ data: { title: 'Elektr energiya', amount: 800000, category: "Kommunal to'lovlar", date: new Date('2025-01-10') } }),
      prisma.expense.create({ data: { title: 'Internet', amount: 300000, category: "Kommunal to'lovlar", date: new Date('2025-01-15') } }),
      prisma.expense.create({ data: { title: 'Reklama (Instagram)', amount: 1500000, category: 'Reklama', date: today } }),
    ]);

    // 8. NASIYA
    await Promise.all([
      prisma.nasiya.create({ data: { customerId: cust2.id, customerName: 'Karimova Dilnoza', totalAmount: 500000, paidAmount: 0, remainingAmount: 500000, status: 'active', dueDate: new Date('2025-02-15') } }),
      prisma.nasiya.create({ data: { customerId: cust4.id, customerName: 'Toshmatova Nigora', totalAmount: 1500000, paidAmount: 300000, remainingAmount: 1200000, status: 'active', dueDate: new Date('2025-02-20') } }),
    ]);

    // 9. WAREHOUSE
    await Promise.all([
      prisma.warehouse.create({ data: { name: 'Lenovo IdeaPad 3 15ALC6', category: 'Noutbuk', quantity: 5, buyPrice: 5200000, sellPrice: 5900000, supplierName: 'TechnoMarket LLC' } }),
      prisma.warehouse.create({ data: { name: 'Dell Inspiron 15 3511', category: 'Noutbuk', quantity: 3, buyPrice: 5500000, sellPrice: 6200000, supplierName: 'TechnoMarket LLC' } }),
      prisma.warehouse.create({ data: { name: 'TP-Link USB Wi-Fi Adapter', category: 'Aksessuar', quantity: 15, buyPrice: 80000, sellPrice: 120000, supplierName: 'Aksessuar Plus' } }),
    ]);

    // 10. ORDERS
    await Promise.all([
      prisma.order.create({
        data: {
          yordamchiId: yordamUser.id, yordamchiName: 'Yordamchi Bobur',
          customerName: 'Ergashev Otabek', customerPhone: '+998905555555',
          totalAmount: 5500000, advancePayment: 0, remainingAmount: 5500000,
          items: { create: [{ productId: products[3].id, productName: 'Acer Aspire 5 A515-56', quantity: 1, price: 5500000 }] },
        },
      }),
      prisma.order.create({
        data: {
          yordamchiId: yordamUser.id, yordamchiName: 'Yordamchi Bobur',
          customerName: 'Aliyev Sardor', customerPhone: '+998901111111',
          totalAmount: 14950000, advancePayment: 0, remainingAmount: 14950000,
          items: { create: [
            { productId: products[5].id, productName: 'Apple MacBook Air M2 13"', quantity: 1, price: 14500000 },
            { productId: products[6].id, productName: 'Logitech MX Keys Wireless', quantity: 1, price: 450000 },
          ]},
        },
      }),
    ]);

    // 11. SETTINGS
    const existing = await prisma.settings.findFirst();
    if (!existing) {
      await prisma.settings.create({ data: { shopName: 'Noutbuk ERP', address: "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi 1-uy", phone: '+998 71 234 56 78' } });
    }

    return NextResponse.json({
      success: true,
      message: "Demo ma'lumotlar muvaffaqiyatli qo'shildi!",
      stats: { users: 3, products: 10, customers: 5, suppliers: 3, workers: 3, sales: 3, expenses: 4, nasiya: 2, warehouse: 3, orders: 2 },
    });
  } catch (error: any) {
    console.error('Seed demo error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
