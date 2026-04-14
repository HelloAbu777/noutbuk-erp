import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendCode } from '@/lib/telegram-client';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Faqat admin ulana oladi' }, { status: 401 });
  }

  try {
    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Telefon raqam kiritilmagan' }, { status: 400 });
    }

    const result = await sendCode(phoneNumber);
    
    return NextResponse.json({
      success: true,
      phoneCodeHash: result.phoneCodeHash,
      sessionString: result.sessionString,
    });
  } catch (error: any) {
    console.error('Send code error:', error);
    return NextResponse.json({ 
      error: error.message || 'Kod yuborishda xatolik'
    }, { status: 500 });
  }
}
