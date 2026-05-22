import { Controller, Get, Post, Body, Put, Param, Delete, Query, HttpException } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Controller('cliente')
export class ClienteController {
    constructor(private clienteService: ClienteService) {} 

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
        return await this.clienteService.buscar(q);  
    }

    @Post()
    async create(@Body() dto: CreateClienteDto) {
        const resultado = await this.clienteService.create(dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return resultado.cliente;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: CreateClienteDto) {
        const resultado = await this.clienteService.update(Number(id), dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return resultado.cliente;
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        const resultado = await this.clienteService.delete(Number(id));
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return { mensaje: 'Cliente eliminado correctamente' };
    }
}