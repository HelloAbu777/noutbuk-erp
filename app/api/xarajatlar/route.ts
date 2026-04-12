import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Expense from '@/models/Expense';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const expenses = await Expense.find().sort({ date: -1 }).lean();
  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  await connectDB();
  const expense = await Expense.create({ ...body, createdBy: session.user.id, createdByName: session.user.name });
  return NextResponse.json(expense, { status: 201 });
}
