
import { Controller, Get, Post, Put, Body, Param, Query, HttpException, Delete } from '@nestjs/common';
import { ProductoService } from './producto.service';

@Controller('producto')
export class ProductoController {
    constructor(private productoService: ProductoService) {}

    @Get()                           
    async findAll(
        @Query('id_sucursal') id_sucursal: string,
        @Query('search') search?: string
    ) {
        if (!id_sucursal) throw new HttpException('id_sucursal es requerido', 400);
        return await this.productoService.findBySucursal(Number(id_sucursal), search);
    }

    @Get('stock')                     
    async stockCompleto(@Query('id_sucursal') id_sucursal: string) {
        if (!id_sucursal) throw new HttpException('id_sucursal es requerido', 400);
        return await this.productoService.findStockCompleto(Number(id_sucursal));
    }

    @Get('stock-bajo')              
    async stockBajo(
        @Query('id_sucursal') id_sucursal: string,
        @Query('minimo') minimo?: string
    ) {
        if (!id_sucursal) throw new HttpException('id_sucursal es requerido', 400);
        return await this.productoService.findStockBajo(Number(id_sucursal));
    }

    @Get('categorias')                 
    async findCategorias() {
        return await (this.productoService as any).findCategorias();
    }

    @Get(':id')                        
    async findById(@Param('id') id: string) {
        return await this.productoService.findBySucursal(Number(id));
    }

    @Post()                            
    async create(@Body() dto: { nombre: string; precio_venta: number; id_categoria: number }) {
        const resultado = await this.productoService.create(dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return resultado.producto;
    }

    @Put(':id')                        
    async update(
        @Param('id') id: string,
        @Body() dto: { nombre: string; precio_venta: number; id_categoria: number }
    ) {
        const resultado = await this.productoService.update(Number(id), dto);
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return resultado.producto;
    }

    @Delete(':id')                     
    async delete(@Param('id') id: string) {
        const resultado = await this.productoService.delete(Number(id));
        if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
        return { mensaje: 'Producto eliminado correctamente' };
    }
}