import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { ProductoRepository } from './product.repository';
import { Producto } from './entities/producto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria])],
  controllers: [ProductoController],
  providers: [ProductoService, ProductoRepository],
})
export class ProductoModule {}
