import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { ProveedorRepository } from './proveedor.repository';

@Injectable()
export class ProveedorService {
    constructor(private proveedorRepo: ProveedorRepository) {}

    async findAll() {
        return await this.proveedorRepo.findAll();
    }

    async infoPedido(id_producto: number, id_sucursal: number) {
        return await this.proveedorRepo.findProveedorDeProducto(id_producto, id_sucursal);
    }
}