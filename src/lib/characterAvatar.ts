/**
 * characterAvatar — единая карта аватарок персонажа по классу + полу.
 * Используется во всех местах где показывается портрет (профиль, сайдбар, шапка).
 */

const BASE = 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files';

const MALE: Record<string, string> = {
  cipher:           `${BASE}/ab60e642-3eb1-4491-a0d5-fc580d0d09f2.jpg`,
  data_ghost:       `${BASE}/1b0d5c41-5e94-4d1a-acb8-284f7932d90a.jpg`,
  neural_architect: `${BASE}/a36ed9fa-ba2d-4c24-967a-4716846cf3b1.jpg`,
  // обратная совместимость со старыми классами
  hacker:           `${BASE}/ab60e642-3eb1-4491-a0d5-fc580d0d09f2.jpg`,
  netrunner:        `${BASE}/1b0d5c41-5e94-4d1a-acb8-284f7932d90a.jpg`,
  street_samurai:   `${BASE}/a36ed9fa-ba2d-4c24-967a-4716846cf3b1.jpg`,
};

const FEMALE: Record<string, string> = {
  cipher:           `${BASE}/aaadee3b-ebb4-4fcd-9a7e-f82a044e9338.jpg`,
  data_ghost:       `${BASE}/51824707-ba1b-49e7-92eb-66cb595882b2.jpg`,
  neural_architect: `${BASE}/4e75dd39-a1a7-4c74-a594-2154ba16128c.jpg`,
  hacker:           `${BASE}/aaadee3b-ebb4-4fcd-9a7e-f82a044e9338.jpg`,
  netrunner:        `${BASE}/51824707-ba1b-49e7-92eb-66cb595882b2.jpg`,
  street_samurai:   `${BASE}/4e75dd39-a1a7-4c74-a594-2154ba16128c.jpg`,
};

/** Получить URL аватарки для класса и пола. */
export function getAvatar(charClass: string, gender: 'male' | 'female' = 'male'): string {
  const map = gender === 'female' ? FEMALE : MALE;
  return map[charClass] || map.cipher;
}
