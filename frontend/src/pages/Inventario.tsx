import { useState } from 'react'
import { Search, Plus, Pencil, Package, AlertTriangle, XCircle } from 'lucide-react'
import { products, type Product, formatCurrency } from '@/src/data/mock-data'
import { useApp } from '@/src/App'
import { SidePanel } from '@/src/components/SidePanel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const categories = ['Todas', 'Bebidas', 'Lácteos'] as const

interface FormErrors {
  name?: string
  price?: string
  stock?: string
}

function getStockInfo(stock: number) {
  if (stock === 0) return { color: 'text-destructive', bgColor: 'bg-destructive', progress: 0 }
  if (stock <= 10) return { color: 'text-warning-foreground', bgColor: 'bg-warning', progress: (stock / 50) * 100 }
  return { color: 'text-success', bgColor: 'bg-success', progress: Math.min((stock / 50) * 100, 100) }
}

export default function Inventario() {
  const { showToast } = useApp()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Bebidas' as 'Bebidas' | 'Lácteos',
    price: '',
    stock: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'Todas' || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const stats = {
    active: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  }

  const openNewPanel = () => {
    setEditingProduct(null)
    setFormData({ name: '', category: 'Bebidas', price: '', stock: '' })
    setFormErrors({})
    setPanelOpen(true)
  }

  const openEditPanel = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
    })
    setFormErrors({})
    setPanelOpen(true)
  }

  const closePanel = () => {
    setPanelOpen(false)
    setEditingProduct(null)
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Este campo es obligatorio'
    }
    
    if (!formData.price.trim()) {
      errors.price = 'Este campo es obligatorio'
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
      errors.price = 'Ingresa un precio válido'
    }
    
    if (!formData.stock.trim()) {
      errors.stock = 'Este campo es obligatorio'
    } else if (parseInt(formData.stock) < 0) {
      errors.stock = 'El stock no puede ser negativo'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) return
    
    closePanel()
    showToast({ message: 'Producto guardado', type: 'success' })
  }

  return (
    <>
      <div className="space-y-6">
        {/* Metric strip */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Productos activos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20">
                <AlertTriangle className="h-6 w-6 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock bajo</p>
                <p className="text-2xl font-bold text-warning-foreground">{stats.lowStock}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sin stock</p>
                <p className="text-2xl font-bold text-destructive">{stats.outOfStock}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openNewPanel}>
            <Plus className="mr-2 h-4 w-4" />
            Producto
          </Button>
        </div>

        {/* Product table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio venta</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockInfo = getStockInfo(product.stock)
                return (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={stockInfo.progress}
                          className={cn('h-2 w-20', stockInfo.bgColor)}
                        />
                        <span className={cn('text-sm font-medium', stockInfo.color)}>
                          {product.stock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditPanel(product)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Side Panel */}
      <SidePanel
        isOpen={panelOpen}
        onClose={closePanel}
        title={editingProduct ? 'Editar producto' : 'Nuevo producto'}
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
              placeholder="Nombre del producto"
              className={formErrors.name ? 'border-destructive' : ''}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoría *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value as 'Bebidas' | 'Lácteos' })
              }
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bebidas">Bebidas</SelectItem>
                <SelectItem value="Lácteos">Lácteos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Precio venta *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => {
                setFormData({ ...formData, price: e.target.value })
                if (formErrors.price) setFormErrors({ ...formErrors, price: undefined })
              }}
              placeholder="0.00"
              className={formErrors.price ? 'border-destructive' : ''}
            />
            {formErrors.price && (
              <p className="text-sm text-destructive">{formErrors.price}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stock">Stock inicial *</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => {
                setFormData({ ...formData, stock: e.target.value })
                if (formErrors.stock) setFormErrors({ ...formErrors, stock: undefined })
              }}
              placeholder="0"
              className={formErrors.stock ? 'border-destructive' : ''}
            />
            {formErrors.stock && (
              <p className="text-sm text-destructive">{formErrors.stock}</p>
            )}
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
