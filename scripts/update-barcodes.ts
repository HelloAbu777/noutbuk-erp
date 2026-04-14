import connectDB from '../lib/mongoose';
import Product from '../models/Product';

async function updateBarcodes() {
  try {
    await connectDB();
    console.log('✅ Database ulandi');

    // Barcha mahsulotlarni olish
    const products = await Product.find().sort({ createdAt: 1 });
    console.log(`📦 Jami ${products.length} ta mahsulot topildi`);

    let updated = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newBarcode = String(i + 1).padStart(6, '0'); // 000001, 000002, ...

      // Agar barkod yo'q yoki 6 raqamli emas bo'lsa, yangilash
      if (!product.barcode || product.barcode.length !== 6) {
        await Product.findByIdAndUpdate(product._id, { barcode: newBarcode });
        console.log(`✓ ${product.name}: ${product.barcode || 'yo\'q'} → ${newBarcode}`);
        updated++;
      } else {
        console.log(`⊘ ${product.name}: ${product.barcode} (o'zgartirilmadi)`);
        skipped++;
      }
    }

    console.log('\n📊 Natija:');
    console.log(`   Yangilandi: ${updated} ta`);
    console.log(`   O'tkazildi: ${skipped} ta`);
    console.log('✅ Tayyor!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Xato:', error);
    process.exit(1);
  }
}

updateBarcodes();
