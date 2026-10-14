/**
 * @param {{ role: 'user' | 'assistant', text: string }[]} messages
 * @returns {Promise<string>}
 */
export async function requestChatReply(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof data.error === 'string'
        ? data.error
        : 'Не удалось связаться с сервером. Проверьте, что backend запущен.';
    throw new Error(message);
  }

  if (typeof data.reply !== 'string' || !data.reply.trim()) {
    throw new Error('Пустой ответ от сервера.');
  }

  return data.reply.trim();
}
