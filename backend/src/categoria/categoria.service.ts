import { Injectable } from '@nestjs/common';
import { CategoriaRepository } from './categoria.repository';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaService {
  constructor(private readonly categoriaRepository: CategoriaRepository) {}

  findAll() {
    return this.categoriaRepository.findAll();
  }

  async create(dto: CreateCategoriaDto) {
    const categoria = await this.categoriaRepository.create(dto);
    return { ok: true, categoria, mensaje: 'Categoría creada exitosamente' };
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    const existe = await this.categoriaRepository.findById(id);
    if (!existe) {
      return { ok: false, mensaje: 'Categoría no encontrada' };
    }

    const categoria = await this.categoriaRepository.update(id, dto);
    return { ok: true, categoria };
  }

  async delete(id: number) {
    const existe = await this.categoriaRepository.findById(id);
    if (!existe) {
      return { ok: false, mensaje: 'Categoría no encontrada' };
    }

    await this.categoriaRepository.delete(id);
    return { ok: true };
  }
}