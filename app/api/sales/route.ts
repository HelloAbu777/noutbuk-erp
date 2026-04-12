import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import Nasiya from '@/models/Nasiya';
import { sendToCustomer } from '@/lib/telegram';

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const today = searchParams.get('today');

  if (today) {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const sales = await Sale.find({ date: { $gte: start, $lte: end } })
      .sort({ date: -1 })
      .lean();
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

  await connectDB();

  // Validate products & quantity
  for (const item of items) {
    const product = await Product.findById(item.productId);
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
    customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ error: 'Mijoz topilmadi' }, { status: 400 });
    }
  }

  let total = 0;
  let totalCost = 0;
  const saleItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    total += product.sellPrice * item.quantity;
    totalCost += product.buyPrice * item.quantity;

    saleItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
    });

    await Product.findByIdAndUpdate(product._id, { $inc: { quantity: -item.quantity } });
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

  const sale = await Sale.create({
    items: saleItems,
    total,
    totalCost,
    paymentType,
    naqtAmount: paymentType === 'aralash' ? Number(naqtAmount) : undefined,
    kartaAmount: paymentType === 'aralash' ? Number(kartaAmount) : undefined,
    customer: customer?._id,
    customerName: customer?.name,
    createdBy: session.user.id,
    createdByName: session.user.name,
    date: new Date(),
  });

  if (paymentType === 'nasiya' && customer) {
    await Customer.findByIdAndUpdate(customer._id, { $inc: { debt: total } });
    await Nasiya.create({
      customer: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      sale: sale._id,
      totalAmount: total,
      paidAmount: 0,
      remainingAmount: total,
      status: 'open',
      createdBy: session.user.id,
      createdByName: session.user.name,
      date: new Date(),
    });

    // Mijozga avtomatik Telegram xabar
    const itemList = saleItems.map(i => `• ${i.productName} × ${i.quantity}`).join('\n');
    const msgText = `🛍️ Nasiya rasmiylashtirildi!\n\n${itemList}\n\nJami qarz: ${fmt(total)}\n\nIloji boricha tez to'lang!`;
    await sendToCustomer({
      customerName: customer.name,
      customerPhone: customer.phone,
      telegramChatId: customer.telegramChatId || '',
      type: 'sotuv_tasdiq',
      messageText: msgText,
      createdById: session.user.id,
      createdByName: session.user.name,
    });
  }

  return NextResponse.json({ success: true, saleId: sale._id, total }, { status: 201 });
}
