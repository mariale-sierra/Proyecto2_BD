import { useEffect, useState, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import NuevaVenta from './pages/NuevaVenta'
import Clientes from './pages/Clientes'
import Inventario from './pages/Inventario'
import Reportes from './pages/Reportes'
import Proveedores from './pages/Proveedores'
import { CarnetOverlay } from './components/CarnetOverlay'
import { Toast, type ToastState } from './components/Toast'
import { sucursalesApi } from '@/services/api/sucursales.api'

export interface AuthEmployee {
  id_empleado: number
  nombre: string
  apellido: string
  es_gerente: boolean
  salario: number
  id_sucursal: number
  nombre_sucursal?: string
}

export interface BranchOption {
  id_sucursal: number
  nombre: string
}

interface AppContextType {
  employee: AuthEmployee | null
  branch: BranchOption | null
  branches: BranchOption[]
  setBranch: (branch: BranchOption) => void
  showCarnetOverlay: () => void
  showToast: (toast: ToastState) => void
}

export const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}

export default function App() {
  const [employee, setEmployee] = useState<AuthEmployee | null>(null)
  const [branch, setBranch] = useState<BranchOption | null>(null)
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [carnetOverlayOpen, setCarnetOverlayOpen] = useState(true)
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const data = await sucursalesApi.findAll() as BranchOption[]
        setBranches(data)
        if (!branch && data.length > 0) {
          setBranch(data[0])
        }
      } catch {
        setToast({ message: 'No se pudieron cargar las sucursales', type: 'error' })
      }
    }

    void loadBranches()
  }, [])

  const showCarnetOverlay = () => setCarnetOverlayOpen(true)
  const showToast = (newToast: ToastState) => setToast(newToast)

  const handleAuthenticate = (authenticatedEmployee: AuthEmployee) => {
    setEmployee(authenticatedEmployee)
    const employeeBranch = branches.find(
      (b) => b.id_sucursal === authenticatedEmployee.id_sucursal
    )
    if (employeeBranch) {
      setBranch(employeeBranch)
    }
    setCarnetOverlayOpen(false)
  }

  return (
    <AppContext.Provider value={{ employee, branch, branches, setBranch, showCarnetOverlay, showToast }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/nueva-venta" replace />} />
          <Route path="nueva-venta" element={<NuevaVenta />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="reportes" element={<Reportes />} />
          {employee && employee.es_gerente && (
            <Route path="proveedores" element={<Proveedores />} />
          )}
        </Route>
      </Routes>
      
      <CarnetOverlay
        isOpen={carnetOverlayOpen}
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
