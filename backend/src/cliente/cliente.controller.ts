import { Controller, Get, Post, Body, Put, Param, Delete, Query, HttpException } from '@nestjs/common';
import { ClienteService } from './cliente.service'; 
import { CreateClienteDto } from './dto/create-cliente.dto';
import { find } from 'rxjs';
import { Pool } from 'pg';

@Controller('cliente')
export class ClienteController {
  private db: Pool;
  constructor(private clienteService: ClienteService) {
    this.db = new Pool();
  }

  @Get()
  async findAll() {
    return await this.clienteService.findAll();
  }

  @Get('frecuentes')
  async findFrecuentes() {
    return await this.clienteService.findFrecuentes();
  }

  @Get('buscar')
  async buscar(@Query('q') q: string) {
      if (!q) throw new HttpException('Parámetro de búsqueda requerido', 400);
      const res = await this.db.query(
          `SELECT c.id_cliente, c.nombre, c.telefono, c.nit,
                  COUNT(v.id_venta) AS total_compras
          FROM cliente c
          LEFT JOIN venta v ON c.id_cliente = v.id_cliente
          WHERE LOWER(c.nombre) LIKE LOWER('%' || $1 || '%')
              OR c.nit = $1
          GROUP BY c.id_cliente
          ORDER BY total_compras DESC`,
          [q]
      );
      return res.rows;
  }

  @Post()
  async create(@Body() dto: CreateClienteDto) {
    const resultado = await this.clienteService.create(dto);
    if (!resultado.ok) {
      throw new HttpException(resultado.mensaje ?? 'Error no se puede crear cliente', 400);
    }
    return resultado.cliente;
  }

  @Put(':id')                  
    async update(@Param('id') id: string, @Body() dto: CreateClienteDto) {
        const resultado = await this.clienteService.update(Number(id), dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? `Error no se puede editar cliente`, 400);
        return resultado.cliente;
    }

    @Delete(':id')                
    async delete(@Param('id') id: string) {
        const resultado = await this.clienteService.delete(Number(id));
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? `Error no se puede eliminar cliente`, 400);
        return { mensaje: 'Cliente eliminado correctamente' };
    }


}
