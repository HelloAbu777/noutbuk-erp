// Script to reset all transaction data to 0
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI topilmadi. .env.local faylini tekshiring.');
  process.exit(1);
}

async function resetData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection failed');

    console.log('\n🗑️  Deleting all transaction data...');

    // Delete all collections
    const collections = [
      'sales',
      'purchases', 
      'expenses',
      'nasiyas',
      'orders',
      'messages',
      'warehouses',
    ];

    for (const collectionName of collections) {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`   ✓ ${collectionName}: ${result.deletedCount} ta o'chirildi`);
    }

    // Reset product quantities to 0
    const productsResult = await db.collection('products').updateMany(
      {},
      { $set: { quantity: 0 } }
    );
    console.log(`   ✓ products: ${productsResult.modifiedCount} ta mahsulot miqdori 0 ga qaytarildi`);

    // Reset customer debts to 0
    const customersResult = await db.collection('customers').updateMany(
      {},
      { $set: { debt: 0 } }
    );
    console.log(`   ✓ customers: ${customersResult.modifiedCount} ta mijoz qarzi 0 ga qaytarildi`);

    console.log('\n✅ Barcha ma\'lumotlar muvaffaqiyatli tozalandi!');
    
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
}

resetData();
