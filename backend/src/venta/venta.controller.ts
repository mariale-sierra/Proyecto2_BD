import { Controller, Post, Body, HttpCode, HttpException } from '@nestjs/common';
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';

@Controller('venta')
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  @HttpCode(201)
  async crearVenta(@Body() dto: CreateVentaDto) {
  const resultado = await this.ventaService.crearVenta(dto);

  if (!('id_venta' in resultado)) {
    return { mensaje: resultado.mensaje };
  }

  return {
    id_venta: resultado.id_venta,
    mensaje: resultado.mensaje
  };
}
}