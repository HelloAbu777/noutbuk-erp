import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Order from '@/models/Order';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action, reason } = await req.json();
  await connectDB();

  if (action === 'accept') {
    await Order.findByIdAndUpdate(id, {
      status: 'accepted',
      acceptedBy: session.user.id,
      acceptedByName: session.user.name,
    });
  } else if (action === 'reject') {
    await Order.findByIdAndUpdate(id, {
      status: 'rejected',
      rejectedReason: reason || '',
    });
  } else {
    return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
