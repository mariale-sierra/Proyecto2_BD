import { Injectable } from '@nestjs/common';
import { SucursalRepository } from './sucursal.repository';

@Injectable()
export class SucursalService {
    constructor(private sucursalRepo: SucursalRepository) {}

    async findAll() {
        return await this.sucursalRepo.findAll();
    }

    async create(dto: { nombre: string; telefono: string; direccion: string; hora_abre: string; hora_cierra: string }) {
        const sucursal = await this.sucursalRepo.create(
            dto.nombre, dto.telefono, dto.direccion, dto.hora_abre, dto.hora_cierra
        );
        return { ok: true, sucursal };
    }

    async update(id: number, dto: { nombre: string; telefono: string; direccion: string; hora_abre: string; hora_cierra: string }) {
        const existe = await this.sucursalRepo.findById(id);
        if (!existe) return { ok: false, mensaje: 'Sucursal no encontrada' };
        const sucursal = await this.sucursalRepo.update(
            id, dto.nombre, dto.telefono, dto.direccion, dto.hora_abre, dto.hora_cierra
        );
        return { ok: true, sucursal };
    }

    async delete(id: number) {
        const existe = await this.sucursalRepo.findById(id);
        if (!existe) return { ok: false, mensaje: 'Sucursal no encontrada' };
        try {
            await this.sucursalRepo.delete(id);
            return { ok: true };
        } catch (err) {
            return { ok: false, mensaje: 'No se puede eliminar, la sucursal tiene empleados o ventas registradas' };
        }
    }
}