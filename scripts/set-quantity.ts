// Script to set all product quantities to 100
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

async function setQuantity() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection failed');

    console.log('\n📦 Setting all product quantities to 100...');

    // Set all product quantities to 100
    const result = await db.collection('products').updateMany(
      {},
      { $set: { quantity: 100 } }
    );
    
    console.log(`✅ ${result.modifiedCount} ta mahsulot miqdori 100 ga o'zgartirildi!`);
    
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
}

setQuantity();
