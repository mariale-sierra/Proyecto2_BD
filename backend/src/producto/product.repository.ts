
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CreateProductoDto } from './dto/create-producto.dto';
import { Categoria } from '../categoria/entities/categoria.entity';

@Injectable()
export class ProductoRepository {
    constructor(
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,
    ) {}

    async findBySucursal(id_sucursal: number, search?: string) {
        return this.productoRepository.query(
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
            [id_sucursal, search ?? null],
        );
    }

    async findStockBajo(id_sucursal: number, minimo: number = 5) {
        return this.productoRepository.query(
            `SELECT p.id_producto, p.nombre, ss.cantidad AS stock_actual
             FROM producto p
             INNER JOIN stock_sucursal ss ON p.id_producto = ss.id_producto
             WHERE ss.id_sucursal = $1
               AND ss.cantidad < $2
               AND EXISTS (SELECT 1 FROM suministro s WHERE s.id_producto = p.id_producto)
             ORDER BY ss.cantidad ASC`,
            [id_sucursal, minimo],
        );
    }

    async create(dto: CreateProductoDto) {
        const producto = this.productoRepository.create({
            nombre: dto.nombre,
            precio_venta: dto.precio_venta,
            id_categoria: dto.id_categoria,
            categoria: { id_categoria: dto.id_categoria } as Categoria,
        });

        return this.productoRepository.save(producto);
    }

    async updateProducto(id: number, dto: UpdateProductoDto) {
        const producto = await this.productoRepository.preload({
            id_producto: id,
            nombre: dto.nombre,
            precio_venta: dto.precio_venta,
            id_categoria: dto.id_categoria,
            categoria: dto.id_categoria ? ({ id_categoria: dto.id_categoria } as Categoria) : undefined,
        });

        if (!producto) {
            return null;
        }

        return this.productoRepository.save(producto);
    }

    async updateStock(id_producto: number, id_sucursal: number, stock: number) {
        await this.productoRepository.query(
            `INSERT INTO stock_sucursal (id_producto, id_sucursal, cantidad)
             VALUES ($1, $2, $3)
             ON CONFLICT (id_producto, id_sucursal)
             DO UPDATE SET cantidad = EXCLUDED.cantidad`,
            [id_producto, id_sucursal, stock],
        );
    }

    async findStockCompleto(id_sucursal: number) {
        return this.productoRepository.query(
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
            [id_sucursal],
        );
    }


    async findCategorias() {
        return this.categoriaRepository.find({ order: { nombre: 'ASC' } });
    }

    async findById(id: number) {
        return this.productoRepository.findOne({
            where: { id_producto: id },
            relations: { categoria: true },
        });
    }

    async delete(id: number) {
        await this.productoRepository.delete(id);
    }
}