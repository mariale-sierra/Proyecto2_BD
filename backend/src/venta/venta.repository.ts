import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DetalleVenta } from './entities/detalle-venta.entity';

@Injectable()
export class VentaRepository {
    async insertarVenta(
        manager: EntityManager,
        id_cliente: number,
        id_empleado: number,
        id_sucursal: number,
        total: number,
    ): Promise<number> {
        const venta = manager.getRepository(Venta).create({
            fecha: new Date(),
            total,
            id_cliente,
            id_empleado,
            id_sucursal,
            cliente: { id_cliente } as any,
            empleado: { id_empleado } as any,
            sucursal: { id_sucursal } as any,
        });

        const guardada = await manager.getRepository(Venta).save(venta);
        return guardada.id_venta;
    }

    async insertarDetalle(
        manager: EntityManager,
        id_venta: number,
        id_producto: number,
        cantidad: number,
        precio_unitario: number,
    ): Promise<void> {
        const detalle = manager.getRepository(DetalleVenta).create({
            id_venta,
            id_producto,
            cantidad,
            precio_unitario,
            venta: { id_venta } as any,
            producto: { id_producto } as any,
        });

        await manager.getRepository(DetalleVenta).save(detalle);
    }

    async descontarStock(
        manager: EntityManager,
        id_producto: number,
        id_sucursal: number,
        cantidad: number,
    ): Promise<void> {
        await manager.query(
            `UPDATE stock_sucursal
             SET cantidad = cantidad - $1
             WHERE id_producto = $2 AND id_sucursal = $3`,
            [cantidad, id_producto, id_sucursal],
        );
    }
}