import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductoModule } from './producto/producto.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { VentaModule } from './venta/venta.module';
import { ClienteModule } from './cliente/cliente.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { EmpleadoModule } from './empleado/empleado.module';
import { DatabaseModule } from './database.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, ProductoModule, EmpleadoModule, SucursalModule, ClienteModule, VentaModule, ProveedorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
