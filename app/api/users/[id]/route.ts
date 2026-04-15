import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.currentPassword) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    const isValid = await bcrypt.compare(body.currentPassword, user.password);
    if (!isValid) return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 400 });
  }

  const updateData: any = {};
  if (body.name) updateData.name = body.name;
  if (body.role) updateData.role = body.role;
  if (body.login) updateData.email = body.login;
  if (body.password) updateData.password = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json({ ...user, _id: user.id, login: user.email });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  // O'chirish o'rniga faqat foydalanishdan chiqarish (agar sotuv bog'liq bo'lsa)
  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    // Agar bog'liq ma'lumotlar bo'lsa, o'chirib bo'lmaydi
    return NextResponse.json({ error: "Bu foydalanuvchini o'chirib bo'lmaydi (bog'liq ma'lumotlar mavjud)" }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
