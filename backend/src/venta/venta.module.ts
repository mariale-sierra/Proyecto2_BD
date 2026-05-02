import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { VentaRepository } from './venta.repository';

@Module({
  controllers: [VentaController],
  providers: [VentaService, VentaRepository],
})
export class VentaModule {}
