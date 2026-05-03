export class Sucursal {
    id_sucursal: number;
    nombre: string;
    telefono: string;
    direccion: string;
    hora_abre: string;
    hora_cierra: string;

    constructor(
        id_sucursal: number,
        nombre: string,
        telefono: string,
        direccion: string,
        hora_abre: string,
        hora_cierra: string
    ) {
        this.id_sucursal = id_sucursal;
        this.nombre = nombre;
        this.telefono = telefono;
        this.direccion = direccion;
        this.hora_abre = hora_abre;
        this.hora_cierra = hora_cierra;
    }
}