
import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { Producto } from './entities/producto.entity';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CreateProductoDto } from './dto/create-producto.dto';

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

    async create(dto: CreateProductoDto) {
        const res = await this.db.query(
            `INSERT INTO Producto (nombre, precio_venta, id_categoria)
             VALUES ($1, $2, $3) RETURNING *`,
            [dto.nombre, dto.precio_venta, dto.id_categoria]
        );
        const row = res.rows[0];
        return new Producto(row.id_producto, row.nombre, row.precio_venta, row.id_categoria);
    }

    async updateProducto(id: number, dto: UpdateProductoDto) {
    await this.db.query(
        `UPDATE producto 
        SET nombre = COALESCE($1, nombre),
            precio_venta = COALESCE($2, precio_venta),
            id_categoria = COALESCE($3, id_categoria)
        WHERE id_producto = $4`,
        [dto.nombre, dto.precio_venta, dto.id_categoria, id]
    );
    
    }

    async updateStock(id_producto: number, id_sucursal: number, stock: number) {
    await this.db.query(
        `INSERT INTO stock_sucursal (id_producto, id_sucursal, cantidad)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_producto, id_sucursal)
        DO UPDATE SET cantidad = EXCLUDED.cantidad`,
        [id_producto, id_sucursal, stock]
    );
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