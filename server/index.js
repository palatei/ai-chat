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
      res.status(503).json({ error: 'Сервис ИИ временно недоступен: не настроен ключ API.' });
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
