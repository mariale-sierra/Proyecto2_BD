import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ProveedorRepository } from './proveedor.repository';

@Controller('proveedor')
export class ProveedorController {
    constructor(private proveedorRepo: ProveedorRepository) {}

    @Get()                              
    async findAll() {
        return await this.proveedorRepo.findAll();
    }

    @Get('pedido')
    async infoPedido(
        @Query('id_producto') id_producto: string,
        @Query('id_sucursal') id_sucursal: string
    ) {
        if (!id_producto || !id_sucursal) {
            throw new HttpException('id_producto e id_sucursal son requeridos', 400);
        }
        const info = await this.proveedorRepo.findProveedorDeProducto(
            Number(id_producto), Number(id_sucursal)
        );
        if (!info) throw new HttpException('No se encontró proveedor para este producto', 404);
        return info;
    }
}
