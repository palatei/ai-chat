# ИИ-чат (виджет в стиле Jivo)

React + Vite, демо-страница с плавающим виджетом и backend на Express с **Google Gemini** для ответов ассистента.

## Запуск

1. Скопируйте `.env.example` в `.env` и укажите **ключ Gemini** (не токены Cursor):

```bash
cp .env.example .env
```

В `.env`:

```env
GEMINI_API_KEY=AIza...   # https://aistudio.google.com/apikey
```

Если в чате «не настроен ключ API» — backend не видит переменную: проверьте `.env` и что запущен именно `npm run dev` (поднимает и API на :3001, и Vite).

**Монорепозиторий:** файл `.env` должен лежать в **той же папке**, где `package.json` этого чата (например `fitnapp/ai-chat/.env`), а `npm run dev` нужно запускать из неё, не из корня монорепы.

2. Установите зависимости и запустите frontend + API:

```bash
npm install
npm run dev
```

- Веб: URL из терминала (обычно `http://localhost:5173`)
- API: `http://localhost:3001` (проксируется с фронта через `/api/*`)

Проверка API:

```bash
curl -s http://localhost:3001/api/health
```

В ответе смотрите `envFileExists` и `projectRoot`: если `envFileExists: false`, `.env` лежит не там, откуда читает API (файл должен быть в `projectRoot`).

## Структура

- `src/components/ChatWidget/` — UI виджета
- `src/hooks/useChat.js` — отправка сообщений и вызов `/api/chat`
- `src/api/chatClient.js` — HTTP-клиент к backend
- `server/` — Express + Gemini (`POST /api/chat`)
- `src/mocks/` — начальная история диалога для демо

## Переменные окружения (backend)

| Переменная | Описание |
|------------|----------|
| `GEMINI_API_KEY` | Обязательный ключ Gemini |
| `GEMINI_MODEL` | Модель (по умолчанию `gemini-3.8-flash`; для новых ключей Google старые `gemini-2.x` часто недоступны) |
| `PORT` | Порт API (по умолчанию `3001`) |

Ключ **не** попадает во frontend — запросы идут только на ваш backend.
