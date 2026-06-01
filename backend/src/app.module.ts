import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProductoModule } from './producto/producto.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { ClienteModule } from './cliente/cliente.module';
import { VentaModule } from './venta/venta.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { CategoriaModule } from './categoria/categoria.module';
import { DatabaseModule } from './database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ProductoModule,
    EmpleadoModule,
    SucursalModule,
    ClienteModule,
    VentaModule,
    ProveedorModule,
    CategoriaModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}