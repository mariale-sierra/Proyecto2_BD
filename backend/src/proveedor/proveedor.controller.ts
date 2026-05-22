import { Controller, Get, Post, Body, Param, Delete, Query, HttpException, Put } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';

@Controller('proveedor')
export class ProveedorController {
    constructor(private proveedorService: ProveedorService) {}

    @Get()                              
    async findAll() {
        return await this.proveedorService.findAll();
    }

    @Post()
    async create(@Body() dto: CreateProveedorDto) {
        const resultado = await this.proveedorService.create(dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return resultado.proveedor;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateProveedorDto) {
        const resultado = await this.proveedorService.update(Number(id), dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return resultado.proveedor;
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        const resultado = await this.proveedorService.delete(Number(id));
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return { mensaje: 'Proveedor eliminado correctamente' };
    }

    @Get('pedido')
    async infoPedido(
        @Query('id_producto') id_producto: string,
        @Query('id_sucursal') id_sucursal: string
    ) {
        if (!id_producto || !id_sucursal) {
            throw new HttpException('id_producto e id_sucursal son requeridos', 400);
        }
        const info = await this.proveedorService.infoPedido(Number(id_producto), Number(id_sucursal));
        if (!info) throw new HttpException('No se encontró proveedor para este producto', 404);
        return info;
    }
}
