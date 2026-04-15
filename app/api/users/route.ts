import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(users.map(u => ({ ...u, _id: u.id, login: u.email })));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, login, password, role } = body;

  if (!name || !login || !password) {
    return NextResponse.json({ error: "Ism, login va parol majburiy" }, { status: 400 });
  }

  const exists = await prisma.user.findFirst({ where: { email: login } });
  if (exists) return NextResponse.json({ error: 'Bu login band' }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: login, password: hashed, role: role || 'kassir' },
  });
  return NextResponse.json({ _id: user.id, name: user.name, login: user.email, role: user.role }, { status: 201 });
}
