import { Body, Controller, Delete, Get, HttpException, Param, Post, Put } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  findAll() {
    return this.categoriaService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateCategoriaDto) {
    const resultado = await this.categoriaService.create(dto);
    if (!resultado.ok) {
      throw new HttpException(resultado.mensaje ?? 'Error', 400);
    }

    return resultado.categoria;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    const resultado = await this.categoriaService.update(Number(id), dto);
    if (!resultado.ok) {
      throw new HttpException(resultado.mensaje ?? 'Error', 400);
    }

    return resultado.categoria;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const resultado = await this.categoriaService.delete(Number(id));
    if (!resultado.ok) {
      throw new HttpException(resultado.mensaje ?? 'Error', 400);
    }

    return { mensaje: 'Categoría eliminada correctamente' };
  }
}