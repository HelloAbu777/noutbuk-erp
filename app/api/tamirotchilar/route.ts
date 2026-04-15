import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const suppliers = await prisma.supplier.findMany({
    where: { status: 'active' },
    orderBy: { companyName: 'asc' },
  });
  return NextResponse.json(suppliers.map(s => ({ ...s, _id: s.id })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { companyName, contactPerson, phone, address } = body;
  if (!companyName || !phone) {
    return NextResponse.json({ error: 'Kompaniya va telefon majburiy' }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({
    data: { companyName, contactPerson: contactPerson || '', phone, address },
  });
  return NextResponse.json({ ...supplier, _id: supplier.id }, { status: 201 });
}
