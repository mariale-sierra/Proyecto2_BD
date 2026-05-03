export class CreateClienteDto {
    nombre: string;
    telefono: string;
    correo?: string;
    nit: string;

    constructor(nombre: string, telefono: string, nit: string, correo?: string) {
        this.nombre = nombre;
        this.telefono = telefono;
        this.nit = nit; 
    } 
}
