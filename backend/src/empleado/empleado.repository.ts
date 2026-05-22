import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { Sucursal } from '../sucursal/entities/sucursal.entity';

@Injectable()
export class EmpleadoRepository {
    constructor(
        @InjectRepository(Empleado)
        private readonly empleadoRepository: Repository<Empleado>,
    ) {}

    async findAll() {
        return this.empleadoRepository
            .createQueryBuilder('empleado')
            .leftJoin('empleado.sucursal', 'sucursal')
            .select('empleado.id_empleado', 'id_empleado')
            .addSelect('empleado.nombre', 'nombre')
            .addSelect('empleado.apellido', 'apellido')
            .addSelect('empleado.es_gerente', 'es_gerente')
            .addSelect('empleado.salario', 'salario')
            .addSelect('empleado.id_sucursal', 'id_sucursal')
            .addSelect('sucursal.nombre', 'nombre_sucursal')
            .orderBy('sucursal.nombre', 'ASC')
            .addOrderBy('empleado.apellido', 'ASC')
            .getRawMany();
    }

    async findById(id: number) {
        return this.empleadoRepository.findOneBy({ id_empleado: id });
    }

    async findByCarnet(id_empleado: number) {
        return this.empleadoRepository
            .createQueryBuilder('empleado')
            .leftJoin('empleado.sucursal', 'sucursal')
            .select('empleado.id_empleado', 'id_empleado')
            .addSelect('empleado.nombre', 'nombre')
            .addSelect('empleado.apellido', 'apellido')
            .addSelect('empleado.es_gerente', 'es_gerente')
            .addSelect('empleado.salario', 'salario')
            .addSelect('sucursal.nombre', 'nombre_sucursal')
            .where('empleado.id_empleado = :id_empleado', { id_empleado })
            .getRawOne();
    }

    async findBySucursal(id_sucursal: number) {
        return this.empleadoRepository.find({
            where: { id_sucursal },
            order: { apellido: 'ASC' },
        });
    }

    async create(nombre: string, apellido: string, es_gerente: boolean, salario: number, id_sucursal: number) {
        const empleado = this.empleadoRepository.create({
            nombre,
            apellido,
            es_gerente,
            salario,
            id_sucursal,
            sucursal: { id_sucursal } as Sucursal,
        });

        return this.empleadoRepository.save(empleado);
    }

    async update(id: number, nombre: string, apellido: string, es_gerente: boolean, salario: number, id_sucursal: number) {
        const empleado = await this.empleadoRepository.preload({
            id_empleado: id,
            nombre,
            apellido,
            es_gerente,
            salario,
            id_sucursal,
            sucursal: { id_sucursal } as Sucursal,
        });

        if (!empleado) {
            return null;
        }

        return this.empleadoRepository.save(empleado);
    }

    async delete(id: number) {
        await this.empleadoRepository.delete(id);
    }

    async countGerentes(id_sucursal: number, excluir_id?: number): Promise<number> {
        const query = this.empleadoRepository
            .createQueryBuilder('empleado')
            .where('empleado.id_sucursal = :id_sucursal', { id_sucursal })
            .andWhere('empleado.es_gerente = true');

        if (excluir_id !== undefined) {
            query.andWhere('empleado.id_empleado != :excluir_id', { excluir_id });
        }

        return query.getCount();
    }
}