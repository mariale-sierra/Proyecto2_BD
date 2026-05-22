import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';
import { VentaRepository } from './venta.repository';
import { Empleado } from '../empleado/entities/empleado.entity';

@Injectable()
export class VentaService {
    constructor(
        private readonly ventasRepo: VentaRepository,
        private readonly dataSource: DataSource,
    ) {}

    async crearVenta(dto: CreateVentaDto) {
        try {
            return await this.dataSource.transaction(async (manager) => {
                const empleado = await manager.getRepository(Empleado).findOne({
                    where: { id_empleado: dto.id_empleado },
                    relations: { sucursal: true },
                });

                if (!empleado) {
                    throw new Error('Empleado no encontrado');
                }

                if (Number(empleado.id_sucursal) !== Number(dto.id_sucursal)) {
                    throw new Error('Empleado no pertenece a esta sucursal');
                }

                const total = dto.items.reduce(
                    (sum, item) => sum + item.cantidad * item.precio_unitario,
                    0,
                );

                const id_venta = await this.ventasRepo.insertarVenta(
                    manager,
                    dto.id_cliente,
                    dto.id_empleado,
                    dto.id_sucursal,
                    total,
                );

                for (const item of dto.items) {
                    await this.ventasRepo.insertarDetalle(
                        manager,
                        id_venta,
                        item.id_producto,
                        item.cantidad,
                        item.precio_unitario,
                    );
                    await this.ventasRepo.descontarStock(
                        manager,
                        item.id_producto,
                        dto.id_sucursal,
                        item.cantidad,
                    );
                }

                return { ok: true, id_venta, id_sucursal: dto.id_sucursal, mensaje: 'Venta registrada exitosamente' };
            });
        } catch (err) {
            const mensaje = err instanceof Error ? err.message : String(err);
            return { ok: false, mensaje: 'Error al registrar la venta: ' + mensaje };
        }
    }
}