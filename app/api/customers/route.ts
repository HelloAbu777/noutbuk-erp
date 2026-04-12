import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Customer from '@/models/Customer';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const customers = await Customer.find().sort({ name: 1 }).lean();
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, phone, address } = body;
  if (!name || !phone) {
    return NextResponse.json({ error: 'Ism va telefon majburiy' }, { status: 400 });
  }

  await connectDB();
  const customer = await Customer.create({ name, phone, address });
  return NextResponse.json(customer, { status: 201 });
}
