import { Outlet, NavLink } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { branches, isManager } from '@/src/data/mock-data'
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
  const { employee, branch, setBranch, showCarnetOverlay } = useApp()

  const tabs = employee && isManager(employee) ? managerTabs : baseTabs

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <h1 className={styles.brand}>Tienda Central</h1>

          <DropdownMenu>
            <DropdownMenuTrigger className={styles.branchTrigger}>
              <span>{branch.name}</span>
              <ChevronDown className={styles.branchChevron} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {branches.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => setBranch(b)}
                  className={cn(
                    'cursor-pointer',
                    branch.id === b.id && 'bg-accent'
                  )}
                >
                  {b.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {employee && (
            <div className={styles.employeeArea}>
              <div className={styles.employeeChip}>
                <span className={styles.employeeAvatar}>
                  {employee.initials}
                </span>
                <span className={styles.employeeName}>
                  {employee.name}
                </span>
              </div>
              <button
                onClick={showCarnetOverlay}
                className={styles.changeButton}
              >
                Cambiar
              </button>
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
