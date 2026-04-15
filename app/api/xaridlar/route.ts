import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: any = {};
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const purchases = await prisma.purchase.findMany({
    where,
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(purchases.map(p => ({ ...p, _id: p.id })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { supplierId, supplierName, productName, category, quantity, buyPrice, sellPrice, paidAmount, note } = body;

  let finalSupplierName = supplierName || "Noma'lum";

  if (supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (supplier) finalSupplierName = supplier.companyName;
  }

  const totalAmount = Number(buyPrice) * Number(quantity);

  const purchase = await prisma.purchase.create({
    data: {
      supplierId: supplierId || null,
      supplierName: finalSupplierName,
      productName, category,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      totalAmount,
      paidAmount: Number(paidAmount) || 0,
      note: note || null,
      createdById: session.user.id,
      createdByName: session.user.name,
    },
  });

  // Omborga avtomatik qo'shish
  await prisma.warehouse.create({
    data: {
      name: productName, category,
      quantity: Number(quantity),
      buyPrice: Number(buyPrice),
      sellPrice: Number(sellPrice),
      purchaseId: purchase.id,
      supplierName: finalSupplierName,
      status: 'in_warehouse',
    },
  });

  // Ta'minotchi statistikasini yangilash
  if (supplierId) {
    await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        totalPurchased: { increment: totalAmount },
        totalPaid: { increment: Number(paidAmount) || 0 },
      },
    });
  }

  return NextResponse.json({ ...purchase, _id: purchase.id }, { status: 201 });
}
