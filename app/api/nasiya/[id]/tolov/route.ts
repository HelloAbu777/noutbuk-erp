import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Nasiya from '@/models/Nasiya';
import Customer from '@/models/Customer';
import { sendToCustomer } from '@/lib/telegram';

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { amount, note } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Summa noto'g'ri" }, { status: 400 });
  }

  await connectDB();
  const nasiya = await Nasiya.findById(id);
  if (!nasiya) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  if (nasiya.status === 'paid') {
    return NextResponse.json({ error: "Bu nasiya allaqachon to'langan" }, { status: 400 });
  }

  const pay = Math.min(amount, nasiya.remainingAmount);
  nasiya.paidAmount += pay;
  nasiya.remainingAmount -= pay;
  nasiya.payments.push({ amount: pay, date: new Date(), note });
  const fullyPaid = nasiya.remainingAmount <= 0;
  if (fullyPaid) nasiya.status = 'paid';
  await nasiya.save();

  const customer = await Customer.findByIdAndUpdate(
    nasiya.customer,
    { $inc: { debt: -pay } },
    { new: true }
  ).lean() as any;

  // Avtomatik Telegram xabar
  const msgText = fullyPaid
    ? `✅ Nasiyangiz to'liq yopildi!\n\nTo'langan: ${fmt(pay)}\nQoldiq: 0 so'm\n\nRahmat!`
    : `💳 To'lov qabul qilindi!\n\nTo'langan: ${fmt(pay)}\nQoldiq qarz: ${fmt(nasiya.remainingAmount)}`;

  await sendToCustomer({
    customerName: nasiya.customerName,
    customerPhone: nasiya.customerPhone,
    telegramChatId: customer?.telegramChatId || '',
    type: 'qarz_tolandi',
    messageText: msgText,
    createdById: session.user.id,
    createdByName: session.user.name,
  });

  return NextResponse.json({ success: true, remaining: nasiya.remainingAmount });
}
