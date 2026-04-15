import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const purchase = await prisma.purchase.findUnique({ where: { id } });
  if (!purchase) return NextResponse.json({ error: 'Xarid topilmadi' }, { status: 404 });

  // Ombordan o'chirish
  await prisma.warehouse.deleteMany({ where: { purchaseId: id } });

  // Ta'minotchi statistikasini qaytarish
  if (purchase.supplierId) {
    await prisma.supplier.update({
      where: { id: purchase.supplierId },
      data: {
        totalPurchased: { decrement: purchase.totalAmount },
        totalPaid: { decrement: purchase.paidAmount },
      },
    });
  }

  await prisma.purchase.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
