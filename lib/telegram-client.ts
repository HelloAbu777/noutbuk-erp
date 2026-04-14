// Telegram User Client (MTProto API)
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import input from 'input';

const apiId = parseInt(process.env.TELEGRAM_API_ID || '0');
const apiHash = process.env.TELEGRAM_API_HASH || '';

let client: TelegramClient | null = null;

// Initialize client with session
export async function initTelegramClient(sessionString: string = '') {
  if (client && client.connected) {
    return client;
  }

  const session = new StringSession(sessionString);
  client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  return client;
}

// Send code to phone number
export async function sendCode(phoneNumber: string) {
  const session = new StringSession('');
  const tempClient = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await tempClient.connect();
  
  const result = await tempClient.sendCode(
    {
      apiId,
      apiHash,
    },
    phoneNumber
  );

  await tempClient.disconnect();
  
  return {
    phoneCodeHash: result.phoneCodeHash,
    sessionString: session.save(),
  };
}

// Verify code and login
export async function verifyCode(
  phoneNumber: string,
  code: string,
  phoneCodeHash: string,
  sessionString: string
) {
  const session = new StringSession(sessionString);
  const tempClient = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  await tempClient.connect();

  try {
    await tempClient.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode: code,
      })
    );

    const finalSession = session.save();
    await tempClient.disconnect();

    return {
      success: true,
      sessionString: finalSession,
    };
  } catch (error: any) {
    await tempClient.disconnect();
    throw new Error(error.message);
  }
}

// Send message to phone number
export async function sendMessageToPhone(
  sessionString: string,
  phoneNumber: string,
  message: string
) {
  const client = await initTelegramClient(sessionString);
  
  if (!client.connected) {
    await client.connect();
  }

  try {
    // Send message to phone number
    await client.sendMessage(phoneNumber, { message });
    return { success: true };
  } catch (error: any) {
    console.error('Send message error:', error);
    throw new Error(error.message);
  }
}

// Get current user info
export async function getCurrentUser(sessionString: string) {
  const client = await initTelegramClient(sessionString);
  
  if (!client.connected) {
    await client.connect();
  }

  const me = await client.getMe();
  return me;
}
