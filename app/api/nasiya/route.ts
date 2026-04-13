import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Nasiya from '@/models/Nasiya';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const list = await Nasiya.find().sort({ date: -1 }).lean();

  // Update overdue statuses
  const now = new Date();
  const stats = {
    total: 0,
    open: 0,
    overdue: 0,
    paid: 0,
    totalAmount: 0,
    openAmount: 0,
  };

  const updated = list.map((n) => {
    let status = n.status;
    if (status === 'open' && n.dueDate && new Date(n.dueDate) < now) {
      status = 'overdue';
    }
    stats.total++;
    if (status === 'open') { stats.open++; stats.openAmount += n.remainingAmount; }
    if (status === 'overdue') { stats.overdue++; stats.openAmount += n.remainingAmount; }
    if (status === 'paid') stats.paid++;
    stats.totalAmount += n.totalAmount;
    return { ...n, status };
  });

  return NextResponse.json({ nasiyalar: updated, stats });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { customerName, customerPhone, totalAmount, dueDate, note } = body;

    if (!customerName || !customerPhone || !totalAmount) {
      return NextResponse.json({ error: "Majburiy maydonlarni to'ldiring" }, { status: 400 });
    }

    await connectDB();

    const nasiya = await Nasiya.create({
      customerName,
      customerPhone,
      totalAmount: parseFloat(totalAmount),
      paidAmount: 0,
      remainingAmount: parseFloat(totalAmount),
      dueDate: dueDate || null,
      status: 'open',
      date: new Date(),
      note: note || '',
      payments: [],
    });

    return NextResponse.json({ success: true, nasiya });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
