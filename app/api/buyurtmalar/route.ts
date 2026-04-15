import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });
  return NextResponse.json(orders.map(o => ({ ...o, _id: o.id })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { customerName, customerPhone, totalAmount, advancePayment, deliveryDate, note, items } = body;

  const remaining = Number(totalAmount) - Number(advancePayment || 0);

  const order = await prisma.order.create({
    data: {
      yordamchiId: session.user.id,
      yordamchiName: session.user.name,
      customerName,
      customerPhone,
      totalAmount: Number(totalAmount),
      advancePayment: Number(advancePayment) || 0,
      remainingAmount: remaining,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      note: note || null,
      status: 'pending',
      items: items?.length ? {
        create: items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      } : undefined,
    },
    include: { items: true },
  });
  return NextResponse.json({ ...order, _id: order.id }, { status: 201 });
}
