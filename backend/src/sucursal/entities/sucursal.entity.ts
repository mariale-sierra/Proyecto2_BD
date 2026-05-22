import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { Venta } from '../../venta/entities/venta.entity';

@Entity({ name: 'sucursal' })
export class Sucursal {
  @PrimaryGeneratedColumn({ name: 'id_sucursal' })
  id_sucursal!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono!: string;

  @Column({ type: 'text', nullable: true })
  direccion!: string;

  @Column({ type: 'time', name: 'hora_abre', nullable: true })
  hora_abre!: string;

  @Column({ type: 'time', name: 'hora_cierra', nullable: true })
  hora_cierra!: string;

  @OneToMany(() => Empleado, (empleado) => empleado.sucursal)
  empleados?: Empleado[];

  @OneToMany(() => Venta, (venta) => venta.sucursal)
  ventas?: Venta[];
}