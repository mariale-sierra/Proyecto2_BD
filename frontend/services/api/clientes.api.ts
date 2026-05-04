import { apiFetch } from './base';

export const clientesApi = {
    findAll: () => apiFetch('/cliente'),
    
    findFrecuentes: () => apiFetch('/cliente/frecuentes'),
    
    buscar: (q: string) => apiFetch(`/cliente/buscar?q=${q}`),
    
    create: (data: { nombre: string; telefono: string; correo?: string; nit: string }) =>
        apiFetch('/cliente', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: number, data: { nombre: string; telefono: string; correo?: string; nit: string }) =>
        apiFetch(`/cliente/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    
    delete: (id: number) =>
        apiFetch(`/cliente/${id}`, { method: 'DELETE' }),
};