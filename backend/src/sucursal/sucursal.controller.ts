import { Controller, Get, Post, Put, Delete, Body, Param, HttpException } from '@nestjs/common';
import { SucursalService } from './sucursal.service';

@Controller('sucursal')
export class SucursalController {
    constructor(private sucursalService: SucursalService) {}

    @Get()                           
    async findAll() {
        return await this.sucursalService.findAll();
    }

    @Post()                             
    async create(@Body() dto: { nombre: string; telefono: string; direccion: string; hora_abre: string; hora_cierra: string }) {
        const resultado = await this.sucursalService.create(dto);
        if (!resultado.ok) throw new HttpException('Error', 400);
        return resultado.sucursal;
    }

    @Put(':id')                         
    async update(@Param('id') id: string, @Body() dto: { nombre: string; telefono: string; direccion: string; hora_abre: string; hora_cierra: string }) {
        const resultado = await this.sucursalService.update(Number(id), dto);
        if (!resultado.ok) throw new HttpException('Error', 400);
        return resultado.sucursal;
    }

    @Delete(':id')                      
    async delete(@Param('id') id: string) {
        const resultado = await this.sucursalService.delete(Number(id));
        if (!resultado.ok) throw new HttpException('Error', 400);
        return { mensaje: 'Sucursal eliminada correctamente' };
    }
}