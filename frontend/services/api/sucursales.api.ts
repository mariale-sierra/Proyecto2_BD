import { apiFetch } from './base';

export const sucursalesApi = {
    findAll: () => apiFetch('/sucursal'),
    
    create: (data: { nombre: string; telefono: string; direccion: string; hora_abre: string; hora_cierra: string }) =>
        apiFetch('/sucursal', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: number, data: { nombre: string; telefono: string; direccion: string; hora_abre: string; hora_cierra: string }) =>
        apiFetch(`/sucursal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    
    delete: (id: number) =>
        apiFetch(`/sucursal/${id}`, { method: 'DELETE' }),
};