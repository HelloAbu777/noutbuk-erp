// Script to check and fix archived products in database
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

async function fixArchivedProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection failed');

    console.log('\n📦 Checking products...');

    // Count all products
    const allProducts = await db.collection('products').find({}).toArray();
    console.log(`   Total products: ${allProducts.length}`);

    // Count active products
    const activeProducts = await db.collection('products').find({ status: 'active' }).toArray();
    console.log(`   Active products: ${activeProducts.length}`);

    // Count archived products
    const archivedProducts = await db.collection('products').find({ status: 'archived' }).toArray();
    console.log(`   Archived products: ${archivedProducts.length}`);

    // Count products without status field
    const noStatusProducts = await db.collection('products').find({ status: { $exists: false } }).toArray();
    console.log(`   Products without status: ${noStatusProducts.length}`);

    if (noStatusProducts.length > 0) {
      console.log('\n🔧 Fixing products without status field...');
      const result = await db.collection('products').updateMany(
        { status: { $exists: false } },
        { $set: { status: 'active' } }
      );
      console.log(`   ✓ Fixed ${result.modifiedCount} products`);
    }

    if (archivedProducts.length > 0) {
      console.log('\n📋 Archived products:');
      archivedProducts.forEach((p: any) => {
        console.log(`   - ${p.name} (ID: ${p._id})`);
      });
      
      console.log('\n⚠️  Do you want to permanently delete archived products?');
      console.log('   Run with --delete flag to delete them');
      
      if (process.argv.includes('--delete')) {
        const deleteResult = await db.collection('products').deleteMany({ status: 'archived' });
        console.log(`   ✓ Deleted ${deleteResult.deletedCount} archived products`);
      }
    }

    console.log('\n✅ Check complete!');
    
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Xatolik:', error);
    process.exit(1);
  }
}

fixArchivedProducts();
