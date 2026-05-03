export class Producto {
    id_producto: number;
    nombre: string;
    precio_venta: number;
    id_categoria: number;
    constructor(
        id_producto: number,
        nombre: string,
        precio_venta: number,
        id_categoria: number
    ) {
        this.id_producto = id_producto;
        this.nombre = nombre;
        this.precio_venta = precio_venta;
        this.id_categoria = id_categoria;
    }
}
