import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });
  return NextResponse.json(expenses.map(e => ({ ...e, _id: e.id })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, amount, category, description } = body;

  const expense = await prisma.expense.create({
    data: { title, amount: Number(amount), category, description: description || null },
  });
  return NextResponse.json({ ...expense, _id: expense.id }, { status: 201 });
}
