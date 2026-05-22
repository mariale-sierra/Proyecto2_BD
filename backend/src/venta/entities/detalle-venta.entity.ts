import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';
import { Venta } from './venta.entity';

@Entity({ name: 'detalle_venta' })
export class DetalleVenta {
  @PrimaryColumn({ name: 'id_venta', type: 'int' })
  id_venta: number;

  @PrimaryColumn({ name: 'id_producto', type: 'int' })
  id_producto: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'precio_unitario' })
  precio_unitario: number;

  @ManyToOne(() => Venta, (venta) => venta.detalles, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_venta' })
  venta: Venta;

  @ManyToOne(() => Producto, (producto) => producto.detallesVenta, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_producto' })
  producto: Producto;
}