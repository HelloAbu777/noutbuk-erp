import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const products = await Product.find({ status: 'active' }).sort({ name: 1 }).lean();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await connectDB();
  
  // Generate barcode if not provided
  if (!body.barcode) {
    // Get all existing barcodes
    const existingProducts = await Product.find({ barcode: { $exists: true, $ne: null } })
      .select('barcode')
      .lean();
    
    const existingBarcodes = new Set(
      existingProducts
        .map(p => p.barcode)
        .filter(b => b && /^\d{6}$/.test(b)) // Only 6-digit barcodes
    );
    
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
  
  const product = await Product.create(body);
  return NextResponse.json(product, { status: 201 });
}
