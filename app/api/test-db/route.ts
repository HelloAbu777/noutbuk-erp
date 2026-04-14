import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Faqat admin tekshira oladi' }, { status: 401 });
  }

  try {
    await connectDB();
    const db = mongoose.connection.db!;
    
    // Get all collections with counts
    const collections = await db.listCollections().toArray();
    const stats: Record<string, number> = {};
    
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      stats[col.name] = count;
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Database ishlayapti!',
      collections: stats,
      totalCollections: collections.length
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      hint: 'MongoDB ulanish muammosi - internet yoki IP whitelist tekshiring'
    }, { status: 500 });
  }
}
