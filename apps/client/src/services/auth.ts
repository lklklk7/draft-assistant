import api from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export async function registerUser(data: {
  email: string;
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/register', data);
  return res.data;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/login', data);
  return res.data;
}

export async function fetchMe(): Promise<User> {
  const res = await api.get<{ user: User }>('/api/auth/me');
  return res.data.user;
}
