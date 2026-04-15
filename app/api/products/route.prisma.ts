// YANGI VERSIYA - PostgreSQL + Prisma
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { status: 'active' },
    orderBy: { name: 'asc' },
  });
  
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  
  // Generate barcode if not provided
  if (!body.barcode) {
    // Get all existing barcodes
    const existingProducts = await prisma.product.findMany({
      where: {
        barcode: { not: null },
      },
      select: { barcode: true },
    });
    
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
  
  const product = await prisma.product.create({
    data: body,
  });
  
  return NextResponse.json(product, { status: 201 });
}
