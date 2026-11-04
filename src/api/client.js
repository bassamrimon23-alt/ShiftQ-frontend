import axios from 'axios';
import { session } from './session';
import { toAppError, makeAppError } from './errors';
import { mockAdapter } from './mock/mockAdapter';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // عشان الـ refresh token (httpOnly cookie) يتبعت
});

// ← السطر الوحيد اللي بيفرق بين Mock والـ Backend الحقيقي
if (USE_MOCK) {
  client.defaults.adapter = mockAdapter;
}

// 1) كل request: نضيف الـ access token
client.interceptors.request.use((config) => {
  if (session.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// 2) refresh واحد فقط حتى لو أكتر من request فشلوا مع بعض
let refreshPromise = null;
function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = client
      .post('/auth/refresh', null, { _skipRefresh: true })
      .then((res) => {
        session.token = res.data.accessToken;
        return res.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// 3) كل response: نعالج 401 ونوحّد شكل الأخطاء
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const is401 = error.response && error.response.status === 401;

    if (is401 && config && !config._retry && !config._skipRefresh) {
      config._retry = true;
      try {
        await refreshSession();
        config.headers.Authorization = `Bearer ${session.token}`;
        return client(config); // نعيد نفس الـ request
      } catch {
        session.onUnauthorized();
        return Promise.reject(makeAppError('SESSION_EXPIRED', { status: 401 }));
      }
    }

    return Promise.reject(toAppError(error));
  }
);

export default client;
