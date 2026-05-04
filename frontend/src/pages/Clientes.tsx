import { useEffect, useState } from 'react'
import { Search, Plus, Pencil } from 'lucide-react'
import { clientesApi } from '@/services/api/clientes.api'
import { useApp } from '@/src/App'
import { SidePanel } from '@/src/components/SidePanel'
import { Modal } from '@/src/components/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Customer {
  id_cliente: number
  nombre: string
  telefono: string
  correo?: string | null
  nit: string
  total_compras?: number
}

interface FormErrors {
  name?: string
  phone?: string
  nit?: string
}

export default function Clientes() {
  const { showToast } = useApp()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    nit: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const data = await clientesApi.findAll() as Customer[]
      setCustomers(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los clientes.'
      showToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCustomers()
  }, [])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.telefono.includes(searchQuery) ||
      customer.nit.includes(searchQuery)
  )

  const openNewPanel = () => {
    setEditingCustomer(null)
    setFormData({ name: '', phone: '', email: '', nit: '' })
    setFormErrors({})
    setPanelOpen(true)
  }

  const openEditPanel = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.nombre,
      phone: customer.telefono,
      email: customer.correo ?? '',
      nit: customer.nit,
    })
    setFormErrors({})
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setEditingCustomer(null)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Este campo es obligatorio'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Este campo es obligatorio'
    } else if (!/^\d{8}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Ingresa un telefono valido (8 digitos)'
    }

    if (!formData.nit.trim()) {
      errors.nit = 'Este campo es obligatorio'
    } else {
      const duplicate = customers.some(
        (c) => c.nit === formData.nit && c.id_cliente !== editingCustomer?.id_cliente
      )
      if (duplicate) {
        errors.nit = 'Este NIT ya esta registrado'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const payload = {
        nombre: formData.name.trim(),
        telefono: formData.phone.trim(),
        correo: formData.email.trim() || undefined,
        nit: formData.nit.trim(),
      }

      if (editingCustomer) {
        await clientesApi.update(editingCustomer.id_cliente, payload)
        showToast({ message: 'Cliente actualizado correctamente', type: 'success' })
      } else {
        await clientesApi.create(payload)
        showToast({ message: 'Cliente registrado correctamente', type: 'success' })
      }

      closePanel()
      await loadCustomers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el cliente.'
      showToast({ message, type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!editingCustomer) return

    try {
      await clientesApi.delete(editingCustomer.id_cliente)
      setDeleteModalOpen(false)
      closePanel()
      showToast({ message: 'Cliente eliminado', type: 'success' })
      await loadCustomers()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el cliente.'
      showToast({ message, type: 'error' })
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openNewPanel}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead>NIT</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Compras</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Cargando clientes...
                  </TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => {
                  const purchases = customer.total_compras ?? 0
                  return (
                    <TableRow key={customer.id_cliente} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {customer.nombre}
                          {purchases >= 8 && (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                              Cliente frecuente
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.telefono}</TableCell>
                      <TableCell className="font-mono text-sm">{customer.nit}</TableCell>
                      <TableCell>{customer.correo || 'Sin correo'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{purchases}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditPanel(customer)}
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          Ver/Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <SidePanel
        isOpen={panelOpen}
        onClose={closePanel}
        title={editingCustomer ? 'Editar cliente' : 'Nuevo cliente'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (formErrors.name) setFormErrors({ ...formErrors, name: undefined })
              }}
              placeholder="Nombre del cliente"
              className={formErrors.name ? 'border-destructive' : ''}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefono *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value })
                if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined })
              }}
              placeholder="00000000"
              className={formErrors.phone ? 'border-destructive' : ''}
            />
            {formErrors.phone && (
              <p className="text-sm text-destructive">{formErrors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nit">NIT *</Label>
            <Input
              id="nit"
              value={formData.nit}
              onChange={(e) => {
                setFormData({ ...formData, nit: e.target.value })
                if (formErrors.nit) setFormErrors({ ...formErrors, nit: undefined })
              }}
              placeholder="00000000-0"
              className={formErrors.nit ? 'border-destructive' : ''}
            />
            {formErrors.nit && (
              <p className="text-sm text-destructive">{formErrors.nit}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={closePanel}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Guardar cliente
              </Button>
            </div>

            {editingCustomer && (
              <Button
                variant="outline"
                className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setDeleteModalOpen(true)}
              >
                Eliminar cliente
              </Button>
            )}
          </div>
        </div>
      </SidePanel>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={`¿Eliminar a ${editingCustomer?.nombre}?`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Esta accion no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
