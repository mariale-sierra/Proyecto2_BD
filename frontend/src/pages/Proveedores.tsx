import { useState } from 'react'
import { AlertTriangle, Plus, Pencil } from 'lucide-react'
import { products, suppliers, getSupplierById, type Supplier, type Product } from '@/src/data/mock-data'
import { useApp } from '@/src/App'
import { Modal } from '@/src/components/Modal'
import { SidePanel } from '@/src/components/SidePanel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10)
const hasLowStock = lowStockProducts.length > 0

interface FormErrors {
  name?: string
  phone?: string
  email?: string
}

export default function Proveedores() {
  const { employee, showToast } = useApp()
  
  // Order modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null)
  const [orderQuantity, setOrderQuantity] = useState('50')
  const [orderNote, setOrderNote] = useState('')
  
  // Supplier panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const openOrderModal = (product: Product) => {
    setOrderingProduct(product)
    setOrderQuantity('50')
    setOrderNote('')
    setOrderModalOpen(true)
  }

  const handleConfirmOrder = () => {
    const supplier = orderingProduct ? getSupplierById(orderingProduct.supplierId) : null
    setOrderModalOpen(false)
    setOrderingProduct(null)
    showToast({ 
      message: `Pedido enviado a ${supplier?.name}`, 
      type: 'success' 
    })
  }

  const openNewPanel = () => {
    setEditingSupplier(null)
    setFormData({ name: '', phone: '', email: '', address: '' })
    setFormErrors({})
    setPanelOpen(true)
  }

  const openEditPanel = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
    })
    setFormErrors({})
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setEditingSupplier(null)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Este campo es obligatorio'
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Este campo es obligatorio'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Este campo es obligatorio'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return
    
    closePanel()
    showToast({ message: 'Proveedor guardado', type: 'success' })
  }

  const orderingSupplier = orderingProduct ? getSupplierById(orderingProduct.supplierId) : null

  return (
    <>
      <div className="space-y-6">
        {/* Warning banner */}
        {hasLowStock && (
          <Alert className="border-warning/50 bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning-foreground" />
            <AlertDescription className="text-warning-foreground">
              {lowStockProducts.length} productos con stock bajo — considera hacer un pedido
            </AlertDescription>
          </Alert>
        )}

        {/* Low stock products section */}
        {hasLowStock && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos con stock bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Stock actual</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => {
                    const supplier = getSupplierById(product.supplierId)
                    return (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge className={cn(
                            'text-xs',
                            product.stock <= 5
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning/20 text-warning-foreground'
                          )}>
                            {product.stock} unidades
                          </Badge>
                        </TableCell>
                        <TableCell>{supplier?.name || 'Desconocido'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => openOrderModal(product)}
                          >
                            Solicitar pedido
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Suppliers section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Proveedores</CardTitle>
            <Button size="sm" onClick={openNewPanel}>
              <Plus className="mr-2 h-4 w-4" />
              Proveedor
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{supplier.productsCount}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditPanel(supplier)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Order Modal */}
      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title={`Solicitar pedido — ${orderingProduct?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Proveedor:</span>
              <span className="font-medium">{orderingSupplier?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Correo:</span>
              <span className="font-medium">{orderingSupplier?.email}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad a pedir</Label>
            <Input
              id="quantity"
              type="number"
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Nota opcional</Label>
            <Textarea
              id="note"
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Agregar notas adicionales..."
              rows={3}
            />
          </div>
          
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Realizado por:</span>
              <span className="font-medium">{employee?.name} ({employee?.role})</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOrderModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleConfirmOrder}>
              Confirmar pedido
            </Button>
          </div>
        </div>
      </Modal>

      {/* Supplier Side Panel */}
      <SidePanel
        isOpen={panelOpen}
        onClose={closePanel}
        title={editingSupplier ? 'Editar proveedor' : 'Nuevo proveedor'}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (formErrors.name) setFormErrors({ ...formErrors, name: undefined })
              }}
              placeholder="Nombre del proveedor"
              className={formErrors.name ? 'border-destructive' : ''}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value })
                if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined })
              }}
              placeholder="0000-0000"
              className={formErrors.phone ? 'border-destructive' : ''}
            />
            {formErrors.phone && (
              <p className="text-sm text-destructive">{formErrors.phone}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Correo *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (formErrors.email) setFormErrors({ ...formErrors, email: undefined })
              }}
              placeholder="correo@ejemplo.com"
              className={formErrors.email ? 'border-destructive' : ''}
            />
            {formErrors.email && (
              <p className="text-sm text-destructive">{formErrors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Dirección del proveedor"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={closePanel}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </SidePanel>
    </>
  )
}
