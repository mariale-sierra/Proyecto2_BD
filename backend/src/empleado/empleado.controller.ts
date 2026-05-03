// empleado/empleado.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';

@Controller('empleado')
export class EmpleadoController {
    constructor(private empleadoService: EmpleadoService) {}

    @Get()                              
    async findAll() {
        return await this.empleadoService.findAll();
    }

    @Get('carnet/:id')                  
    async findByCarnet(@Param('id') id: string) {
        const resultado = await this.empleadoService.findByCarnet(Number(id));
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 404);
        return resultado.empleado;
    }

    @Get('sucursal/:id')              
    async findBySucursal(@Param('id') id: string) {
        return await this.empleadoService.findBySucursal(Number(id));
    }

    @Post()             
    async create(@Body() dto: { nombre: string; apellido: string; es_gerente: boolean; salario: number; id_sucursal: number }) {
        const resultado = await this.empleadoService.create(dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return resultado.empleado;
    }

    @Put(':id')                       
    async update(@Param('id') id: string, @Body() dto: { nombre: string; apellido: string; es_gerente: boolean; salario: number; id_sucursal: number }) {
        const resultado = await this.empleadoService.update(Number(id), dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return resultado.empleado;
    }

    @Delete(':id')                  
    async delete(@Param('id') id: string) {
        const resultado = await this.empleadoService.delete(Number(id));
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return { mensaje: 'Empleado eliminado correctamente' };
    }
}