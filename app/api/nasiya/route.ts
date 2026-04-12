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
