// proveedor.repository.ts
import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
@Injectable()
export class ProveedorRepository {
    constructor(@Inject('DB_POOL') private db: Pool) {}

    async findAll() {
        const res = await this.db.query(
            `SELECT p.id_proveedor, p.nombre, p.telefono, p.correo, p.direccion,
                    COUNT(s.id_producto) AS total_productos
             FROM proveedor p
             LEFT JOIN suministro s ON p.id_proveedor = s.id_proveedor
             GROUP BY p.id_proveedor
             ORDER BY p.nombre`
        );
        return res.rows;
    }

    async findProveedorDeProducto(id_producto: number, id_sucursal: number) {
        const res = await this.db.query(
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
            [id_producto, id_sucursal]
        );
        return res.rows[0] || null;
    }
}