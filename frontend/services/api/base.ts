
const BASE_URL = '/api';

export async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const headers = new Headers({ 'Content-Type': 'application/json' })
    if (options?.headers) {
        new Headers(options.headers).forEach((value, key) => headers.set(key, value))
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers,
        credentials: 'include',
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => null);
        const rawMessage = error?.message ?? error?.mensaje ?? error?.error ?? 'Error en el servidor';
        const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);
        throw new Error(message);
    }

    return res.json();
}