// PostgreSQL test script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 PostgreSQL ulanishini tekshirish...\n');

  try {
    // 1. Database connection test
    await prisma.$connect();
    console.log('✅ PostgreSQL ga ulanish muvaffaqiyatli!\n');

    // 2. Count tables
    const productCount = await prisma.product.count();
    const customerCount = await prisma.customer.count();
    const saleCount = await prisma.sale.count();
    const warehouseCount = await prisma.warehouse.count();

    console.log('📊 Database statistikasi:');
    console.log(`   - Mahsulotlar: ${productCount} ta`);
    console.log(`   - Mijozlar: ${customerCount} ta`);
    console.log(`   - Sotuvlar: ${saleCount} ta`);
    console.log(`   - Ombor: ${warehouseCount} ta\n`);

    // 3. Test create product
    console.log('🧪 Test mahsulot yaratish...');
    const testProduct = await prisma.product.create({
      data: {
        name: 'Test Laptop',
        category: 'Noutbuk',
        buyPrice: 1000,
        sellPrice: 1200,
        quantity: 5,
        barcode: '999999',
        status: 'active',
      },
    });
    console.log(`✅ Test mahsulot yaratildi: ${testProduct.name} (ID: ${testProduct.id})\n`);

    // 4. Test read
    const products = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    console.log(`📦 So'nggi ${products.length} ta mahsulot:`);
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.barcode}) - ${p.quantity} ta`);
    });
    console.log('');

    // 5. Test delete
    await prisma.product.delete({
      where: { id: testProduct.id },
    });
    console.log('✅ Test mahsulot o\'chirildi\n');

    console.log('🎉 PostgreSQL to\'liq ishlamoqda!');
    console.log('🚀 Barcha operatsiyalar muvaffaqiyatli!\n');

  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
