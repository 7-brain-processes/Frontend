const directTranslations: Record<string, string> = {
  Unauthorized: 'Требуется авторизация',
  'Access denied': 'Доступ запрещён',
  'API request failed': 'Ошибка запроса к серверу',
  'File upload failed': 'Ошибка загрузки файла',
  'File download failed': 'Ошибка скачивания файла',
  'not in any team': 'Пользователь не состоит ни в одной команде',
  'Not in any team': 'Пользователь не состоит ни в одной команде',
  'not found': 'Не найдено',
  'Not found': 'Не найдено',
  'Captains are already selected for this assignment. Set reshuffle=true to reselect': 'Капитаны для этого задания уже выбраны. Запустите повторный выбор капитанов.',
};

const translateHttpStatus = (message: string): string | null => {
  const match = message.match(/^HTTP error! status: (\d{3})$/);
  if (!match) {
    return null;
  }

  const status = Number(match[1]);
  if (status === 400) return 'Некорректный запрос';
  if (status === 401) return 'Требуется авторизация';
  if (status === 403) return 'Доступ запрещён';
  if (status === 404) return 'Не найдено';
  if (status === 409) return 'Конфликт данных';
  if (status >= 500) return 'Внутренняя ошибка сервера';

  return `Ошибка HTTP: ${status}`;
};

export const translateApiMessage = (message?: string | null, fallback?: string): string => {
  const normalized = String(message || '').trim();

  if (!normalized) {
    return fallback || 'Произошла ошибка';
  }

  const httpTranslation = translateHttpStatus(normalized);
  if (httpTranslation) {
    return httpTranslation;
  }

  if (directTranslations[normalized]) {
    return directTranslations[normalized];
  }

  if (normalized.startsWith('Successfully enrolled in team: ')) {
    return `Вы успешно вступили в команду: ${normalized.slice('Successfully enrolled in team: '.length)}`;
  }

  if (normalized.startsWith('Successfully left team: ')) {
    return `Вы успешно вышли из команды: ${normalized.slice('Successfully left team: '.length)}`;
  }

  return normalized;
};
