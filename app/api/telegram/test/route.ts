import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { token, chatId } = await req.json();
  if (!token || !chatId) return NextResponse.json({ ok: false, error: 'Token va chatId kerak' });

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ *Noutbuk Do\'koni ERP* bilan bog\'liq!\n\nTelegram bildirishnomalar muvaffaqiyatli sozlandi.',
        parse_mode: 'Markdown',
      }),
    });
    const d = await res.json();
    return NextResponse.json({ ok: d.ok, error: d.description });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
