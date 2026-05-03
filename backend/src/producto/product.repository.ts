
import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductoRepository {
    constructor(@Inject('DB_POOL') private db: Pool) {}

    async findBySucursal(id_sucursal: number, search?: string) {
    const res = await this.db.query(
        `SELECT p.id_producto, p.nombre, p.precio_venta,
                c.nombre AS categoria,
                COALESCE(ss.cantidad, 0) AS stock
         FROM producto p
         JOIN categoria c ON p.id_categoria = c.id_categoria
         LEFT JOIN stock_sucursal ss 
            ON p.id_producto = ss.id_producto 
            AND ss.id_sucursal = $1
         WHERE ($2::text IS NULL OR LOWER(p.nombre) LIKE LOWER('%' || $2 || '%'))
         ORDER BY c.nombre, p.nombre`,
        [id_sucursal, search ?? null]
    );
    return res.rows;
}

    async findStockBajo(id_sucursal: number, minimo: number = 5) {
    const res = await this.db.query(
        `SELECT p.id_producto, p.nombre,
                ss.cantidad AS stock_actual
         FROM producto p
         JOIN stock_sucursal ss ON p.id_producto = ss.id_producto
         WHERE ss.id_sucursal = $1
           AND ss.cantidad < $2
           AND EXISTS (
               SELECT 1 FROM suministro s
               WHERE s.id_producto = p.id_producto
           )
         ORDER BY ss.cantidad ASC`,
        [id_sucursal, minimo]
    );
    return res.rows;
}

    async create(nombre: string, precio_venta: number, id_categoria: number) {
        const res = await this.db.query(
            `INSERT INTO Producto (nombre, precio_venta, id_categoria)
             VALUES ($1, $2, $3) RETURNING *`,
            [nombre, precio_venta, id_categoria]
        );
        const row = res.rows[0];
        return new Producto(row.id_producto, row.nombre, row.precio_venta, row.id_categoria);
    }

    async update(id: number, nombre: string, precio_venta: number, id_categoria: number) {
        const res = await this.db.query(
            `UPDATE Producto SET nombre=$1, precio_venta=$2, id_categoria=$3
             WHERE id_producto=$4 RETURNING *`,
            [nombre, precio_venta, id_categoria, id]
        );
        const row = res.rows[0];
        return row ? new Producto(row.id_producto, row.nombre, row.precio_venta, row.id_categoria) : null;
    }

    async findStockCompleto(id_sucursal: number) {
        const res = await this.db.query(
            `SELECT p.id_producto, p.nombre, p.precio_venta,
                    c.nombre AS categoria,
                    COALESCE(ss.cantidad, 0) AS stock,
                    CASE 
                        WHEN COALESCE(ss.cantidad, 0) = 0 THEN 'sin_stock'
                        WHEN COALESCE(ss.cantidad, 0) < 5 THEN 'bajo'
                        ELSE 'ok'
                    END AS nivel_stock
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            LEFT JOIN stock_sucursal ss 
                ON p.id_producto = ss.id_producto 
                AND ss.id_sucursal = $1
            ORDER BY nivel_stock ASC, p.nombre ASC`,
            [id_sucursal]
        );
        return res.rows;
    }


    async findCategorias() {
        const res = await this.db.query(
            `SELECT id_categoria, nombre FROM categoria ORDER BY nombre`
        );
        return res.rows;
    }

    async findById(id: number) {
        const res = await this.db.query(
            `SELECT p.id_producto, p.nombre, p.precio_venta,
                    p.id_categoria, c.nombre AS categoria
            FROM producto p
            JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = $1`,
            [id]
        );
        return res.rows[0] || null;
    }

    async delete(id: number) {
        await this.db.query(
            `DELETE FROM producto WHERE id_producto = $1`,
            [id]
        );
    }
}