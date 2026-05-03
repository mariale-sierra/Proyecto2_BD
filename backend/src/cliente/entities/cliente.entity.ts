export class Cliente {
    id_cliente: number;
    nombre: string;
    telefono: string;
    correo?: string;
    nit: string;
    total_compras?: number;
    constructor(
        id_cliente: number,
        nombre: string,
        telefono: string,
        correo: string | undefined,
        nit: string,
        total_compras?: number,
    ) {
        this.id_cliente = id_cliente;
        this.nombre = nombre;
        this.telefono = telefono;
        this.correo = correo;
        this.nit = nit;
        this.total_compras = total_compras;
    }
}