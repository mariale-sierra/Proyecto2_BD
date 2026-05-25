import { Outlet, NavLink } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { useApp } from '@/src/App'
import styles from './Layout.module.scss'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const baseTabs = [
  { name: 'Nueva venta', path: '/nueva-venta' },
  { name: 'Clientes', path: '/clientes' },
  { name: 'Inventario', path: '/inventario' },
  { name: 'Reportes', path: '/reportes' },
]

const managerTabs = [
  ...baseTabs,
  { name: 'Proveedores', path: '/proveedores' },
]

export default function Layout() {
  const { employee, branch, branches, setBranch, showCarnetOverlay } = useApp()

  const tabs = employee?.es_gerente ? managerTabs : baseTabs
  const employeeInitials = employee
    ? `${employee.nombre[0] ?? ''}${employee.apellido[0] ?? ''}`.toUpperCase()
    : ''

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.brand}>Tienda Central</h1>

          {employee?.es_gerente ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={styles.branchTrigger}>
                <span>{branch?.nombre ?? 'Cargando sucursales...'}</span>
                <ChevronDown className={styles.branchChevron} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {branches.map((b) => (
                  <DropdownMenuItem
                    key={b.id_sucursal}
                    onClick={() => setBranch(b)}
                    className={cn(
                      'cursor-pointer',
                      branch?.id_sucursal === b.id_sucursal && 'bg-accent'
                    )}
                  >
                    {b.nombre}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className={styles.branchTrigger}>
              <span>{branch?.nombre ?? 'Cargando sucursales...'}</span>
            </div>
          )}

          {employee && (
            <div className={styles.employeeArea}>
              <div className={styles.employeeChip}>
                <span className={styles.employeeAvatar}>
                  {employeeInitials}
                </span>
                <span className={styles.employeeName}>
                  {employee.nombre} {employee.apellido}
                </span>
              </div>
              {employee.es_gerente ? (
                <button
                  onClick={showCarnetOverlay}
                  className={styles.changeButton}
                >
                  Cambiar
                </button>
              ) : null}
            </div>
          )}
        </div>

        <nav className={styles.tabs}>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  styles.tab,
                  isActive ? styles.tabActive : styles.tabInactive
                )
              }
            >
              {({ isActive }) => (
                <>
                  {tab.name}
                  {isActive && (
                    <span className={styles.tabUnderline} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
