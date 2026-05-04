export class CreateVentaDto {
    id_cliente: number;
    id_empleado: number;
    items: {
        id_producto: number;
        cantidad: number;
        precio_unitario: number;
    }[];

    constructor(
        id_cliente: number,
        id_empleado: number,
        items: {
            id_producto: number;
            cantidad: number;
            precio_unitario: number;
        }[]
    ) {
        this.id_cliente = id_cliente;
        this.id_empleado = id_empleado;
        this.items = items;
    }
}