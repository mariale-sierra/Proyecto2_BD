import { useState } from 'react'
import { Search, Plus, Minus, Trash2, AlertCircle } from 'lucide-react'
import { products, customers, formatCurrency, type Product, type CartItem, type Customer } from '@/src/data/mock-data'
import { useApp } from '@/src/App'
import { Modal } from '@/src/components/Modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

function getStockBadge(stock: number) {
  if (stock === 0) return { label: 'Sin stock', className: 'bg-destructive/10 text-destructive' }
  if (stock <= 10) return { label: `${stock} en stock`, className: 'bg-warning/20 text-warning-foreground' }
  return { label: `${stock} en stock`, className: 'bg-success/10 text-success' }
}

export default function NuevaVenta() {
  const { employee, branch, showToast } = useApp()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [inlineError, setInlineError] = useState<string | null>(null)
  
  // Modal states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase())
  )

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  const addToCart = (product: Product) => {
    if (product.stock === 0) return
    
    const existingItem = cart.find((item) => item.product.id === product.id)
    const currentQty = existingItem?.quantity || 0
    
    if (currentQty >= product.stock) {
      setInlineError(`Solo quedan ${product.stock} unidades de ${product.name} en esta sucursal.`)
      return
    }
    
    setInlineError(null)
    
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([...cart, { product, quantity: 1 }])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find(i => i.product.id === productId)
    if (!item) return
    
    const newQty = item.quantity + delta
    
    if (delta > 0 && newQty > item.product.stock) {
      setInlineError(`Solo quedan ${item.product.stock} unidades de ${item.product.name} en esta sucursal.`)
      return
    }
    
    setInlineError(null)
    
    setCart(
      cart
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
    setInlineError(null)
  }

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const handleConfirmClick = () => {
    if (cart.length === 0) {
      setInlineError('El carrito está vacío.')
      return
    }
    setInlineError(null)
    setConfirmModalOpen(true)
  }

  const handleConfirmSale = () => {
    setConfirmModalOpen(false)
    setCart([])
    setSelectedCustomerId('')
    showToast({ message: 'Venta #1043 registrada', type: 'success' })
  }

  const handleCancelSale = () => {
    setCancelModalOpen(false)
    setCart([])
    setSelectedCustomerId('')
    setInlineError(null)
  }

  const handleCustomerSelect = (value: string) => {
    if (value === 'search') {
      setShowCustomerSearch(true)
      setSelectedCustomerId('')
    } else {
      setSelectedCustomerId(value)
      setShowCustomerSearch(false)
      setCustomerSearchQuery('')
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Product search & selection */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <ScrollArea className="h-[400px]">
              <div className="divide-y">
                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No se encontró ningún producto con ese nombre.
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const stockBadge = getStockBadge(product.stock)
                    const isOutOfStock = product.stock === 0
                    
                    return (
                      <div
                        key={product.id}
                        className={cn(
                          'flex items-center justify-between p-4 transition-colors',
                          isOutOfStock ? 'bg-muted/30 opacity-60' : 'hover:bg-muted/50'
                        )}
                      >
                        <div className="flex-1">
                          <p className={cn('font-medium', isOutOfStock && 'text-muted-foreground')}>
                            {product.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cn('text-xs', stockBadge.className)}>
                            {stockBadge.label}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => addToCart(product)}
                            disabled={isOutOfStock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Customer selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>
            <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.filter(c => c.purchases >= 3).map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.purchases} compras)
                  </SelectItem>
                ))}
                <SelectItem value="search">— Buscar otro cliente —</SelectItem>
              </SelectContent>
            </Select>
            
            {showCustomerSearch && (
              <div className="mt-2 space-y-2">
                <Input
                  placeholder="Buscar cliente por nombre..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  autoFocus
                />
                {customerSearchQuery && (
                  <div className="rounded-lg border bg-card">
                    {filteredCustomers.length === 0 ? (
                      <p className="p-3 text-sm text-muted-foreground">
                        No se encontraron clientes.
                      </p>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomerId(customer.id)
                            setShowCustomerSearch(false)
                            setCustomerSearchQuery('')
                          }}
                          className="flex w-full items-center justify-between p-3 text-left text-sm hover:bg-muted/50"
                        >
                          <span>{customer.name}</span>
                          <span className="text-muted-foreground">
                            {customer.purchases} compras
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Cart & checkout */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Carrito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Agrega productos para comenzar
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.product.price)} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="w-20 text-right font-medium">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
                {employee && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Empleado: {employee.name}
                  </p>
                )}
              </div>

              {/* Inline error */}
              {inlineError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{inlineError}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => cart.length > 0 && setCancelModalOpen(true)}
                  disabled={cart.length === 0}
                >
                  Cancelar venta
                </Button>
                <Button className="flex-1" onClick={handleConfirmClick}>
                  Confirmar venta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Sale Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmar venta"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Empleado:</span>
              <span className="font-medium">{employee?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{selectedCustomer?.name || 'Sin seleccionar'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sucursal:</span>
              <span className="font-medium">{branch.name}</span>
            </div>
            <div className="border-t pt-3">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Productos:</p>
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleConfirmSale}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Sale Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="¿Cancelar esta venta?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Se perderán todos los productos agregados al carrito.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelModalOpen(false)}
            >
              No, volver
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleCancelSale}
            >
              Sí, cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
