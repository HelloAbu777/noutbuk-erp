import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const list = await prisma.nasiya.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        payments: true,
      },
    });

    // Update overdue statuses
    const now = new Date();
    const stats = {
      total: 0,
      open: 0,
      overdue: 0,
      paid: 0,
      totalAmount: 0,
      openAmount: 0,
    };

    const updated = list.map((n) => {
      let status = n.status;
      if (status === 'active' && n.dueDate && new Date(n.dueDate) < now) {
        status = 'overdue';
      }
      if (n.remainingAmount <= 0) {
        status = 'paid';
      }
      
      stats.total++;
      if (status === 'active') { 
        stats.open++; 
        stats.openAmount += n.remainingAmount; 
      }
      if (status === 'overdue') { 
        stats.overdue++; 
        stats.openAmount += n.remainingAmount; 
      }
      if (status === 'paid') stats.paid++;
      stats.totalAmount += n.totalAmount;
      
      return { ...n, _id: n.id, status };
    });

    return NextResponse.json({ nasiyalar: updated, stats });
  } catch (error: any) {
    console.error('Nasiya GET error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { customerName, customerPhone, totalAmount, dueDate, note, saleId, productName } = body;

    if (!customerName || !customerPhone || !totalAmount) {
      return NextResponse.json({ error: "Majburiy maydonlarni to'ldiring" }, { status: 400 });
    }

    // Mijozni topish yoki yaratish
    let customer = await prisma.customer.findFirst({
      where: { phone: customerPhone },
    });
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone: customerPhone,
          address: '',
          debt: parseFloat(totalAmount),
        },
      });
    } else {
      // Qarzni yangilash
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          debt: (customer.debt || 0) + parseFloat(totalAmount),
        },
      });
    }

    const nasiya = await prisma.nasiya.create({
      data: {
        customerId: customer.id,
        customerName,
        totalAmount: parseFloat(totalAmount),
        paidAmount: 0,
        remainingAmount: parseFloat(totalAmount),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'active',
        saleId: saleId || null,
        productName: productName || null,
      },
    });

    return NextResponse.json({ success: true, nasiya: { ...nasiya, _id: nasiya.id } });
  } catch (error: any) {
    console.error('Nasiya POST error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
