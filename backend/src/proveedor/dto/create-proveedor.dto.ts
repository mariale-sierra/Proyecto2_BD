export class CreateProveedorDto {
	nombre: string;
	telefono?: string;
	correo?: string;
	direccion?: string;

	constructor(nombre: string, telefono?: string, correo?: string, direccion?: string) {
		this.nombre = nombre;
		this.telefono = telefono;
		this.correo = correo;
		this.direccion = direccion;
	}
}
