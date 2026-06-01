import { apiFetch } from './base'
import type { AuthUser } from '@/src/auth/roles'

export const authApi = {
  login: (credential: string) =>
    apiFetch<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),
  me: () => apiFetch<AuthUser>('/auth/me'),
  logout: () => apiFetch<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
}