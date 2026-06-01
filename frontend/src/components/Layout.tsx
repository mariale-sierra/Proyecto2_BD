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
import { canSwitchBranch, getRoleLabel, getTabsForRole } from '@/src/auth/roles'

export default function Layout() {
  const { employee, branch, branches, setBranch, logout } = useApp()

  const tabs = getTabsForRole(employee?.role)
  const visibleBranches = employee?.role === 'dueno'
    ? branches
    : employee
      ? branches.filter((b) => b.id_sucursal === employee.id_sucursal)
      : []
  const employeeInitials = employee
    ? `${employee.nombre[0] ?? ''}${employee.apellido[0] ?? ''}`.toUpperCase()
    : ''

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.brand}>Tienda Central</h1>

          {canSwitchBranch(employee?.role) ? (
            <DropdownMenu>
              <DropdownMenuTrigger className={styles.branchTrigger}>
                <span>{branch?.nombre ?? 'Cargando sucursales...'}</span>
                <ChevronDown className={styles.branchChevron} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {visibleBranches.map((b) => (
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
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {getRoleLabel(employee.role)}
                </span>
                <button
                  onClick={logout}
                  className={styles.changeButton}
                  type="button"
                >
                  Cerrar sesión
                </button>
              </div>
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
