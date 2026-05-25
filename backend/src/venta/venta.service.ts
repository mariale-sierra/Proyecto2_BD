import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';

@Injectable()
export class VentaService {
    constructor(
        @InjectDataSource() private dataSource: DataSource
    ) {}

    async crearVenta(dto: CreateVentaDto) {
    try {
        const itemsJson = JSON.stringify(dto.items);
        console.log('Llamando SP con:', dto.id_cliente, dto.id_empleado, itemsJson); 
        const result = await this.dataSource.query(
            `SELECT registrar_venta($1, $2, $3::jsonb, $4) AS id_venta`,
            [dto.id_cliente, dto.id_empleado, itemsJson, dto.id_sucursal]
        );
        console.log('Resultado SP:', result); 
        return { ok: true, id_venta: result[0].id_venta };
    } catch (err) {
        const mensaje = err instanceof Error ? err.message : String(err);
        console.log('Error SP:', mensaje); 
        return { ok: false, mensaje };
    }
}

    async reabastecerStock(id_producto: number, id_sucursal: number, cantidad: number) {
        try {
            await this.dataSource.query(
                `SELECT reabastecer_stock($1, $2, $3)`,
                [id_producto, id_sucursal, cantidad]
            );
            return { ok: true };
        } catch (err) {
            const mensaje = err instanceof Error ? err.message : String(err);
            return { ok: false, mensaje };
        }
    }

    async generarFactura(id_venta: number) {
        try {
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
            await this.dataSource.query(
                `SELECT actualizar_precio_producto($1, $2)`,
                [id_producto, precio_nuevo]
            );
            return { ok: true };
        } catch (err) {
            const mensaje = err instanceof Error ? err.message : String(err);
            return { ok: false, mensaje };
        }
    }

    async reporteVentas(id_sucursal?: number, fecha_inicio?: string, fecha_fin?: string) {
        try {
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