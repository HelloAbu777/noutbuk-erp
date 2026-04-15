import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Warehouse from '@/models/Warehouse';
import mongoose from 'mongoose';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const items = await Warehouse.find({ status: 'in_warehouse' }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await connectDB();
  
  // Generate barcode if not provided - check both Warehouse and Product collections
  if (!body.barcode) {
    const [warehouseItems, products] = await Promise.all([
      Warehouse.find({ barcode: { $exists: true, $ne: null } }).select('barcode').lean(),
      mongoose.connection.db!.collection('products').find(
        { barcode: { $exists: true, $ne: null } },
        { projection: { barcode: 1 } }
      ).toArray()
    ]);
    
    const existingBarcodes = new Set([
      ...warehouseItems.map(i => i.barcode).filter(b => b && /^\d{6}$/.test(b)),
      ...products.map((p: any) => p.barcode).filter(b => b && /^\d{6}$/.test(b))
    ]);
    
    // Find first available barcode starting from 000001
    let newBarcode = '';
    for (let i = 1; i <= 999999; i++) {
      const candidate = String(i).padStart(6, '0');
      if (!existingBarcodes.has(candidate)) {
        newBarcode = candidate;
        break;
      }
    }
    
    body.barcode = newBarcode || String(Date.now()).slice(-6); // Fallback
  }
  
  const item = await Warehouse.create(body);
  return NextResponse.json(item, { status: 201 });
}
