import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'asc' } });

    let updated = 0;
    let skipped = 0;
    const updates = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const newBarcode = String(i + 1).padStart(6, '0');

      if (!product.barcode || product.barcode.length !== 6) {
        await prisma.product.update({
          where: { id: product.id },
          data: { barcode: newBarcode },
        });
        updates.push({ name: product.name, oldBarcode: product.barcode || "yo'q", newBarcode });
        updated++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({ success: true, total: products.length, updated, skipped, updates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
