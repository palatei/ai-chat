import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

/** Корень npm-пакета (рядом с package.json), не process.cwd(). */
export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const envPath = path.join(projectRoot, '.env');
const envLocalPath = path.join(projectRoot, '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

export function getEnvDiagnostics() {
  return {
    projectRoot,
    cwd: process.cwd(),
    envFileExists: fs.existsSync(envPath),
    envLocalExists: fs.existsSync(envLocalPath),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
  };
}
