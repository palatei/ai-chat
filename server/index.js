import path from 'node:path';
import { createApp } from './app.js';
import { getEnvDiagnostics } from './loadEnv.js';

const PORT = Number(process.env.PORT || 3001);
const app = createApp();

app.listen(PORT, () => {
  console.log(`Chat API listening on http://localhost:${PORT}`);
  const env = getEnvDiagnostics();
  if (!env.geminiConfigured) {
    console.warn(
      `[api] GEMINI_API_KEY не задан — чат вернёт 503. Ожидаемый .env: ${path.join(env.projectRoot, '.env')} (файл ${env.envFileExists ? 'найден, проверьте GEMINI_API_KEY=' : 'не найден'})`,
    );
  }
});
