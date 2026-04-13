import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Purchase from '@/models/Purchase';
import Warehouse from '@/models/Warehouse';
import Supplier from '@/models/Supplier';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  // Find the purchase
  const purchase = await Purchase.findById(id);
  if (!purchase) {
    return NextResponse.json({ error: 'Xarid topilmadi' }, { status: 404 });
  }

  // Remove from warehouse if exists
  await Warehouse.deleteOne({ purchaseId: id });

  // Update supplier totals
  if (purchase.supplier) {
    await Supplier.findByIdAndUpdate(purchase.supplier, {
      $inc: {
        totalPurchased: -purchase.totalAmount,
        totalPaid: -purchase.paidAmount,
      },
    });
  }

  // Delete the purchase
  await Purchase.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
