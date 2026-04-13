import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await connectDB();
  const product = await Product.findByIdAndUpdate(id, { $set: body }, { new: true });
  if (!product) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  
  // Permanently delete from database instead of archiving
  const product = await Product.findByIdAndDelete(id);
  if (!product) return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
  
  return NextResponse.json({ success: true });
}
