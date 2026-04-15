import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.warehouse.findMany({
    where: { status: 'in_warehouse' },
    orderBy: { createdAt: 'desc' },
  });
  
  // Transform id to _id for backward compatibility
  const transformed = items.map(i => ({ ...i, _id: i.id }));
  return NextResponse.json(transformed);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  
  // Generate barcode if not provided - check both Warehouse and Product collections
  if (!body.barcode) {
    const [warehouseItems, products] = await Promise.all([
      prisma.warehouse.findMany({
        where: { barcode: { not: null } },
        select: { barcode: true },
      }),
      prisma.product.findMany({
        where: { barcode: { not: null } },
        select: { barcode: true },
      }),
    ]);
    
    const existingBarcodes = new Set([
      ...warehouseItems.map(i => i.barcode).filter(b => b && /^\d{6}$/.test(b)),
      ...products.map(p => p.barcode).filter(b => b && /^\d{6}$/.test(b)),
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
  
  const item = await prisma.warehouse.create({ data: body });
  const transformed = { ...item, _id: item.id };
  return NextResponse.json(transformed, { status: 201 });
}
