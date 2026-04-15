import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendToCustomer } from '@/lib/telegram';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const [total, yuborildi, xato, navbatda] = await Promise.all([
    prisma.message.count(),
    prisma.message.count({ where: { status: 'yuborildi' } }),
    prisma.message.count({ where: { status: 'xato' } }),
    prisma.message.count({ where: { status: 'navbatda' } }),
  ]);

  // _id transform for frontend compatibility
  const transformed = messages.map(m => ({ ...m, _id: m.id }));
  return NextResponse.json({ messages: transformed, stats: { total, yuborildi, xato, navbatda } });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { customerName, customerPhone, type, messageText } = body;

  if (!customerName || !customerPhone || !messageText) {
    return NextResponse.json({ error: "Barcha maydonlar to'ldirilsin" }, { status: 400 });
  }

  const status = await sendToCustomer({
    customerName,
    customerPhone,
    type: type || 'qarz_eslatma',
    messageText,
    createdByName: session.user.name,
  });

  return NextResponse.json({ success: true, status }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    await prisma.message.delete({ where: { id } });
  } else {
    await prisma.message.deleteMany({});
  }
  return NextResponse.json({ success: true });
}
