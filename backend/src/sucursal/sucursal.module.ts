import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { SucursalRepository } from './sucursal.repository';
import { Sucursal } from './entities/sucursal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal])],
  controllers: [SucursalController],
  providers: [SucursalService, SucursalRepository],
})
export class SucursalModule {}
