import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { DetalleVenta } from '../../venta/entities/detalle-venta.entity';
import { Suministro } from '../../proveedor/entities/suministro.entity';

@Entity({ name: 'producto' })
export class Producto {
  @PrimaryGeneratedColumn({ name: 'id_producto' })
  id_producto!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'precio_venta' })
  precio_venta!: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos, { nullable: false })
  @JoinColumn({ name: 'id_categoria' })
  categoria!: Categoria;

  @Column({ name: 'id_categoria' })
  id_categoria!: number;

  @OneToMany(() => Suministro, (suministro) => suministro.producto)
  suministros?: Suministro[];

  @OneToMany(() => DetalleVenta, (detalle) => detalle.producto)
  detallesVenta?: DetalleVenta[];
}
