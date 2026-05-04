
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
        const error = await res.json();
        throw new Error(error.message || 'Error en el servidor');
    }

    return res.json();
}