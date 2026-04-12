import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Nasiya from '@/models/Nasiya';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const sale = await Sale.findById(id);
  if (!sale) return NextResponse.json({ error: 'Sotuv topilmadi' }, { status: 404 });
  if (sale.status === 'returned') return NextResponse.json({ error: 'Bu sotuv allaqachon qaytarilgan' }, { status: 400 });

  // Inventarni tiklash
  for (const item of sale.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });
  }

  // Nasiya bo'lsa — qarzni kamaytirish va nasiya holatini yangilash
  if (sale.paymentType === 'nasiya' && sale.customer) {
    await Customer.findByIdAndUpdate(sale.customer, { $inc: { debt: -sale.total } });
    await Nasiya.findOneAndUpdate(
      { sale: sale._id },
      { status: 'paid', paidAmount: sale.total, remainingAmount: 0 }
    );
  }

  sale.status = 'returned';
  sale.returnedAt = new Date();
  await sale.save();

  return NextResponse.json({ success: true });
}
