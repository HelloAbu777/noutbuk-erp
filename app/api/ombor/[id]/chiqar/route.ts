import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Warehouse from '@/models/Warehouse';
import Product from '@/models/Product';

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const item = await Warehouse.findById(id);
  if (!item) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  if (item.status === 'sent_to_shop') {
    return NextResponse.json({ error: "Allaqachon do'konga chiqarilgan" }, { status: 400 });
  }

  const existing = await Product.findOne({ name: item.name });
  if (existing) {
    await Product.findByIdAndUpdate(existing._id, {
      $inc: { quantity: item.quantity },
      $set: { buyPrice: item.buyPrice, sellPrice: item.sellPrice },
    });
  } else {
    await Product.create({
      name: item.name,
      category: item.category,
      buyPrice: item.buyPrice,
      sellPrice: item.sellPrice,
      quantity: item.quantity,
      barcode: item.barcode,
      description: item.description,
      status: 'active',
    });
  }

  await Warehouse.findByIdAndUpdate(id, { status: 'sent_to_shop', sentAt: new Date() });
  return NextResponse.json({ success: true });
}
