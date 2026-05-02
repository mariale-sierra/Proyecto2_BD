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

    async crearVenta(dto: CreateVentaDto): Promise<{ ok: boolean; id_venta?: number; mensaje?: string }> {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            const total = dto.items.reduce(
                (sum, item) => sum + item.cantidad * item.precio_unitario, 0
            );

            const id_venta = await this.ventasRepo.insertarVenta(
                dto.id_cliente, dto.id_empleado, dto.id_sucursal, total, client  // pasas el client
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
            return { ok: true, id_venta };

        } catch (err) {
            await client.query('ROLLBACK');
            const mensaje = err instanceof Error ? err.message : String(err);
            return { ok: false, mensaje: 'Error al registrar la venta: ' + mensaje };
        } finally {
            client.release();  
        }
    }
}