// Test MongoDB connection
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function testConnection() {
  try {
    console.log('🔌 MongoDB ga ulanmoqda...');
    console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    
    console.log('✅ MongoDB ulanish muvaffaqiyatli!\n');
    
    const db = mongoose.connection.db!;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('📦 Mavjud kolleksiyalar:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`   - ${col.name}: ${count} ta yozuv`);
    }
    
    console.log('\n✅ Database ishlayapti!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Xatolik:', error.message);
    console.error('\nSabablari:');
    console.error('1. Internet ulanishi yo\'q');
    console.error('2. MongoDB Atlas IP whitelist sozlanmagan');
    console.error('3. MongoDB URI noto\'g\'ri');
    process.exit(1);
  }
}

testConnection();
