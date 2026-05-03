// empleado/empleado.service.ts
import { Injectable } from '@nestjs/common';
import { EmpleadoRepository } from './empleado.repository';

@Injectable()
export class EmpleadoService {
    constructor(private empleadoRepo: EmpleadoRepository) {}

    async findAll() {
        return await this.empleadoRepo.findAll();
    }

    async findByCarnet(id_empleado: number) {
        const empleado = await this.empleadoRepo.findByCarnet(id_empleado);
        if (!empleado) return { ok: false, mensaje: 'Carnet no encontrado' };
        return { ok: true, empleado };
    }

    async findBySucursal(id_sucursal: number) {
        return await this.empleadoRepo.findBySucursal(id_sucursal);
    }

    async create(dto: { nombre: string; apellido: string; es_gerente: boolean; salario: number; id_sucursal: number }) {
        if (dto.es_gerente) {
            const gerentes = await this.empleadoRepo.countGerentes(dto.id_sucursal);
            if (gerentes >= 1) {
                return { ok: false, mensaje: 'Esta sucursal ya tiene un gerente asignado' };
            }
        }
        const empleado = await this.empleadoRepo.create(
            dto.nombre, dto.apellido, dto.es_gerente, dto.salario, dto.id_sucursal
        );
        return { ok: true, empleado };
    }

    async update(id: number, dto: { nombre: string; apellido: string; es_gerente: boolean; salario: number; id_sucursal: number }) {
        const existe = await this.empleadoRepo.findById(id);
        if (!existe) return { ok: false, mensaje: 'Empleado no encontrado' };
        if (dto.es_gerente) {
            const gerentes = await this.empleadoRepo.countGerentes(dto.id_sucursal, id);
            if (gerentes >= 1) {
                return { ok: false, mensaje: 'Esta sucursal ya tiene un gerente asignado' };
            }
        }
        const empleado = await this.empleadoRepo.update(
            id, dto.nombre, dto.apellido, dto.es_gerente, dto.salario, dto.id_sucursal
        );
        return { ok: true, empleado };
    }

    async delete(id: number) {
        const existe = await this.empleadoRepo.findById(id);
        if (!existe) return { ok: false, mensaje: 'Empleado no encontrado' };
        try {
            await this.empleadoRepo.delete(id);
            return { ok: true };
        } catch (err) {
            return { ok: false, mensaje: 'No se puede eliminar, el empleado tiene ventas registradas' };
        }
    }
}
