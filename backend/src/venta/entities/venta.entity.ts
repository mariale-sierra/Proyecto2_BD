export class Venta {
    id_venta: number;
    fecha: Date;
    total: number;
    id_cliente: number;
    id_empleado: number;
    id_sucursal: number;
    
    constructor(
        id_venta: number,
        fecha: Date,
        total: number,
        id_cliente: number,
        id_empleado: number,
        id_sucursal: number
    ) {
        this.id_venta = id_venta;
        this.fecha = fecha;
        this.total = total;
        this.id_cliente = id_cliente;
        this.id_empleado = id_empleado;
        this.id_sucursal = id_sucursal;
    }
}

