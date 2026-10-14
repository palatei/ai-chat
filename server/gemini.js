import { GoogleGenerativeAI } from '@google/generative-ai';
import { SUPPORT_AGENT_SYSTEM_PROMPT } from './systemPrompt.js';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

function getApiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    const err = new Error('GEMINI_API_KEY is not configured');
    err.code = 'MISSING_API_KEY';
    throw err;
  }
  return key;
}

/**
 * @param {{ role: 'user' | 'assistant', text: string }[]} messages
 */
export async function generateSupportReply(messages) {
  const genAI = new GoogleGenerativeAI(getApiKey());
  const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    systemInstruction: SUPPORT_AGENT_SYSTEM_PROMPT,
  });

  const history = [];
  const all = messages.filter((m) => m.text?.trim());
  if (all.length === 0) {
    throw new Error('messages must not be empty');
  }

  const last = all[all.length - 1];
  if (last.role !== 'user') {
    throw new Error('last message must be from user');
  }

  for (let i = 0; i < all.length - 1; i += 1) {
    const msg = all[i];
    history.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text.trim() }],
    });
  }

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(last.text.trim());
  const text = result.response.text()?.trim();

  if (!text) {
    throw new Error('empty response from Gemini');
  }

  return text;
}

/**
 * @param {{ base64: string, mimeType: string }} audio
 */
export async function transcribeSpeechAudio({ base64, mimeType }) {
  if (!base64?.trim()) {
    throw new Error('audio payload is empty');
  }

  const genAI = new GoogleGenerativeAI(getApiKey());
  const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

  const result = await model.generateContent([
    {
      text:
        'Распознай речь на приложенном аудио. Верни только текст на русском языке, без кавычек и пояснений. ' +
        'Если речи нет или не слышно — верни пустую строку.',
    },
    {
      inlineData: {
        data: base64,
        mimeType: mimeType || 'audio/webm',
      },
    },
  ]);

  return result.response.text()?.trim() ?? '';
}
