import connectDB from './mongoose';
import Settings from '@/models/Settings';
import Message from '@/models/Message';

// Telegramga xabar yuborish
async function send(token: string, chatId: string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    const d = await res.json();
    return { ok: d.ok as boolean, error: d.description as string | undefined };
  } catch (e: any) {
    return { ok: false, error: e.message as string };
  }
}

// Avtomatik xabar — Xabar jadvaliga yozib, Telegramga yuboradi
export async function sendToCustomer({
  customerName,
  customerPhone,
  type,
  messageText,
  createdById,
  createdByName,
}: {
  customerName: string;
  customerPhone: string;
  telegramChatId?: string;
  type: 'qarz_eslatma' | 'sotuv_tasdiq' | 'qarz_tolandi';
  messageText: string;
  createdById?: string;
  createdByName?: string;
}) {
  await connectDB();

  const settings = await Settings.findOne().lean() as any;
  const token: string = settings?.telegramBotToken || '';
  const chatId: string = settings?.telegramChatId || '';

  let status: 'yuborildi' | 'xato' | 'navbatda' = 'navbatda';
  let errorText: string | undefined;

  if (token && chatId) {
    const result = await send(token, chatId, messageText);
    status = result.ok ? 'yuborildi' : 'xato';
    errorText = result.error;
  }

  await Message.create({
    customerName,
    customerPhone,
    type,
    messageText,
    status,
    errorText,
    createdBy: createdById,
    createdByName,
    date: new Date(),
  });

  return status;
}
