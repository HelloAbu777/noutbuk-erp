import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await connectDB();

  if (body.currentPassword) {
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    const isValid = await bcrypt.compare(body.currentPassword, user.password);
    if (!isValid) return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 400 });
    delete body.currentPassword;
  }

  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
  } else {
    delete body.password;
  }

  const user = await User.findByIdAndUpdate(id, { $set: body }, { new: true }).select('-password');
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();
  await User.findByIdAndUpdate(id, { status: 'inactive' });
  return NextResponse.json({ success: true });
}
