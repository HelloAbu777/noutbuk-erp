import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const users = await User.find().select('-password').sort({ name: 1 }).lean();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { name, login, password, role, phone } = body;

  await connectDB();
  const exists = await User.findOne({ login });
  if (exists) return NextResponse.json({ error: 'Bu login band' }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, login, password: hashed, role, phone });
  return NextResponse.json({ _id: user._id, name: user.name, login: user.login, role: user.role }, { status: 201 });
}
