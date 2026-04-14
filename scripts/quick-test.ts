// Quick database test
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function quickTest() {
  console.log('🔍 Database tekshirilmoqda...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      serverSelectionTimeoutMS: 3000,
    });
    
    const db = mongoose.connection.db!;
    const collections = await db.listCollections().toArray();
    
    console.log('✅ DATABASE ISHLAYAPTI!\n');
    console.log('📊 Kolleksiyalar:');
    
    let total = 0;
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      total += count;
      console.log(`   ${col.name}: ${count} ta`);
    }
    
    console.log(`\n📈 JAMI: ${collections.length} ta kolleksiya, ${total} ta yozuv\n`);
    console.log('✅ HA, DATABASE TO\'G\'RI ISHLAYAPTI!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.log('❌ YO\'Q, DATABASE ISHLAMAYAPTI!\n');
    console.log('Xato:', error.message);
    console.log('\nSabab: Internet yoki MongoDB Atlas muammosi');
    process.exit(1);
  }
}

quickTest();
