import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendMessageToPhone } from '@/lib/telegram-client';
import connectDB from '@/lib/mongoose';
import Settings from '@/models/Settings';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { phoneNumber, message } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'Telefon va xabar kiritilsin' }, { status: 400 });
    }

    // Get session from database
    await connectDB();
    const settings = await Settings.findOne();
    
    if (!settings?.telegramUserSession) {
      return NextResponse.json({ 
        error: 'Telegram akkaunt ulanmagan. Sozlamalar > Telegram bo\'limida ulang.'
      }, { status: 400 });
    }

    // Send message
    await sendMessageToPhone(settings.telegramUserSession, phoneNumber, message);

    return NextResponse.json({
      success: true,
      message: 'Xabar yuborildi',
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({ 
      error: error.message || 'Xabar yuborishda xatolik'
    }, { status: 500 });
  }
}
