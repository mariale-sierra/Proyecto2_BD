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
    if(!resultado.ok) {
      throw new HttpException(resultado.mensaje || 'Error al crear venta', 400);
    }
    return { id_venta: resultado.id_venta };  
  }
}