import { apiFetch } from './base';

export const productosApi = {
    findBySucursal: (id_sucursal: number, search?: string) =>
        apiFetch(`/producto?id_sucursal=${id_sucursal}${search ? `&search=${search}` : ''}`),
    
    stockCompleto: (id_sucursal: number) =>
        apiFetch(`/producto/stock?id_sucursal=${id_sucursal}`),
    
    stockBajo: (id_sucursal: number) =>
        apiFetch(`/producto/stock-bajo?id_sucursal=${id_sucursal}`),
    
    categorias: () => apiFetch('/producto/categorias'),
    
    create: (data: { nombre: string; precio_venta: number; id_categoria: number }) =>
        apiFetch('/producto', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: number, data: { nombre: string; precio_venta: number; id_categoria: number }) =>
        apiFetch(`/producto/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    
    delete: (id: number) =>
        apiFetch(`/producto/${id}`, { method: 'DELETE' }),
};