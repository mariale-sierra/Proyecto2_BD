import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { ProductoRepository } from './product.repository';

@Module({
  controllers: [ProductoController],
  providers: [ProductoService, ProductoRepository],
})
export class ProductoModule {}
