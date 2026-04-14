import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongoose';
import Product from '@/models/Product';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();

    // Barcha mavjud barkodlarni olish
    const products = await Product.find({ barcode: { $exists: true, $ne: '' } })
      .select('barcode')
      .lean();

    // Barkodlarni raqamga aylantirish va saralash
    const existingBarcodes = products
      .map(p => parseInt(p.barcode))
      .filter(b => !isNaN(b) && b >= 1 && b <= 999999)
      .sort((a, b) => a - b);

    // Eng kichik bo'sh barkodni topish
    let nextBarcode = 1;
    for (const barcode of existingBarcodes) {
      if (barcode === nextBarcode) {
        nextBarcode++;
      } else if (barcode > nextBarcode) {
        break;
      }
    }

    // 6 raqamli formatga o'tkazish
    const formattedBarcode = String(nextBarcode).padStart(6, '0');

    return NextResponse.json({ barcode: formattedBarcode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
