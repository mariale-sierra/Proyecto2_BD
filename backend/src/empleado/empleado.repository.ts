import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { Sucursal } from '../sucursal/entities/sucursal.entity';

@Injectable()
export class EmpleadoRepository {
    private roleColumnAvailable: boolean | null = null;

    private resolveRol(esGerente: boolean) {
        return esGerente ? 'gerente_sucursal' : 'vendedor';
    }

    private async hasRoleColumn() {
        if (this.roleColumnAvailable !== null) {
            return this.roleColumnAvailable;
        }

        const rows = await this.empleadoRepository.query(
            `SELECT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'empleado' AND column_name = 'rol'
            ) AS exists`
        );

        this.roleColumnAvailable = Boolean(rows?.[0]?.exists);
        return this.roleColumnAvailable;
    }

    private async buildQuery() {
        const query = this.empleadoRepository
            .createQueryBuilder('empleado')
            .leftJoin('empleado.sucursal', 'sucursal')
            .select('empleado.id_empleado', 'id_empleado')
            .addSelect('empleado.nombre', 'nombre')
            .addSelect('empleado.apellido', 'apellido')
            .addSelect('empleado.es_gerente', 'es_gerente')
            .addSelect('empleado.salario', 'salario')
            .addSelect('empleado.id_sucursal', 'id_sucursal')
            .addSelect('sucursal.nombre', 'nombre_sucursal');

        if (await this.hasRoleColumn()) {
            query.addSelect('empleado.rol', 'rol');
        }

        return query;
    }

    constructor(
        @InjectRepository(Empleado)
        private readonly empleadoRepository: Repository<Empleado>,
    ) {}

    async findAll() {
        const query = await this.buildQuery();
        return query
            .orderBy('sucursal.nombre', 'ASC')
            .addOrderBy('empleado.apellido', 'ASC')
            .getRawMany();
    }

    async findById(id: number) {
        const query = await this.buildQuery();
        return query.where('empleado.id_empleado = :id', { id }).getRawOne();
    }

    async findByCarnet(id_empleado: number) {
        const query = await this.buildQuery();
        return query.where('empleado.id_empleado = :id_empleado', { id_empleado }).getRawOne();
    }

    async findBySucursal(id_sucursal: number) {
        const query = await this.buildQuery();
        return query
            .where('empleado.id_sucursal = :id_sucursal', { id_sucursal })
            .orderBy('empleado.apellido', 'ASC')
            .getRawMany();
    }

    async create(nombre: string, apellido: string, es_gerente: boolean, salario: number, id_sucursal: number) {
        const hasRoleColumn = await this.hasRoleColumn();
        const empleado = this.empleadoRepository.create({
            nombre,
            apellido,
            es_gerente,
            salario,
            id_sucursal,
            sucursal: { id_sucursal } as Sucursal,
            ...(hasRoleColumn ? { rol: this.resolveRol(es_gerente) } : {}),
        });

        return this.empleadoRepository.save(empleado);
    }

    async update(id: number, nombre: string, apellido: string, es_gerente: boolean, salario: number, id_sucursal: number) {
        const hasRoleColumn = await this.hasRoleColumn();
        const empleado = await this.empleadoRepository.preload({
            id_empleado: id,
            nombre,
            apellido,
            es_gerente,
            salario,
            id_sucursal,
            sucursal: { id_sucursal } as Sucursal,
            ...(hasRoleColumn ? { rol: this.resolveRol(es_gerente) } : {}),
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