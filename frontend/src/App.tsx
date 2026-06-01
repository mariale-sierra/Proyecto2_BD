import { useEffect, useState, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import NuevaVenta from './pages/NuevaVenta'
import Clientes from './pages/Clientes'
import Inventario from './pages/Inventario'
import Reportes from './pages/Reportes'
import Proveedores from './pages/Proveedores'
import { CarnetOverlay } from './components/CarnetOverlay'
import { RoleRoute, HomeRedirect } from './components/RoleRoute'
import { Toast, type ToastState } from './components/Toast'
import { sucursalesApi } from '@/services/api/sucursales.api'
import { authApi } from '@/services/api/auth.api'
import type { AuthUser } from '@/src/auth/roles'
import { getDefaultRoute } from '@/src/auth/roles'

export interface BranchOption {
  id_sucursal: number
  nombre: string
}

interface AppContextType {
  employee: AuthUser | null
  branch: BranchOption | null
  branches: BranchOption[]
  setBranch: (branch: BranchOption) => void
  logout: () => Promise<void>
  authReady: boolean
  showToast: (toast: ToastState) => void
}

export const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export default function App() {
  const [employee, setEmployee] = useState<AuthUser | null>(null)
  const [branch, setBranch] = useState<BranchOption | null>(null)
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [carnetOverlayOpen, setCarnetOverlayOpen] = useState(true)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await sucursalesApi.findAll() as BranchOption[]
        setBranches(data)
      } catch {
        setToast({ message: 'No se pudieron cargar las sucursales', type: 'error' })
      }
    }

    void loadBranches()
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await authApi.me()
        setEmployee(session)
        setCarnetOverlayOpen(false)
      } catch {
        setEmployee(null)
        setCarnetOverlayOpen(true)
      } finally {
        setAuthReady(true)
      }
    }

    void restoreSession()
  }, [])

  useEffect(() => {
    if (branches.length === 0) return

    if (employee) {
      const employeeBranch = branches.find((b) => b.id_sucursal === employee.id_sucursal)
      setBranch(employeeBranch ?? branches[0])
      return
    }

    if (!branch) {
      setBranch(branches[0])
    }
  }, [branches, employee?.id_sucursal, employee?.role])

  const showToast = (newToast: ToastState) => setToast(newToast)

  const handleAuthenticate = (authenticatedEmployee: AuthUser) => {
    setEmployee(authenticatedEmployee)
    const employeeBranch = branches.find(
      (b) => b.id_sucursal === authenticatedEmployee.id_sucursal
    )
    if (employeeBranch) {
      setBranch(employeeBranch)
    }
    setCarnetOverlayOpen(false)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      setEmployee(null)
      setCarnetOverlayOpen(true)
      if (branches.length > 0) {
        setBranch(branches[0])
      }
    }
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Restaurando sesión...</p>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{ employee, branch, branches, setBranch, logout, authReady, showToast }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeRedirect />} />
          <Route
            path="nueva-venta"
            element={(
              <RoleRoute allowedRoles={['dueno', 'gerente_sucursal', 'vendedor']}>
                <NuevaVenta />
              </RoleRoute>
            )}
          />
          <Route
            path="clientes"
            element={(
              <RoleRoute allowedRoles={['dueno', 'gerente_sucursal', 'vendedor']}>
                <Clientes />
              </RoleRoute>
            )}
          />
          <Route
            path="inventario"
            element={(
              <RoleRoute allowedRoles={['dueno', 'gerente_sucursal', 'vendedor', 'bodeguero']}>
                <Inventario />
              </RoleRoute>
            )}
          />
          <Route
            path="reportes"
            element={(
              <RoleRoute allowedRoles={['dueno', 'gerente_sucursal', 'contador']}>
                <Reportes />
              </RoleRoute>
            )}
          />
          <Route
            path="proveedores"
            element={(
              <RoleRoute allowedRoles={['dueno', 'gerente_sucursal', 'bodeguero']}>
                <Proveedores />
              </RoleRoute>
            )}
          />
          <Route path="*" element={<Navigate to={getDefaultRoute(employee?.role)} replace />} />
        </Route>
      </Routes>
      
      <CarnetOverlay
        isOpen={carnetOverlayOpen && !employee}
        onAuthenticate={handleAuthenticate}
      />
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppContext.Provider>
  )
}
