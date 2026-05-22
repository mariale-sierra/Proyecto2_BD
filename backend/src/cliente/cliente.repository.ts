
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClienteRepository {
    constructor(
        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
    ) {}

    async findAll() {
        const rows = await this.clienteRepository
            .createQueryBuilder('cliente')
            .leftJoin('cliente.ventas', 'venta')
            .select('cliente.id_cliente', 'id_cliente')
            .addSelect('cliente.nombre', 'nombre')
            .addSelect('cliente.telefono', 'telefono')
            .addSelect('cliente.correo', 'correo')
            .addSelect('cliente.nit', 'nit')
            .addSelect('COUNT(venta.id_venta)', 'total_compras')
            .groupBy('cliente.id_cliente')
            .orderBy('total_compras', 'DESC')
            .getRawMany();

        return rows.map((row) => ({
            ...row,
            total_compras: Number(row.total_compras ?? 0),
        }));
    }

    async findByNit(nit: string) {
        return this.clienteRepository.findOneBy({ nit });
    }

    async findById(id: number) {
        return this.clienteRepository.findOneBy({ id_cliente: id });
    }

    async create(nombre: string, telefono: string, correo: string | undefined, nit: string) {
        const cliente = this.clienteRepository.create({
            nombre,
            telefono,
            correo,
            nit,
        });

        return this.clienteRepository.save(cliente);
    }

    async update(id: number, nombre: string, telefono: string, correo: string | undefined, nit: string) {
        const cliente = await this.clienteRepository.preload({
            id_cliente: id,
            nombre,
            telefono,
            correo,
            nit,
        });

        if (!cliente) {
            return null;
        }

        return this.clienteRepository.save(cliente);
    }

    async delete(id: number) {
        await this.clienteRepository.delete(id);
    }

    async findFrecuentes() {
        const rows = await this.clienteRepository
            .createQueryBuilder('cliente')
            .leftJoin('cliente.ventas', 'venta')
            .select('cliente.id_cliente', 'id_cliente')
            .addSelect('cliente.nombre', 'nombre')
            .addSelect('cliente.telefono', 'telefono')
            .addSelect('cliente.correo', 'correo')
            .addSelect('cliente.nit', 'nit')
            .addSelect('COUNT(venta.id_venta)', 'total_compras')
            .groupBy('cliente.id_cliente')
            .having('COUNT(venta.id_venta) >= :minCompras', { minCompras: 3 })
            .orderBy('total_compras', 'DESC')
            .getRawMany();

        return rows.map((row) => ({
            ...row,
            total_compras: Number(row.total_compras ?? 0),
        }));
    }

    async buscar(q: string) {
        const rows = await this.clienteRepository
            .createQueryBuilder('cliente')
            .leftJoin('cliente.ventas', 'venta')
            .select('cliente.id_cliente', 'id_cliente')
            .addSelect('cliente.nombre', 'nombre')
            .addSelect('cliente.telefono', 'telefono')
            .addSelect('cliente.nit', 'nit')
            .addSelect('COUNT(venta.id_venta)', 'total_compras')
            .where('LOWER(cliente.nombre) LIKE LOWER(:search)', {
                search: `%${q}%`,
            })
            .orWhere('cliente.nit = :nit', { nit: q })
            .groupBy('cliente.id_cliente')
            .orderBy('total_compras', 'DESC')
            .getRawMany();

        return rows.map((row) => ({
            ...row,
            total_compras: Number(row.total_compras ?? 0),
        }));
    }
}