import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';

@Entity({ name: 'cliente' })
export class Cliente {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  id_cliente!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 20 })
  telefono!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  correo?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  nit!: string;

  total_compras?: number;

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas?: Venta[];
}