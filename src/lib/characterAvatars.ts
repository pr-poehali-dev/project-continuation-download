/**
 * Аватары персонажей по классу и полу.
 * Используется во всех местах, где нужно показать портрет (профиль, NavBar, бой и т.д.)
 */

type Gender = 'male' | 'female';

const IMG_MALE: Record<string, string> = {
  cipher:           'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ab60e642-3eb1-4491-a0d5-fc580d0d09f2.jpg',
  data_ghost:       'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/1b0d5c41-5e94-4d1a-acb8-284f7932d90a.jpg',
  neural_architect: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/a36ed9fa-ba2d-4c24-967a-4716846cf3b1.jpg',
  // обратная совместимость со старыми классами
  hacker:           'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/ab60e642-3eb1-4491-a0d5-fc580d0d09f2.jpg',
  netrunner:        'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/1b0d5c41-5e94-4d1a-acb8-284f7932d90a.jpg',
  street_samurai:   'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/a36ed9fa-ba2d-4c24-967a-4716846cf3b1.jpg',
};

const IMG_FEMALE: Record<string, string> = {
  cipher:           'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/aaadee3b-ebb4-4fcd-9a7e-f82a044e9338.jpg',
  data_ghost:       'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/51824707-ba1b-49e7-92eb-66cb595882b2.jpg',
  neural_architect: 'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/4e75dd39-a1a7-4c74-a594-2154ba16128c.jpg',
  hacker:           'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/aaadee3b-ebb4-4fcd-9a7e-f82a044e9338.jpg',
  netrunner:        'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/51824707-ba1b-49e7-92eb-66cb595882b2.jpg',
  street_samurai:   'https://cdn.poehali.dev/projects/05e77d6f-2123-49fc-8e7f-785497e395eb/files/4e75dd39-a1a7-4c74-a594-2154ba16128c.jpg',
};

export function getAvatar(charClass: string | undefined | null, gender?: Gender | string | null): string {
  const cls = charClass || 'cipher';
  if (gender === 'female') return IMG_FEMALE[cls] || IMG_FEMALE.cipher;
  return IMG_MALE[cls] || IMG_MALE.cipher;
}

export const CHARACTER_AVATARS = { male: IMG_MALE, female: IMG_FEMALE };
