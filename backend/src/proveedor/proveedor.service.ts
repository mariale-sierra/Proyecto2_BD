import { Injectable } from '@nestjs/common';
import { ProveedorRepository } from './proveedor.repository';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Injectable()
export class ProveedorService {
    constructor(private proveedorRepo: ProveedorRepository) {}

    async findAll() {
        return await this.proveedorRepo.findAll();
    }

    async create(dto: CreateProveedorDto) {
        const proveedor = await this.proveedorRepo.create(dto.nombre, dto.telefono, dto.correo, dto.direccion);
        return { ok: true, proveedor, mensaje: 'Proveedor creado exitosamente' };
    }

    async update(id: number, dto: UpdateProveedorDto) {
        const existe = await this.proveedorRepo.findById(id);
        if (!existe) {
            return { ok: false, mensaje: 'Proveedor no encontrado' };
        }

        const proveedor = await this.proveedorRepo.update(
            id,
            dto.nombre ?? existe.nombre,
            dto.telefono ?? existe.telefono,
            dto.correo ?? existe.correo,
            dto.direccion ?? existe.direccion,
        );

        return { ok: true, proveedor, mensaje: 'Proveedor actualizado exitosamente' };
    }

    async delete(id: number) {
        const existe = await this.proveedorRepo.findById(id);
        if (!existe) {
            return { ok: false, mensaje: 'Proveedor no encontrado' };
        }

        await this.proveedorRepo.delete(id);
        return { ok: true, mensaje: 'Proveedor eliminado correctamente' };
    }

    async infoPedido(id_producto: number, id_sucursal: number) {
        return await this.proveedorRepo.findProveedorDeProducto(id_producto, id_sucursal);
    }
}