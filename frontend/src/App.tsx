import { useState, createContext, useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import NuevaVenta from './pages/NuevaVenta'
import Clientes from './pages/Clientes'
import Inventario from './pages/Inventario'
import Reportes from './pages/Reportes'
import Proveedores from './pages/Proveedores'
import { CarnetOverlay } from './components/CarnetOverlay'
import { Toast, type ToastState } from './components/Toast'
import { type Employee, type Branch, branches, isManager } from './data/mock-data'

interface AppContextType {
  employee: Employee | null
  branch: Branch
  setBranch: (branch: Branch) => void
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
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [branch, setBranch] = useState<Branch>(branches[0])
  const [carnetOverlayOpen, setCarnetOverlayOpen] = useState(true)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showCarnetOverlay = () => setCarnetOverlayOpen(true)
  const showToast = (newToast: ToastState) => setToast(newToast)

  const handleAuthenticate = (authenticatedEmployee: Employee) => {
    setEmployee(authenticatedEmployee)
    setCarnetOverlayOpen(false)
  }

  return (
    <AppContext.Provider value={{ employee, branch, setBranch, showCarnetOverlay, showToast }}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/nueva-venta" replace />} />
          <Route path="nueva-venta" element={<NuevaVenta />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="reportes" element={<Reportes />} />
          {employee && isManager(employee) && (
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
