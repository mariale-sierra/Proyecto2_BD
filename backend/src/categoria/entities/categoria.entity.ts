import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Producto } from '../../producto/entities/producto.entity';

@Entity({ name: 'categoria' })
export class Categoria {
  @PrimaryGeneratedColumn({ name: 'id_categoria' })
  id_categoria!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @OneToMany(() => Producto, (producto) => producto.categoria)
  productos?: Producto[];
}