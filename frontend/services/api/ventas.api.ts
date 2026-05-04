import { apiFetch } from './base';

export const ventasApi = {
    crear: (data: {
        id_cliente: number;
        id_empleado: number;
        id_sucursal: number;
        items: { id_producto: number; cantidad: number; precio_unitario: number }[];
    }) =>
        apiFetch('/venta', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};