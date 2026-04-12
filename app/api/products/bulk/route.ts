import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';

// PATCH /api/products/bulk — ommaviy kirim: bir nechta mahsulotga miqdor qo'shish
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { updates } = await req.json() as { updates: { id: string; addQty: number }[] };
  if (!Array.isArray(updates) || updates.length === 0)
    return NextResponse.json({ error: "Ma'lumot yo'q" }, { status: 400 });

  await connectDB();

  for (const { id, addQty } of updates) {
    if (!addQty || addQty <= 0) continue;
    await Product.findByIdAndUpdate(id, { $inc: { quantity: addQty } });
  }

  return NextResponse.json({ success: true });
}
