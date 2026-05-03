import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { Sucursal } from './entities/sucursal.entity';

@Injectable()
export class SucursalRepository {
    constructor(@Inject('DB_POOL') private db: Pool) {}

    async findAll() {
        const res = await this.db.query(
            `SELECT s.id_sucursal, s.nombre, s.telefono, s.direccion,
                    s.hora_abre, s.hora_cierra,
                    e.id_empleado AS id_gerente,
                    e.nombre || ' ' || e.apellido AS gerente
             FROM sucursal s
             LEFT JOIN empleado e 
                ON e.id_sucursal = s.id_sucursal 
                AND e.es_gerente = true
             ORDER BY s.nombre`
        );
        return res.rows;
    }

    async findById(id: number) {
        const res = await this.db.query(
            `SELECT * FROM sucursal WHERE id_sucursal = $1`,
            [id]
        );
        return res.rows[0] || null;
    }

    async create(nombre: string, telefono: string, direccion: string, hora_abre: string, hora_cierra: string) {
        const res = await this.db.query(
            `INSERT INTO sucursal (nombre, telefono, direccion, hora_abre, hora_cierra)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [nombre, telefono, direccion, hora_abre, hora_cierra]
        );
        const r = res.rows[0];
        return new Sucursal(r.id_sucursal, r.nombre, r.telefono, r.direccion, r.hora_abre, r.hora_cierra);
    }

    async update(id: number, nombre: string, telefono: string, direccion: string, hora_abre: string, hora_cierra: string) {
        const res = await this.db.query(
            `UPDATE sucursal SET nombre=$1, telefono=$2, direccion=$3, hora_abre=$4, hora_cierra=$5
             WHERE id_sucursal=$6 RETURNING *`,
            [nombre, telefono, direccion, hora_abre, hora_cierra, id]
        );
        const r = res.rows[0];
        return r ? new Sucursal(r.id_sucursal, r.nombre, r.telefono, r.direccion, r.hora_abre, r.hora_cierra) : null;
    }

    async delete(id: number) {
        await this.db.query(`DELETE FROM sucursal WHERE id_sucursal = $1`, [id]);
    }
}