import { apiFetch } from './base';

export const proveedoresApi = {
    findAll: () => apiFetch('/proveedor'),
    
    infoPedido: (id_producto: number, id_sucursal: number) =>
        apiFetch(`/proveedor/pedido?id_producto=${id_producto}&id_sucursal=${id_sucursal}`),
};