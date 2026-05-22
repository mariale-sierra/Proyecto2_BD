
const BASE_URL = '/api';

export async function apiFetch<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
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