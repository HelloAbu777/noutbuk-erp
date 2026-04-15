import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendToCustomer } from '@/lib/telegram';

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const today = searchParams.get('today');

  if (today) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const sales = await prisma.sale.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      include: { items: true },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(sales);
  }

  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { items, paymentType, customerId, naqtAmount, kartaAmount } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Savat bo'sh" }, { status: 400 });
  }
  if (!['naqt', 'karta', 'nasiya', 'aralash'].includes(paymentType)) {
    return NextResponse.json({ error: "To'lov turi noto'g'ri" }, { status: 400 });
  }
  if (paymentType === 'nasiya' && !customerId) {
    return NextResponse.json({ error: 'Nasiya uchun mijoz tanlash shart' }, { status: 400 });
  }

  // Validate products & quantity
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || product.status === 'archived') {
      return NextResponse.json(
        { error: `Mahsulot topilmadi: ${item.productName}` },
        { status: 400 }
      );
    }
    if (product.quantity < item.quantity) {
      return NextResponse.json(
        { error: `${product.name} da yetarli miqdor yo'q. Mavjud: ${product.quantity}` },
        { status: 400 }
      );
    }
  }

  let customer = null;
  if (customerId) {
    customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: 'Mijoz topilmadi' }, { status: 400 });
    }
  }

  let total = 0;
  let totalCost = 0;
  const saleItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;
    
    total += product.sellPrice * item.quantity;
    totalCost += product.buyPrice * item.quantity;

    saleItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { quantity: { decrement: item.quantity } },
    });
  }

  // Validate aralash amounts
  if (paymentType === 'aralash') {
    const naqt = Number(naqtAmount) || 0;
    const karta = Number(kartaAmount) || 0;
    if (Math.abs(naqt + karta - total) > 1) {
      return NextResponse.json(
        { error: `To'lov summasi mos kelmaydi. Naqt + Karta = ${(naqt + karta).toLocaleString()}, Jami = ${total.toLocaleString()}` },
        { status: 400 }
      );
    }
  }

  const sale = await prisma.sale.create({
    data: {
      total,
      totalCost,
      paymentType,
      naqtAmount: paymentType === 'aralash' ? Number(naqtAmount) : undefined,
      kartaAmount: paymentType === 'aralash' ? Number(kartaAmount) : undefined,
      customerId: customer?.id,
      customerName: customer?.name,
      createdById: session.user.id,
      createdByName: session.user.name,
      date: new Date(),
      items: {
        create: saleItems,
      },
    },
    include: { items: true },
  });

  if (paymentType === 'nasiya' && customer) {
    await prisma.customer.update({
      where: { id: customer.id },
      data: { debt: { increment: total } },
    });
    
    await prisma.nasiya.create({
      data: {
        customerId: customer.id,
        customerName: customer.name,
        saleId: sale.id,
        totalAmount: total,
        paidAmount: 0,
        remainingAmount: total,
        status: 'active',
      },
    });

    // Mijozga avtomatik xabar
    const itemList = saleItems.map(i => `• ${i.productName} × ${i.quantity}`).join('\n');
    const msgText = `🛍️ Nasiya rasmiylashtirildi!\n\n${itemList}\n\nJami qarz: ${fmt(total)}\n\nIloji boricha tez to'lang!`;
    await sendToCustomer({
      customerName: customer.name,
      customerPhone: customer.phone,
      type: 'sotuv_tasdiq',
      messageText: msgText,
      createdById: session.user.id,
      createdByName: session.user.name,
    });
  }

  return NextResponse.json({ success: true, saleId: sale.id, total }, { status: 201 });
}
