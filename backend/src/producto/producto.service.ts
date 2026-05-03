import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { ProductoRepository } from './product.repository';

@Injectable()
export class ProductoService {
  constructor(private prodRepo: ProductoRepository) {}
    async findBySucursal(id_sucursal: number, search?: string) {
      return this.prodRepo.findBySucursal(id_sucursal, search);
    }

    async findStockBajo(id_sucursal: number) {
      return this.prodRepo.findStockBajo(id_sucursal);
    }

    async create(dto: { nombre: string; precio_venta: number; id_categoria: number }) {
        const categorias = await this.prodRepo.findCategorias();
        const existe = categorias.find(c => c.id_categoria === dto.id_categoria);
        if (!existe) return { ok: false, mensaje: 'Categoría no encontrada' };

        const producto = await this.prodRepo.create(dto.nombre, dto.precio_venta, dto.id_categoria);
        return { ok: true, producto };
    }

    async update(id: number, dto: { nombre: string; precio_venta: number; id_categoria: number }) {
        const existe = await this.prodRepo.findById(id);
        if (!existe) return { ok: false, mensaje: 'Producto no encontrado' };

        const producto = await this.prodRepo.update(id, dto.nombre, dto.precio_venta, dto.id_categoria);
        return { ok: true, producto };
    }

    async findStockCompleto(id_sucursal: number) {
      return this.prodRepo.findStockCompleto(id_sucursal);
    }

    async delete(id: number) {
        const existe = await this.prodRepo.findById(id);
        if (!existe) return { ok: false, mensaje: 'Producto no encontrado' };

        try {
            await this.prodRepo.delete(id);
            return { ok: true };
        } catch (err) {
            return { ok: false, mensaje: 'No se puede eliminar, el producto tiene ventas registradas' };
        }

      }

    async findCategorias() {
        return await this.prodRepo.findCategorias();
    }


}
