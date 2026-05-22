
export class UpdateProductoDto {
  nombre?: string;
  precio_venta?: number;
  id_categoria?: number;
  stock?: number;
  id_sucursal?: number;
  constructor(
    nombre?: string,
    precio_venta?: number,
    id_categoria?: number,
    stock?: number,
    id_sucursal?: number
  ) {
    this.nombre = nombre;
    this.precio_venta = precio_venta;
    this.id_categoria = id_categoria;
    this.stock = stock;
    this.id_sucursal = id_sucursal;
  }
}