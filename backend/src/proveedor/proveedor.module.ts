import { Module } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { ProveedorRepository } from './proveedor.repository';

@Module({
  controllers: [ProveedorController],
  providers: [ProveedorService, ProveedorRepository],
})
export class ProveedorModule {}
