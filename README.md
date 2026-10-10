# ИИ-чат (виджет в стиле Jivo)

React + Vite, демо-страница с плавающим виджетом, мок-диалог и имитация ответов агента.

## Запуск

```bash
npm install
npm run dev
```

Откройте URL из терминала (обычно `http://localhost:5173`).

## Структура

- `src/components/ChatWidget/` — UI виджета
- `src/mocks/` — начальные сообщения и ответы агента
- `src/hooks/useChat.js` — отправка и симуляция ответа (замените на вызов API)

## Подключение реального API

В `useChat.js` вместо `findReply()` и `setTimeout` вызывайте ваш backend / streaming endpoint и добавляйте сообщения ассистента по мере прихода чанков.
