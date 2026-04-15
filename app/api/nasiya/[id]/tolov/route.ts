import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendToCustomer } from '@/lib/telegram';

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { amount, note } = await req.json();
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Summa noto'g'ri" }, { status: 400 });
    }

    const nasiya = await prisma.nasiya.findUnique({
      where: { id },
      include: { customer: true },
    });
    
    if (!nasiya) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    if (nasiya.status === 'paid') {
      return NextResponse.json({ error: "Bu nasiya allaqachon to'langan" }, { status: 400 });
    }

    const pay = Math.min(amount, nasiya.remainingAmount);
    const newPaidAmount = nasiya.paidAmount + pay;
    const newRemainingAmount = nasiya.remainingAmount - pay;
    const fullyPaid = newRemainingAmount <= 0;

    // To'lovni qo'shish
    await prisma.paymentRecord.create({
      data: {
        nasiyaId: id,
        amount: pay,
        note: note || '',
      },
    });

    // Nasiyani yangilash
    await prisma.nasiya.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        status: fullyPaid ? 'paid' : nasiya.status,
      },
    });

    // Mijoz qarzini yangilash
    await prisma.customer.update({
      where: { id: nasiya.customerId },
      data: {
        debt: { decrement: pay },
      },
    });

    // Avtomatik xabar
    const msgText = fullyPaid
      ? `✅ Nasiyangiz to'liq yopildi!\n\nTo'langan: ${fmt(pay)}\nQoldiq: 0 so'm\n\nRahmat!`
      : `💳 To'lov qabul qilindi!\n\nTo'langan: ${fmt(pay)}\nQoldiq qarz: ${fmt(newRemainingAmount)}`;

    await sendToCustomer({
      customerName: nasiya.customerName,
      customerPhone: nasiya.customer.phone,
      type: 'qarz_tolandi',
      messageText: msgText,
      createdById: session.user.id,
      createdByName: session.user.name,
    });

    return NextResponse.json({ success: true, remaining: newRemainingAmount });
  } catch (error: any) {
    console.error('Nasiya payment error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
