import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Purchase from '@/models/Purchase';
import Supplier from '@/models/Supplier';
import Warehouse from '@/models/Warehouse';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const filter: any = {};
  if (from) filter.date = { $gte: new Date(from) };
  if (to) filter.date = { ...filter.date, $lte: new Date(to) };

  await connectDB();
  const purchases = await Purchase.find(filter).sort({ date: -1 }).lean();
  return NextResponse.json(purchases);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { supplierId, supplierName, productName, category, quantity, buyPrice, sellPrice, paidAmount, note } = body;

  await connectDB();

  let supplier = null;
  let finalSupplierName = supplierName || 'Noma\'lum';
  
  if (supplierId) {
    supplier = await Supplier.findById(supplierId);
    if (supplier) {
      finalSupplierName = supplier.companyName;
    }
  }

  const totalAmount = buyPrice * quantity;
  const purchase = await Purchase.create({
    supplier: supplier?._id,
    supplierName: finalSupplierName,
    productName, category, quantity, buyPrice, sellPrice,
    totalAmount, paidAmount: paidAmount || 0,
    note,
    createdBy: session.user.id,
    createdByName: session.user.name,
    date: new Date(),
  });

  // Auto add to warehouse
  await Warehouse.create({
    name: productName, category, quantity, buyPrice, sellPrice,
    purchaseId: purchase._id,
    supplierName: finalSupplierName,
    status: 'in_warehouse',
  });

  // Update supplier totals if supplier exists
  if (supplier) {
    await Supplier.findByIdAndUpdate(supplierId, {
      $inc: { totalPurchased: totalAmount, totalPaid: paidAmount || 0 },
    });
  }

  return NextResponse.json(purchase, { status: 201 });
}
