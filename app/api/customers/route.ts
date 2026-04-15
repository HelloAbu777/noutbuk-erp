import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  });
  
  // Transform id to _id for backward compatibility
  const transformed = customers.map(c => ({ ...c, _id: c.id }));
  return NextResponse.json(transformed);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, phone, address } = body;
  if (!name || !phone) {
    return NextResponse.json({ error: 'Ism va telefon majburiy' }, { status: 400 });
  }

  const customer = await prisma.customer.create({
    data: { name, phone, address },
  });
  
  const transformed = { ...customer, _id: customer.id };
  return NextResponse.json(transformed, { status: 201 });
}
