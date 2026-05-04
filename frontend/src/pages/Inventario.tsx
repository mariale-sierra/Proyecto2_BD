import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Package, AlertTriangle, XCircle } from 'lucide-react'
import { productosApi } from '@/services/api/productos.api'
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

interface Product {
  id_producto: number
  nombre: string
  precio_venta: number
  categoria: string
  stock: number
}

interface Category {
  id_categoria: number
  nombre: string
}

interface FormErrors {
  name?: string
  price?: string
  category?: string
  stock?: string
}

function formatCurrency(amount: number | string): string {
  return `Q ${Number(amount).toFixed(2)}`
}

function getStockInfo(stock: number, maxStock: number = 100) {
    const progress = maxStock > 0 ? Math.min((stock / maxStock) * 100, 100) : 0
    
    if (stock === 0) return {
        progress: 0,
        color: 'text-destructive',
        bgColor: 'bg-destructive/20',
        label: 'Sin stock'
    }
    if (stock < 5) return {
        progress,
        color: 'text-warning',
        bgColor: 'bg-warning/20',
        label: 'Stock bajo'
    }
    return {
        progress,
        color: 'text-success',
        bgColor: 'bg-success/20',
        label: 'OK'
    }
}

export default function Inventario() {
  const { branch, showToast } = useApp()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const loadCategories = async () => {
    try {
      const data = await productosApi.categorias() as Category[]
      setCategories(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las categorias.'
      showToast({ message, type: 'error' })
    }
  }

  const loadProducts = async () => {
    if (!branch?.id_sucursal) {
      setProducts([])
      return
    }

    try {
      setLoading(true)
      const data = await productosApi.findBySucursal(branch.id_sucursal, searchQuery.trim() || undefined) as Product[]
      setProducts(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el inventario.'
      showToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  

  useEffect(() => {
    void loadCategories()
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [branch?.id_sucursal, searchQuery])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryFilter === 'Todas' || product.categoria === categoryFilter
    return matchesCategory
  })

  const stats = {
    active: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  }

  const openNewPanel = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      categoryId: categories[0] ? String(categories[0].id_categoria) : '',
      price: '',
      stock: '',
    })
    setFormErrors({})
    setPanelOpen(true)
  }

  const openEditPanel = (product: Product) => {
    const category = categories.find((c) => c.nombre === product.categoria)
    setEditingProduct(product)
    setFormData({
      name: product.nombre,
      categoryId: category ? String(category.id_categoria) : '',
      price: product.precio_venta.toString(),
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

    if (!formData.categoryId.trim()) {
      errors.category = 'Selecciona una categoria'
    }

    if (!formData.price.trim()) {
      errors.price = 'Este campo es obligatorio'
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      errors.price = 'Ingresa un precio valido'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    if (!branch?.id_sucursal) {
      showToast({ message: 'No hay sucursal seleccionada.', type: 'error' })
      return
    }

    try {
      const payload = {
        nombre: formData.name,
        precio_venta: Number(formData.price),
        id_categoria: Number(formData.categoryId),
        stock: Number(formData.stock),
        id_sucursal: branch.id_sucursal,
      }

      if (editingProduct) {
        await productosApi.update(editingProduct.id_producto, payload)
      } else {
        await productosApi.create(payload)
      }

      closePanel()
      showToast({ message: 'Producto guardado', type: 'success' })
      await loadProducts()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el producto.'
      showToast({ message, type: 'error' })
    }
  }

  const handleDelete = async () => {
    if (!editingProduct) return

    try {
      await productosApi.delete(editingProduct.id_producto)
      closePanel()
      showToast({ message: 'Producto eliminado', type: 'success' })
      await loadProducts()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo eliminar el producto.'
      showToast({ message, type: 'error' })
    }
  }

  const categoryOptions = ['Todas', ...categories.map((c) => c.nombre)]

  return (
    <>
      <div className="space-y-6">
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
              {categoryOptions.map((category) => (
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

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Precio venta</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Cargando inventario...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const maxStock = Math.max(...filteredProducts.map(p => p.stock), 1)
                  const stockInfo = getStockInfo(product.stock, maxStock)
                  return (
                    <TableRow key={product.id_producto} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{product.nombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.categoria}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(product.precio_venta)}</TableCell>
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
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

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
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => {
                setFormData({ ...formData, categoryId: value })
                if (formErrors.category) setFormErrors({ ...formErrors, category: undefined })
              }}
            >
              <SelectTrigger id="category" className={formErrors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecciona categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id_categoria} value={String(category.id_categoria)}>
                    {category.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.category && (
              <p className="text-sm text-destructive">{formErrors.category}</p>
            )}
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

          {editingProduct && (
            <div className="space-y-2">
              <Label htmlFor="stock">Stock actual</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => {
                 setFormData({ ...formData, stock: e.target.value })
                 if (formErrors.stock) setFormErrors({ ...formErrors, stock: undefined })
                }}   
                />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={closePanel}>
              Cancelar
            </Button>
            {editingProduct && (
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                Eliminar
              </Button>
            )}
            <Button className="flex-1" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </SidePanel>
    </>
  )
}
