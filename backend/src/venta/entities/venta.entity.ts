import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { Sucursal } from '../../sucursal/entities/sucursal.entity';
import { DetalleVenta } from './detalle-venta.entity';

@Entity({ name: 'venta' })
export class Venta {
  @PrimaryGeneratedColumn({ name: 'id_venta' })
  id_venta!: number;

  @Column({ type: 'date' })
  fecha!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total!: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.ventas, { nullable: true })
  @JoinColumn({ name: 'id_cliente' })
  cliente?: Cliente;

  @Column({ name: 'id_cliente', nullable: true })
  id_cliente!: number;

  @ManyToOne(() => Empleado, (empleado) => empleado.ventas, { nullable: true })
  @JoinColumn({ name: 'id_empleado' })
  empleado?: Empleado;

  @Column({ name: 'id_empleado', nullable: true })
  id_empleado!: number;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.ventas, { nullable: true })
  @JoinColumn({ name: 'id_sucursal' })
  sucursal?: Sucursal;

  @Column({ name: 'id_sucursal', nullable: true })
  id_sucursal!: number;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta)
  detalles?: DetalleVenta[];
}

