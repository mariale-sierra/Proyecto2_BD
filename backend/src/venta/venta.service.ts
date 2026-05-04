import { Injectable, Inject } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentaRepository } from './venta.repository';
import { Pool } from 'pg';

@Injectable()
export class VentaService {
    constructor(
        private ventasRepo: VentaRepository,
        @Inject('DB_POOL') private db: Pool 
    ) {}

    async crearVenta(dto: CreateVentaDto) {
    const client = await this.db.connect();
    try {
        await client.query('BEGIN');

        const empleadoRes = await client.query(
            `SELECT id_sucursal FROM empleado WHERE id_empleado = $1`,
            [dto.id_empleado]
        );

        if (empleadoRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return { ok: false, mensaje: 'Empleado no encontrado' };
        }

        const id_sucursal_empleado = Number(empleadoRes.rows[0].id_sucursal);
        const id_sucursal_dto = Number(dto.id_sucursal);

        if (id_sucursal_empleado !== id_sucursal_dto) {
        await client.query('ROLLBACK');
        return { ok: false, mensaje: 'Empleado no pertenece a esta sucursal' };
        }
                


        const total = dto.items.reduce(
            (sum, item) => sum + item.cantidad * item.precio_unitario, 0
        );

        const id_venta = await this.ventasRepo.insertarVenta(
            dto.id_cliente, dto.id_empleado, dto.id_sucursal, total, client 
        );

        for (const item of dto.items) {
            await this.ventasRepo.insertarDetalle(
                id_venta, item.id_producto, item.cantidad, item.precio_unitario, client
            );
            await this.ventasRepo.descontarStock(
                item.id_producto, dto.id_sucursal, item.cantidad, client 
            );
        }

        await client.query('COMMIT');
        return { ok: true, id_venta, id_sucursal: dto.id_sucursal };

    } catch (err) {
        console.error('ERROR REAL:', err); 
        await client.query('ROLLBACK');
        const mensaje = err instanceof Error ? err.message : String(err);
        return { ok: false, mensaje: 'Error al registrar la venta: ' + mensaje };
    } finally {
        client.release();
    }
}
}