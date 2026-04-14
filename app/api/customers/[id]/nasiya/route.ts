import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Nasiya from '@/models/Nasiya';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();
  
  const nasiyas = await Nasiya.find({ customer: id })
    .sort({ date: -1 })
    .limit(20)
    .lean();
  
  return NextResponse.json(nasiyas);
}
