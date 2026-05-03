export class CreateProductoDto {
    nombre: string;
    precio_venta: number;
    id_categoria: number;

    constructor(nombre: string, precio_venta: number, id_categoria: number) {
        this.nombre = nombre;
        this.precio_venta = precio_venta;
        this.id_categoria = id_categoria; 
    }
}
