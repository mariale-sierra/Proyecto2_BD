export type AppRole = 'dueno' | 'gerente_sucursal' | 'vendedor' | 'contador' | 'bodeguero'

export interface AuthenticatedUser {
  id_empleado: number
  nombre: string
  apellido: string
  salario: number
  id_sucursal: number
  nombre_sucursal?: string | null
  role: AppRole
  es_gerente: boolean
}