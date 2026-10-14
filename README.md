# ИИ-чат (виджет в стиле Jivo)

React + Vite, демо-страница с плавающим виджетом и backend на Express с **Google Gemini** для ответов ассистента.

## Запуск

1. Скопируйте `.env.example` в `.env` и укажите ключ:

```bash
cp .env.example .env
# GEMINI_API_KEY=ваш_ключ из https://aistudio.google.com/apikey
```

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
| `GEMINI_MODEL` | Модель (по умолчанию `gemini-2.0-flash`) |
| `PORT` | Порт API (по умолчанию `3001`) |

Ключ **не** попадает во frontend — запросы идут только на ваш backend.
