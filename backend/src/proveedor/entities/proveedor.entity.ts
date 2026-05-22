import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Suministro } from './suministro.entity';

@Entity({ name: 'proveedor' })
export class Proveedor {
	@PrimaryGeneratedColumn({ name: 'id_proveedor' })
	id_proveedor!: number;

	@Column({ type: 'varchar', length: 100 })
	nombre!: string;

	@Column({ type: 'varchar', length: 20, nullable: true })
	telefono?: string;

	@Column({ type: 'varchar', length: 100, nullable: true })
	correo?: string;

	@Column({ type: 'text', nullable: true })
	direccion?: string;

	@OneToMany(() => Suministro, (suministro) => suministro.proveedor)
	suministros?: Suministro[];
}
