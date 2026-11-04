// مكان صغير بيشيل الـ access token (في الـ memory فقط - مش localStorage).
// معمول منفصل عشان نتجنب circular imports بين client وauthStore.
export const session = {
  token: null,
  // authStore بيستبدلها بدالة بتعمل logout محلي
  onUnauthorized: () => {},
};
