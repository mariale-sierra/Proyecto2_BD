export class CreateEmpleadoDto {
	nombre: string;
	apellido: string;
	es_gerente: boolean;
	salario: number;
	id_sucursal: number;

	constructor(
		nombre: string,
		apellido: string,
		es_gerente: boolean,
		salario: number,
		id_sucursal: number,
	) {
		this.nombre = nombre;
		this.apellido = apellido;
		this.es_gerente = es_gerente;
		this.salario = salario;
		this.id_sucursal = id_sucursal;
	}
}
