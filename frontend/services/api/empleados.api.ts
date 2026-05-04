import { apiFetch } from './base';

export const empleadosApi = {
    findAll: () => apiFetch('/empleado'),
    
    findByCarnet: (id: number) => apiFetch(`/empleado/carnet/${id}`),
    
    findBySucursal: (id_sucursal: number) =>
        apiFetch(`/empleado/sucursal/${id_sucursal}`),
    
    create: (data: { nombre: string; apellido: string; es_gerente: boolean; salario: number; id_sucursal: number }) =>
        apiFetch('/empleado', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: number, data: { nombre: string; apellido: string; es_gerente: boolean; salario: number; id_sucursal: number }) =>
        apiFetch(`/empleado/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    
    delete: (id: number) =>
        apiFetch(`/empleado/${id}`, { method: 'DELETE' }),
};