export type AppRole =
  | 'dueno'
  | 'gerente_sucursal'
  | 'vendedor'
  | 'contador'
  | 'bodeguero'

export interface AuthUser {
  id_empleado: number
  nombre: string
  apellido: string
  role: AppRole
  es_gerente: boolean
  salario: number
  id_sucursal: number
  nombre_sucursal?: string | null
}

export type RoleTab = {
  name: string
  path: string
}

const allTabs: RoleTab[] = [
  { name: 'Nueva venta', path: '/nueva-venta' },
  { name: 'Clientes', path: '/clientes' },
  { name: 'Inventario', path: '/inventario' },
  { name: 'Reportes', path: '/reportes' },
  { name: 'Proveedores', path: '/proveedores' },
]

const tabsByRole: Record<AppRole, RoleTab[]> = {
  dueno: allTabs,
  gerente_sucursal: allTabs,
  vendedor: allTabs.filter((tab) => tab.path !== '/reportes' && tab.path !== '/proveedores'),
  contador: allTabs.filter((tab) => tab.path === '/reportes'),
  bodeguero: allTabs.filter((tab) => tab.path === '/inventario' || tab.path === '/proveedores'),
}

const allowedPathsByRole: Record<AppRole, string[]> = {
  dueno: allTabs.map((tab) => tab.path),
  gerente_sucursal: allTabs.map((tab) => tab.path),
  vendedor: ['/nueva-venta', '/clientes', '/inventario'],
  contador: ['/reportes'],
  bodeguero: ['/inventario', '/proveedores'],
}

export function getRoleLabel(role?: AppRole | null) {
  switch (role) {
    case 'dueno':
      return 'Dueño'
    case 'gerente_sucursal':
      return 'Gerente de sucursal'
    case 'vendedor':
      return 'Vendedor'
    case 'contador':
      return 'Contador'
    case 'bodeguero':
      return 'Bodeguero'
    default:
      return 'Sin rol'
  }
}

export function getTabsForRole(role?: AppRole | null) {
  if (!role) return []
  return tabsByRole[role]
}

export function canAccessPath(role: AppRole, path: string) {
  return allowedPathsByRole[role].includes(path)
}

export function getDefaultRoute(role?: AppRole | null) {
  if (!role) return '/'
  return allowedPathsByRole[role][0] ?? '/'
}

export function canSwitchBranch(role?: AppRole | null) {
  return role === 'dueno' || role === 'gerente_sucursal'
}