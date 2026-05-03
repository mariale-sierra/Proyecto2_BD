import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { Empleado } from './entities/empleado.entity';

@Injectable()
export class EmpleadoRepository {
    constructor(@Inject('DATABASE_POOL') private db: Pool) {}

    async findAll() {
        const res = await this.db.query(
            `SELECT e-id_empleado, e.nombre, e.apellido, e.es_gerente,
            e.salario, e.id_sucursal, s.nombre AS nombre_sucursal
            FROM empleado e
            JOIN sucursal s ON e.id_sucursal = s.id_sucursal
            ORDER BY s.nombre, e.apellido`
        )
        return res.rows;
    }

    async findById(id: number) {
        const res = await this.db.query(
            `SELECT * FROM empleado WHERE id_empleado = $1`,
            [id]
        );
        return res.rows[0] || null;
    }

    async findByCarnet(id_empleado: number) {
        const res = await this.db.query(
            `SELECT e.id_empleado, e.nombre, e.apellido, e.es_gerente, e.salario, s.nombre AS nombre_sucursal
            FROM empleado e
            JOIN sucursal s ON e.id_sucursal = s.id_sucursal
            WHERE e.id_empleado = $1`,
            [id_empleado]
        )
        return res.rows[0] || null;
    }

    async findBySucursal(id_sucursal: number) {
        const res = await this.db.query(
            `SELECT id_empleado, nombre, apellido, es_gerente, salario FROM empleado
            WHERE id_sucursal = $1
            ORDER BY apellido`,
            [id_sucursal]
        );
        return res.rows; 
    }

    async create(nombre: string, apellido: string, es_gerente: boolean, salario: number, id_sucursal: number) {
        const res = await this.db.query(
            `INSERT INTO empleado (nombre, apellido, es_gerente, salario, id_sucursal)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [nombre, apellido, es_gerente, salario, id_sucursal]
        );
        const r = res.rows[0];
        return new Empleado(r.id_empleado, r.nombre, r.apellido, r.es_gerente, r.salario, r.id_sucursal);
    }

    async update(id: number, nombre: string, apellido: string, es_gerente: boolean, salario: number, id_sucursal: number) {
        const res = await this.db.query(
            `UPDATE empleado SET nombre=$1, apellido=$2, es_gerente=$3, salario=$4, id_sucursal=$5
             WHERE id_empleado=$6 RETURNING *`,
            [nombre, apellido, es_gerente, salario, id_sucursal, id]
        );
        const r = res.rows[0];
        return r ? new Empleado(r.id_empleado, r.nombre, r.apellido, r.es_gerente, r.salario, r.id_sucursal) : null;
    }

    async delete(id: number) {
        await this.db.query(`DELETE FROM empleado WHERE id_empleado = $1`, [id]);
    }

    async countGerentes(id_sucursal: number, excluir_id?: number): Promise<number> {
        const res = await this.db.query(
            `SELECT COUNT(*) FROM empleado
             WHERE id_sucursal = $1 AND es_gerente = true
             AND ($2::int IS NULL OR id_empleado != $2)`,
            [id_sucursal, excluir_id ?? null]
        );
        return Number(res.rows[0].count);
    }
}