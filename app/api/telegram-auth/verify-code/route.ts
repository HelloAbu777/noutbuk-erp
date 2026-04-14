import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { verifyCode, getCurrentUser } from '@/lib/telegram-client';
import connectDB from '@/lib/mongoose';
import Settings from '@/models/Settings';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Faqat admin ulana oladi' }, { status: 401 });
  }

  try {
    const { phoneNumber, code, phoneCodeHash, sessionString } = await request.json();
    
    if (!phoneNumber || !code || !phoneCodeHash || !sessionString) {
      return NextResponse.json({ error: 'Barcha maydonlar to\'ldirilsin' }, { status: 400 });
    }

    // Verify code and get session
    const result = await verifyCode(phoneNumber, code, phoneCodeHash, sessionString);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Kod noto\'g\'ri' }, { status: 400 });
    }

    // Get user info
    const user = await getCurrentUser(result.sessionString);
    
    // Save session to database
    await connectDB();
    await Settings.findOneAndUpdate(
      {},
      {
        telegramUserSession: result.sessionString,
        telegramUserPhone: phoneNumber,
        telegramUserName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    });
  } catch (error: any) {
    console.error('Verify code error:', error);
    return NextResponse.json({ 
      error: error.message || 'Tasdiqlashda xatolik'
    }, { status: 500 });
  }
}
