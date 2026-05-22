import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity';

@Injectable()
export class ProveedorRepository {
    constructor(
        @InjectRepository(Proveedor)
        private readonly proveedorRepository: Repository<Proveedor>,
    ) {}

    async findAll() {
        return this.proveedorRepository.query(
            `SELECT p.id_proveedor, p.nombre, p.telefono, p.correo, p.direccion,
                    COUNT(s.id_producto) AS total_productos
             FROM proveedor p
             LEFT JOIN suministro s ON p.id_proveedor = s.id_proveedor
             GROUP BY p.id_proveedor
             ORDER BY p.nombre`,
        );
    }

    async findProveedorDeProducto(id_producto: number, id_sucursal: number) {
        return this.proveedorRepository.query(
            `SELECT pr.id_proveedor, pr.nombre AS proveedor, pr.correo, pr.telefono,
                    p.id_producto, p.nombre AS producto,
                    ss.cantidad AS stock_actual,
                    s.precio_compra
             FROM proveedor pr
             JOIN suministro s ON pr.id_proveedor = s.id_proveedor
             JOIN producto p ON s.id_producto = p.id_producto
             LEFT JOIN stock_sucursal ss
                ON p.id_producto = ss.id_producto
                AND ss.id_sucursal = $2
             WHERE p.id_producto = $1
             LIMIT 1`,
            [id_producto, id_sucursal],
        );
    }

    async findById(id: number) {
        return this.proveedorRepository.findOneBy({ id_proveedor: id });
    }

    async create(nombre: string, telefono?: string, correo?: string, direccion?: string) {
        const proveedor = this.proveedorRepository.create({
            nombre,
            telefono,
            correo,
            direccion,
        });

        return this.proveedorRepository.save(proveedor);
    }

    async update(id: number, nombre: string, telefono?: string, correo?: string, direccion?: string) {
        const proveedor = await this.proveedorRepository.preload({
            id_proveedor: id,
            nombre,
            telefono,
            correo,
            direccion,
        });

        if (!proveedor) {
            return null;
        }

        return this.proveedorRepository.save(proveedor);
    }

    async delete(id: number) {
        await this.proveedorRepository.delete(id);
    }
}