import path from 'node:path';
import './loadEnv.js';
import cors from 'cors';
import express from 'express';
import { generateSupportReply, transcribeSpeechAudio } from './gemini.js';
import { getEnvDiagnostics } from './loadEnv.js';

const PORT = Number(process.env.PORT || 3001);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  const env = getEnvDiagnostics();
  res.json({
    ok: true,
    geminiConfigured: env.geminiConfigured,
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    envFileExists: env.envFileExists,
    projectRoot: env.projectRoot,
    cwd: env.cwd,
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

    if (errText.includes('is no longer available') || errText.includes('models/')) {
      res.status(502).json({
        error:
          'Модель Gemini недоступна. Задайте GEMINI_MODEL в .env (например gemini-2.5-flash или gemini-3.8-flash) и перезапустите npm run dev.',
      });
      return;
    }

    console.error('[chat]', err);
    res.status(502).json({
      error: 'Не удалось получить ответ от ассистента. Попробуйте ещё раз через несколько секунд.',
    });
  }
});

app.post('/api/transcribe', express.json({ limit: '8mb' }), async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body ?? {};
    if (typeof audioBase64 !== 'string' || !audioBase64.trim()) {
      res.status(400).json({ error: 'audioBase64 is required' });
      return;
    }

    const text = await transcribeSpeechAudio({
      base64: audioBase64.trim(),
      mimeType: typeof mimeType === 'string' ? mimeType : 'audio/webm',
    });

    res.json({ text });
  } catch (err) {
    if (err.code === 'MISSING_API_KEY') {
      res.status(503).json({ error: 'Не настроен GEMINI_API_KEY для распознавания речи.' });
      return;
    }
    console.error('[transcribe]', err);
    res.status(502).json({ error: 'Не удалось распознать аудио. Попробуйте ещё раз.' });
  }
});

app.listen(PORT, () => {
  console.log(`Chat API listening on http://localhost:${PORT}`);
  const env = getEnvDiagnostics();
  if (!env.geminiConfigured) {
    console.warn(
      `[api] GEMINI_API_KEY не задан — чат вернёт 503. Ожидаемый .env: ${path.join(env.projectRoot, '.env')} (файл ${env.envFileExists ? 'найден, проверьте GEMINI_API_KEY=' : 'не найден'})`,
    );
  }
});
