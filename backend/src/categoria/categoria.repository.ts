import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriaRepository {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll() {
    return this.categoriaRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findById(id: number) {
    return this.categoriaRepository.findOneBy({ id_categoria: id });
  }

  async create(dto: CreateCategoriaDto) {
    const categoria = this.categoriaRepository.create(dto);
    return this.categoriaRepository.save(categoria);
  }

  async update(id: number, dto: UpdateCategoriaDto) {
    await this.categoriaRepository.update(id, dto);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.categoriaRepository.delete(id);
  }
}