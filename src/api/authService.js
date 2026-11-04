import client from './client';

export const authService = {
  // POST /auth/login  → { user, accessToken, deviceTrusted }
  login: ({ email, password }) =>
    client.post('/auth/login', { email, password }, { _skipRefresh: true }).then((r) => r.data),

  // POST /auth/refresh → { user, accessToken, deviceTrusted }
  refresh: () =>
    client.post('/auth/refresh', null, { _skipRefresh: true }).then((r) => r.data),

  // POST /auth/logout → 204
  logout: () => client.post('/auth/logout', null, { _skipRefresh: true }).then(() => undefined),
};
