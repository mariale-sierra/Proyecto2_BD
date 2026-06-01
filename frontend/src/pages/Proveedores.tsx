import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { productosApi } from '@/services/api/productos.api'
import { proveedoresApi } from '@/services/api/proveedores.api'
import { useApp } from '@/src/App'
import { getRoleLabel } from '@/src/auth/roles'
import { Modal } from '@/src/components/Modal'
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

interface Supplier {
  id_proveedor: number
  nombre: string
  telefono: string
  correo?: string | null
  direccion?: string | null
  total_productos?: number
}

interface LowStockProduct {
  id_producto: number
  nombre: string
  stock_actual: number
}

interface OrderInfo {
  id_proveedor: number
  proveedor: string
  correo?: string | null
  telefono?: string | null
  id_producto: number
  producto: string
  stock_actual: number
  precio_compra?: number
}

function formatCurrency(amount: number): string {
  return `Q ${amount.toFixed(2)}`
}

export default function Proveedores() {
  const { employee, branch, showToast } = useApp()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)

  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [orderingProduct, setOrderingProduct] = useState<LowStockProduct | null>(null)
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null)
  const [orderQuantity, setOrderQuantity] = useState('50')
  const [orderNote, setOrderNote] = useState('')

  const hasLowStock = lowStockProducts.length > 0

  const loadData = async () => {
    if (!branch?.id_sucursal) return

    try {
      setLoading(true)
      const [supplierData, lowStockData] = await Promise.all([
        proveedoresApi.findAll() as Promise<Supplier[]>,
        productosApi.stockBajo(branch.id_sucursal) as Promise<LowStockProduct[]>,
      ])

      setSuppliers(supplierData)
      setLowStockProducts(lowStockData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar informacion de proveedores.'
      showToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [branch?.id_sucursal])

  const openOrderModal = async (product: LowStockProduct) => {
    if (!branch?.id_sucursal) return

    try {
      setOrderingProduct(product)
      setOrderQuantity('50')
      setOrderNote('')
      const info = await proveedoresApi.infoPedido(product.id_producto, branch.id_sucursal) as OrderInfo
      setOrderInfo(info)
      setOrderModalOpen(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se encontro proveedor para este producto.'
      showToast({ message, type: 'error' })
    }
  }

  const handleConfirmOrder = () => {
    const supplierName = orderInfo?.proveedor ?? 'proveedor'
    setOrderModalOpen(false)
    setOrderingProduct(null)
    setOrderInfo(null)
    showToast({
      message: `Pedido preparado para ${supplierName}.`,
      type: 'success',
    })
  }

  return (
    <>
      <div className="space-y-6">
        {hasLowStock && (
          <Alert className="border-warning/50 bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning-foreground" />
            <AlertDescription className="text-warning-foreground">
              {lowStockProducts.length} productos con stock bajo - considera hacer un pedido
            </AlertDescription>
          </Alert>
        )}

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
                  <TableHead className="text-right">Accion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Cargando productos con stock bajo...
                    </TableCell>
                  </TableRow>
                ) : lowStockProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay productos con stock bajo en esta sucursal.
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStockProducts.map((product) => (
                    <TableRow key={product.id_producto} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{product.nombre}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          'text-xs',
                          product.stock_actual <= 2
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning/20 text-warning-foreground'
                        )}>
                          {product.stock_actual} unidades
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => openOrderModal(product)}>
                          Solicitar pedido
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proveedores</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Productos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Cargando proveedores...
                    </TableCell>
                  </TableRow>
                ) : suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay proveedores registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id_proveedor} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{supplier.nombre}</TableCell>
                      <TableCell>{supplier.telefono}</TableCell>
                      <TableCell>{supplier.correo || 'Sin correo'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{supplier.total_productos ?? 0}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title={`Solicitar pedido - ${orderingProduct?.nombre || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Proveedor:</span>
              <span className="font-medium">{orderInfo?.proveedor || 'Sin datos'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Correo:</span>
              <span className="font-medium">{orderInfo?.correo || 'Sin correo'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Precio compra:</span>
              <span className="font-medium">
                {typeof orderInfo?.precio_compra === 'number'
                  ? formatCurrency(orderInfo.precio_compra)
                  : 'No disponible'}
              </span>
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
              <span className="font-medium">
                {employee?.nombre} {employee?.apellido} ({getRoleLabel(employee?.role)})
              </span>
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
    </>
  )
}
