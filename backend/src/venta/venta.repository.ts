import {Pool, PoolClient} from 'pg';
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class VentaRepository {
    constructor(@Inject('DB_POOL') private db: Pool) {}
    async insertarVenta(
        id_cliente: number,
        id_empleado: number,
        id_sucursal: number,
        total: number,
        client: PoolClient,
    ): Promise<number> {
        const res = await client.query(
            `INSERT INTO venta (fecha, total, id_cliente, id_empleado, id_sucursal)
             VALUES (NOW(), $1, $2, $3, $4)
             RETURNING id_venta`,
            [total, id_cliente, id_empleado, id_sucursal]
        );
        return res.rows[0].id_venta;
    }

    async insertarDetalle(
        id_venta: number,
        id_producto: number,
        cantidad: number,
        precio_unitario: number,
        client: PoolClient
    ): Promise<void> {
        await client.query(
            `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario)
             VALUES ($1, $2, $3, $4)`,
            [id_venta, id_producto, cantidad, precio_unitario]
        );
    }  

    async descontarStock(
        id_producto: number,
        id_sucursal: number,
        cantidad: number,
        client: PoolClient
    ): Promise<void> {
        await client.query(
            `UPDATE stock_sucursal
             SET cantidad = cantidad - $1
             WHERE id_producto = $2 AND id_sucursal = $3`,
            [cantidad, id_producto, id_sucursal]
        );
    }
}
