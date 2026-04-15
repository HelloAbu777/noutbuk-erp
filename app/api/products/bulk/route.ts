import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH /api/products/bulk — ommaviy kirim: bir nechta mahsulotni omborga qo'shish
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { updates } = await req.json() as { updates: { id: string; addQty: number }[] };
  if (!Array.isArray(updates) || updates.length === 0)
    return NextResponse.json({ error: "Ma'lumot yo'q" }, { status: 400 });

  for (const { id, addQty } of updates) {
    if (!addQty || addQty <= 0) continue;
    
    // Get product details
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) continue;
    
    // Add to warehouse instead of directly to product
    await prisma.warehouse.create({
      data: {
        name: product.name,
        category: product.category,
        quantity: addQty,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        supplierName: 'Ommaviy kirim',
        status: 'in_warehouse',
      },
    });
  }

  return NextResponse.json({ success: true });
}
