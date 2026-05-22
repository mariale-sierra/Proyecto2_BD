import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';
import { Proveedor } from './proveedor.entity';

@Entity({ name: 'suministro' })
export class Suministro {
  @PrimaryColumn({ name: 'id_producto', type: 'int' })
  id_producto!: number;

  @PrimaryColumn({ name: 'id_proveedor', type: 'int' })
  id_proveedor!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'precio_compra' })
  precio_compra!: number;

  @ManyToOne(() => Producto, (producto) => producto.suministros, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_producto' })
  producto!: Producto;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.suministros, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor!: Proveedor;
}