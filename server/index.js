import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { generateSupportReply } from './gemini.js';

const PORT = Number(process.env.PORT || 3001);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages must be a non-empty array' });
      return;
    }

    for (const msg of messages) {
      if (!msg || (msg.role !== 'user' && msg.role !== 'assistant') || typeof msg.text !== 'string') {
        res.status(400).json({ error: 'each message needs role (user|assistant) and text' });
        return;
      }
    }

    const reply = await generateSupportReply(messages);
    res.json({ reply });
  } catch (err) {
    if (err.code === 'MISSING_API_KEY') {
      res.status(503).json({
        error:
          'Не настроен GEMINI_API_KEY. Создайте файл .env в корне проекта (см. .env.example), ' +
          'добавьте ключ из Google AI Studio (https://aistudio.google.com/apikey) и перезапустите npm run dev.',
      });
      return;
    }

    const errText = String(err?.message || err);
    if (errText.includes('API_KEY_INVALID')) {
      res.status(503).json({
        error:
          'Ключ Gemini не принят Google (API_KEY_INVALID). Нужен ключ из Google AI Studio, ' +
          'не токен Cursor (crsr_…). Обновите GEMINI_API_KEY в .env и перезапустите npm run dev.',
      });
      return;
    }

    console.error('[chat]', err);
    res.status(502).json({
      error: 'Не удалось получить ответ от ассистента. Попробуйте ещё раз через несколько секунд.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chat API listening on http://localhost:${PORT}`);
});
