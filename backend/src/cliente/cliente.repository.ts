import {Injectable, Inject} from '@nestjs/common';
import {Pool} from 'pg';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClienteRepository {
    constructor(@Inject(`DB_POOL`) private db: Pool) {}
    async findAll() {
        const res = await this.db.query(
            `SELECT c.id_cliente, c.nombre, c.telefono, c.correo, c.nit, 
            COUNT(v.id_venta) AS total_compras
            FROM cliente c
            LEFT JOIN venta v ON c.id_cliente = v.id_cliente
            GROUP BY c.id_cliente
            ORDER BY total_compras DESC`
        );
        return res.rows.map(r => new Cliente(
            r.id_cliente,
            r.nombre,
            r.telefono,
            r.correo,
            r.nit,
            Number(r.total_compras ?? 0)
        ));
    }

    async findByNit(nit:string) {
        const res = await this.db.query(
            `SELECT * FROM cliente WHERE nit = $1`, [nit]
        );
        const row = res.rows[0];
        if (!row) return null;
        return new Cliente(row.id_cliente, row.nombre, row.telefono, row.correo, row.nit);
    }

    async create(nombre: string, telefono: string, correo: string | undefined, nit: string) {
        const res = await this.db.query(
            `INSERT INTO cliente (nombre, telefono, correo, nit)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nombre, telefono, correo ?? null, nit]
        );
        const row = res.rows[0];
        return new Cliente(row.id_cliente, row.nombre, row.telefono, row.correo, row.nit);
    }

    async update(id: number, nombre: string, telefono: string, correo: string | undefined, nit: string) {
        const res = await this.db.query(
            `UPDATE cliente SET nombre=$1, telefono=$2, correo=$3, nit=$4
             WHERE id_cliente=$5
             RETURNING *`,
            [nombre, telefono, correo ?? null, nit, id]
        );
        const row = res.rows[0];
        return row ? new Cliente(row.id_cliente, row.nombre, row.telefono, row.correo, row.nit) : null;
    }

    async delete(id: number) {
        await this.db.query(
            `DELETE FROM Cliente WHERE id_cliente = $1`, [id]
        )

    }

    async findFrecuentes() {
        const res = await this.db.query(
            `SELECT id_cliente, nombre, telefono,
                    (SELECT COUNT(*) FROM Venta v WHERE v.id_cliente = c.id_cliente) AS total_compras
             FROM cliente c
             WHERE id_cliente IN (
                 SELECT id_cliente FROM venta
                 GROUP BY id_cliente
                 HAVING COUNT(*) >= 3
             )
             ORDER BY total_compras DESC`
        );
        return res.rows.map(r => new Cliente(
            r.id_cliente,
            r.nombre,
            r.telefono,
            r.correo,
            r.nit,
            Number(r.total_compras ?? 0)
        ));
    }
}