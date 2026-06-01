import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';

@Injectable()
export class VentaService {
    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) {}

    private async hasProcedure(name: string) {
        const rows = await this.dataSource.query(
            `SELECT EXISTS (
                SELECT 1
                FROM pg_proc
                WHERE proname = $1
                  AND prokind = 'p'
            ) AS exists`,
            [name]
        );

        return Boolean(rows?.[0]?.exists);
    }

    async crearVenta(dto: CreateVentaDto) {
    try {
        const itemsJson = JSON.stringify(dto.items);
        console.log('Llamando SP con:', dto.id_cliente, dto.id_empleado, itemsJson); 
        const procedureAvailable = await this.hasProcedure('registrar_venta');

        if (procedureAvailable) {
            const result = await this.dataSource.query(
                `CALL registrar_venta($1, $2, $3::jsonb, $4)`,
                [dto.id_cliente, dto.id_empleado, itemsJson, dto.id_sucursal]
            );
            console.log('Resultado SP:', result); 
            return { ok: true, id_venta: result[0]?.id_venta };
        }

        const result = await this.dataSource.query(
            `SELECT registrar_venta($1, $2, $3::jsonb, $4) AS id_venta`,
            [dto.id_cliente, dto.id_empleado, itemsJson, dto.id_sucursal]
        );
        console.log('Resultado función:', result); 
        return { ok: true, id_venta: result[0]?.id_venta };
    } catch (err) {
        const mensaje = err instanceof Error ? err.message : String(err);
        console.log('Error SP:', mensaje); 
        return { ok: false, mensaje };
    }
}

    async reabastecerStock(id_producto: number, id_sucursal: number, cantidad: number) {
        try {
            const procedureAvailable = await this.hasProcedure('reabastecer_stock');

            if (procedureAvailable) {
                await this.dataSource.query(
                    `CALL reabastecer_stock($1, $2, $3)`,
                    [id_producto, id_sucursal, cantidad]
                );
            } else {
                await this.dataSource.query(
                    `SELECT reabastecer_stock($1, $2, $3)`,
                    [id_producto, id_sucursal, cantidad]
                );
            }
            return { ok: true };
        } catch (err) {
            const mensaje = err instanceof Error ? err.message : String(err);
            return { ok: false, mensaje };
        }
    }

    async generarFactura(id_venta: number) {
        try {
            const procedureAvailable = await this.hasProcedure('generar_factura');

            if (procedureAvailable) {
                const result = await this.dataSource.query(
                    `CALL generar_factura($1)`,
                    [id_venta]
                );
                return { ok: true, factura: result[0] };
            }

            const result = await this.dataSource.query(
                `SELECT * FROM generar_factura($1)`,
                [id_venta]
            );
            return { ok: true, factura: result[0] };
        } catch (err) {
            const mensaje = err instanceof Error ? err.message : String(err);
            return { ok: false, mensaje };
        }
    }

    async actualizarPrecio(id_producto: number, precio_nuevo: number) {
        try {
            const procedureAvailable = await this.hasProcedure('actualizar_precio_producto');

            if (procedureAvailable) {
                await this.dataSource.query(
                    `CALL actualizar_precio_producto($1, $2)`,
                    [id_producto, precio_nuevo]
                );
            } else {
                await this.dataSource.query(
                    `SELECT actualizar_precio_producto($1, $2)`,
                    [id_producto, precio_nuevo]
                );
            }
            return { ok: true };
        } catch (err) {
            const mensaje = err instanceof Error ? err.message : String(err);
            return { ok: false, mensaje };
        }
    }

    async reporteVentas(id_sucursal?: number, fecha_inicio?: string, fecha_fin?: string) {
        try {
            const procedureAvailable = await this.hasProcedure('reporte_ventas');

            if (procedureAvailable) {
                const result = await this.dataSource.query(
                    `CALL reporte_ventas($1, $2, $3)`,
                    [id_sucursal ?? null, fecha_inicio ?? null, fecha_fin ?? null]
                );
                return { ok: true, data: result[0]?.reporte ?? [] };
            }

            const result = await this.dataSource.query(
                `SELECT * FROM reporte_ventas($1, $2, $3)`,
                [id_sucursal ?? null, fecha_inicio ?? null, fecha_fin ?? null]
            );
            return { ok: true, data: result };
        } catch (err) {
            const mensaje = err instanceof Error ? err.message : String(err);
            return { ok: false, mensaje };
        }
    }
}