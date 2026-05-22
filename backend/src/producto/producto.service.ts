import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { ProductoRepository } from './product.repository';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductoService {
  constructor(private prodRepo: ProductoRepository) {}
    async findBySucursal(id_sucursal: number, search?: string) {
      return this.prodRepo.findBySucursal(id_sucursal, search);
    }

    async findStockBajo(id_sucursal: number) {
      return this.prodRepo.findStockBajo(id_sucursal);
    }

    async create( dto: CreateProductoDto) {
        const categorias = await this.prodRepo.findCategorias();
        const existe = categorias.find(c => c.id_categoria === dto.id_categoria);
        if (!existe) return { ok: false, mensaje: 'Categoría no encontrada' };

        const producto = await this.prodRepo.create(dto);
        return { ok: true, producto, mensaje: 'Producto creado exitosamente' };
    }

    async update(id: number, dto: UpdateProductoDto) {
      const existe = await this.prodRepo.findById(id);
      if (!existe) return { ok: false, mensaje: 'Producto no encontrado' };

      const producto = await this.prodRepo.updateProducto(id, dto);

      if (dto.stock !== undefined && dto.id_sucursal !== undefined) {
        await this.prodRepo.updateStock(id, dto.id_sucursal, dto.stock);
      }

      return { ok: true, producto, mensaje: 'Producto actualizado exitosamente' };
    }

    async findStockCompleto(id_sucursal: number) {
      return this.prodRepo.findStockCompleto(id_sucursal);
    }

    async findById(id: number) {
      return this.prodRepo.findById(id);
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
