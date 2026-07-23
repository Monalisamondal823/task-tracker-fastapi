import api from './api';

export async function login(email, password) {
  const form = new URLSearchParams({ username: email, password });
  const response = await api.post('/auth/login', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

export async function register(email, password) {
  const response = await api.post('/auth/register', { email, password });
  return response.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function fetchProfile() {
  const response = await api.get('/auth/me');
  return response.data;
}
