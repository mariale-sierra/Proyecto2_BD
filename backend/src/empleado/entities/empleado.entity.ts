import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Sucursal } from '../../sucursal/entities/sucursal.entity';
import { Venta } from '../../venta/entities/venta.entity';

@Entity({ name: 'empleado' })
export class Empleado {
  @PrimaryGeneratedColumn({ name: 'id_empleado' })
  id_empleado!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  apellido!: string;

  @Column({ type: 'boolean', name: 'es_gerente', default: false })
  es_gerente!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salario!: number;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.empleados, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal?: Sucursal;

  @Column({ name: 'id_sucursal', nullable: true })
  id_sucursal!: number;

  @OneToMany(() => Venta, (venta) => venta.empleado)
  ventas?: Venta[];
}