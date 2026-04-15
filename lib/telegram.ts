import prisma from './prisma';

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
  createdByName,
}: {
  customerName: string;
  customerPhone: string;
  type: 'qarz_eslatma' | 'sotuv_tasdiq' | 'qarz_tolandi';
  messageText: string;
  createdById?: string;
  createdByName?: string;
}) {
  const settings = await prisma.settings.findFirst();
  const token: string = (settings as any)?.telegramBotToken || '';
  const chatId: string = (settings as any)?.telegramChatId || '';

  let status: 'yuborildi' | 'xato' | 'navbatda' = 'navbatda';
  let errorText: string | undefined;

  if (token && chatId) {
    const result = await send(token, chatId, messageText);
    status = result.ok ? 'yuborildi' : 'xato';
    errorText = result.error;
  }

  await prisma.message.create({
    data: {
      customerName,
      customerPhone,
      type,
      messageText,
      status,
      errorText: errorText || null,
      createdByName: createdByName || null,
    },
  });

  return status;
}
