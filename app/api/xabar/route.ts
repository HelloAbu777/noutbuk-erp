import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import Customer from '@/models/Customer';
import { sendToCustomer } from '@/lib/telegram';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const messages = await Message.find().sort({ date: -1 }).limit(200).lean();

  const total = await Message.countDocuments();
  const yuborildi = await Message.countDocuments({ status: 'yuborildi' });
  const xato = await Message.countDocuments({ status: 'xato' });
  const navbatda = await Message.countDocuments({ status: 'navbatda' });

  return NextResponse.json({ messages, stats: { total, yuborildi, xato, navbatda } });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { customerName, customerPhone, customerId, type, messageText } = body;

  if (!customerName || !customerPhone || !messageText) {
    return NextResponse.json({ error: "Barcha maydonlar to'ldirilsin" }, { status: 400 });
  }

  await connectDB();

  // Mijozning shaxsiy Telegram Chat ID sini olish
  let telegramChatId: string | undefined;
  if (customerId) {
    const customer = await Customer.findById(customerId).lean() as any;
    if (customer?.telegramChatId) telegramChatId = customer.telegramChatId;
  }

  const status = await sendToCustomer({
    customerName,
    customerPhone,
    telegramChatId,
    type: type || 'qarz_eslatma',
    messageText,
    createdById: session.user.id,
    createdByName: session.user.name,
  });

  return NextResponse.json({ success: true, status }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  await connectDB();
  if (id) {
    await Message.findByIdAndDelete(id);
  } else {
    await Message.deleteMany({});
  }
  return NextResponse.json({ success: true });
}
