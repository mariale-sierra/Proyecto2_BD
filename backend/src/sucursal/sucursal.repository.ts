import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursal } from './entities/sucursal.entity';

@Injectable()
export class SucursalRepository {
    constructor(
        @InjectRepository(Sucursal)
        private readonly sucursalRepository: Repository<Sucursal>,
    ) {}

    async findAll() {
        return this.sucursalRepository
            .createQueryBuilder('sucursal')
            .leftJoin('sucursal.empleados', 'empleado', 'empleado.es_gerente = true')
            .select('sucursal.id_sucursal', 'id_sucursal')
            .addSelect('sucursal.nombre', 'nombre')
            .addSelect('sucursal.telefono', 'telefono')
            .addSelect('sucursal.direccion', 'direccion')
            .addSelect('sucursal.hora_abre', 'hora_abre')
            .addSelect('sucursal.hora_cierra', 'hora_cierra')
            .addSelect('empleado.id_empleado', 'id_gerente')
            .addSelect("CONCAT(empleado.nombre, ' ', empleado.apellido)", 'gerente')
            .orderBy('sucursal.nombre', 'ASC')
            .getRawMany();
    }

    async findById(id: number) {
        return this.sucursalRepository.findOneBy({ id_sucursal: id });
    }

    async create(nombre: string, telefono: string, direccion: string, hora_abre: string, hora_cierra: string) {
        const sucursal = this.sucursalRepository.create({
            nombre,
            telefono,
            direccion,
            hora_abre,
            hora_cierra,
        });

        return this.sucursalRepository.save(sucursal);
    }

    async update(id: number, nombre: string, telefono: string, direccion: string, hora_abre: string, hora_cierra: string) {
        const sucursal = await this.sucursalRepository.preload({
            id_sucursal: id,
            nombre,
            telefono,
            direccion,
            hora_abre,
            hora_cierra,
        });

        if (!sucursal) {
            return null;
        }

        return this.sucursalRepository.save(sucursal);
    }

    async delete(id: number) {
        await this.sucursalRepository.delete(id);
    }
}