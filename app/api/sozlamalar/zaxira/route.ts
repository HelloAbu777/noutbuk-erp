import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import Customer from '@/models/Customer';
import Nasiya from '@/models/Nasiya';
import Expense from '@/models/Expense';
import Purchase from '@/models/Purchase';
import Supplier from '@/models/Supplier';
import Warehouse from '@/models/Warehouse';
import Partner from '@/models/Partner';
import Agent from '@/models/Agent';
import Settings from '@/models/Settings';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const [products, sales, customers, nasiya, expenses, purchases, suppliers, warehouse, partners, agents, settings] =
    await Promise.all([
      Product.find().lean(),
      Sale.find().lean(),
      Customer.find().lean(),
      Nasiya.find().lean(),
      Expense.find().lean(),
      Purchase.find().lean(),
      Supplier.find().lean(),
      Warehouse.find().lean(),
      Partner.find().lean(),
      Agent.find().lean(),
      Settings.findOne().lean(),
    ]);

  const data = { products, sales, customers, nasiya, expenses, purchases, suppliers, warehouse, partners, agents, settings, exportDate: new Date().toISOString() };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="erp-zaxira-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  await connectDB();

  const ops: Promise<any>[] = [];

  if (Array.isArray(body.products) && body.products.length > 0) {
    ops.push(Product.deleteMany({}));
  }
  if (Array.isArray(body.customers) && body.customers.length > 0) {
    ops.push(Customer.deleteMany({}));
  }
  if (Array.isArray(body.expenses) && body.expenses.length > 0) {
    ops.push(Expense.deleteMany({}));
  }

  await Promise.all(ops);

  const inserts: Promise<any>[] = [];
  if (Array.isArray(body.products)) inserts.push(Product.insertMany(body.products, { ordered: false }).catch(() => {}));
  if (Array.isArray(body.sales)) inserts.push(Sale.insertMany(body.sales, { ordered: false }).catch(() => {}));
  if (Array.isArray(body.customers)) inserts.push(Customer.insertMany(body.customers, { ordered: false }).catch(() => {}));
  if (Array.isArray(body.nasiya)) inserts.push(Nasiya.insertMany(body.nasiya, { ordered: false }).catch(() => {}));
  if (Array.isArray(body.expenses)) inserts.push(Expense.insertMany(body.expenses, { ordered: false }).catch(() => {}));
  if (Array.isArray(body.suppliers)) inserts.push(Supplier.insertMany(body.suppliers, { ordered: false }).catch(() => {}));
  if (Array.isArray(body.warehouse)) inserts.push(Warehouse.insertMany(body.warehouse, { ordered: false }).catch(() => {}));
  if (Array.isArray(body.partners)) inserts.push(Partner.insertMany(body.partners, { ordered: false }).catch(() => {}));
  if (Array.isArray(body.agents)) inserts.push(Agent.insertMany(body.agents, { ordered: false }).catch(() => {}));

  await Promise.all(inserts);

  return NextResponse.json({ success: true });
}
