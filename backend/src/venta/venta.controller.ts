import { Controller, Post, Body, Get, Param, HttpException, Query, Put } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  async crear(@Body() dto: CreateVentaDto) {
    const resultado = await this.ventaService.crearVenta(dto);
    if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
    return resultado;
  }

  @Post('reabastecer')
  async reabastecer(@Body() dto: { id_producto: number; id_sucursal: number; cantidad: number }) {
      const resultado = await this.ventaService.reabastecerStock(dto.id_producto, dto.id_sucursal, dto.cantidad);
      if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
      return { mensaje: 'Stock actualizado correctamente' };
  }

  @Get('factura/:id')
  async factura(@Param('id') id: string) {
      const resultado = await this.ventaService.generarFactura(Number(id));
      if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
      return resultado.factura;
  }

  @Put('precio/:id')
  async actualizarPrecio(@Param('id') id: string, @Body() dto: { precio_nuevo: number }) {
      const resultado = await this.ventaService.actualizarPrecio(Number(id), dto.precio_nuevo);
      if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
      return { mensaje: 'Precio actualizado correctamente' };
  }

  @Get('reporte')
  async reporte(
      @Query('id_sucursal') id_sucursal?: string,
      @Query('fecha_inicio') fecha_inicio?: string,
      @Query('fecha_fin') fecha_fin?: string
  ) {
      const resultado = await this.ventaService.reporteVentas(
          id_sucursal ? Number(id_sucursal) : undefined,
          fecha_inicio,
          fecha_fin
      );
      if (!resultado.ok) throw new HttpException(resultado.mensaje ?? 'Error', 400);
      return resultado.data;
  }
}