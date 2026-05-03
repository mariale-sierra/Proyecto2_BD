import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { SucursalRepository } from './sucursal.repository';

@Module({
  controllers: [SucursalController],
  providers: [SucursalService, SucursalRepository],
})
export class SucursalModule {}
