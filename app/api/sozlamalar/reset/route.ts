import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import Purchase from '@/models/Purchase';
import Expense from '@/models/Expense';
import Nasiya from '@/models/Nasiya';
import Customer from '@/models/Customer';
import Warehouse from '@/models/Warehouse';
import Order from '@/models/Order';
import Message from '@/models/Message';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    // Delete all transactions and data
    await Promise.all([
      Sale.deleteMany({}),
      Purchase.deleteMany({}),
      Expense.deleteMany({}),
      Nasiya.deleteMany({}),
      Order.deleteMany({}),
      Message.deleteMany({}),
      Warehouse.deleteMany({}),
      // Reset product quantities to 0
      Product.updateMany({}, { $set: { quantity: 0 } }),
      // Reset customer debts to 0
      Customer.updateMany({}, { $set: { debt: 0 } }),
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Barcha kirim-chiqim ma\'lumotlari tozalandi' 
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
