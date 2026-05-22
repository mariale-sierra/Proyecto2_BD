import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { ProveedorRepository } from './proveedor.repository';
import { Proveedor } from './entities/proveedor.entity';
import { Suministro } from './entities/suministro.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor, Suministro])],
  controllers: [ProveedorController],
  providers: [ProveedorService, ProveedorRepository],
})
export class ProveedorModule {}
