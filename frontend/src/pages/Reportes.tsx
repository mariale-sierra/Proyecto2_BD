import { useEffect, useMemo, useState } from 'react'
import { DollarSign, ShoppingCart, Receipt } from 'lucide-react'
import { empleadosApi } from '@/services/api/empleados.api'
import { productosApi } from '@/services/api/productos.api'
import { useApp } from '@/src/App'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EmployeeRow {
  id_empleado: number
  nombre: string
  apellido: string
  es_gerente: boolean
  salario: number
  nombre_sucursal?: string
}

interface ProductRow {
  id_producto: number
  nombre: string
  precio_venta: number
  stock: number
}

function formatCurrency(amount: number): string {
  return `Q ${amount.toFixed(2)}`
}

const dateRanges = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
] as const

export default function Reportes() {
  const { branch, branches, showToast } = useApp()

  const [dateRange, setDateRange] = useState('today')
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [employees, setEmployees] = useState<EmployeeRow[]>([])
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (branch?.id_sucursal) {
      setSelectedBranch(String(branch.id_sucursal))
    }
  }, [branch?.id_sucursal])

  const loadReportData = async (branchId: number) => {
    try {
      setLoading(true)
      const [employeeData, productData] = await Promise.all([
        empleadosApi.findBySucursal(branchId) as Promise<EmployeeRow[]>,
        productosApi.stockCompleto(branchId) as Promise<ProductRow[]>,
      ])
      setEmployees(employeeData)
      setProducts(productData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar el reporte.'
      showToast({ message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const branchId = Number(selectedBranch)
    if (!branchId) return
    void loadReportData(branchId)
  }, [selectedBranch, dateRange])

  const metrics = useMemo(() => {
    const totalInventoryValue = products.reduce((sum, p) => sum + p.precio_venta * p.stock, 0)
    const outOfStock = products.filter((p) => p.stock === 0).length
    const avgSalary = employees.length
      ? employees.reduce((sum, e) => sum + Number(e.salario), 0) / employees.length
      : 0

    return {
      totalInventoryValue,
      outOfStock,
      avgSalary,
    }
  }, [products, employees])

  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sucursal" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b.id_sucursal} value={String(b.id_sucursal)}>
                {b.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => selectedBranch && void loadReportData(Number(selectedBranch))}>
          Ver reporte
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor inventario</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(metrics.totalInventoryValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Productos sin stock</p>
              <p className="text-2xl font-bold">{metrics.outOfStock}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salario promedio</p>
              <p className="text-2xl font-bold">{formatCurrency(metrics.avgSalary)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Empleados de sucursal</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead className="text-right">Cargo</TableHead>
                  <TableHead className="text-right">Salario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Cargando empleados...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay empleados para esta sucursal.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id_empleado} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {employee.nombre} {employee.apellido}
                      </TableCell>
                      <TableCell className="text-right">
                        {employee.es_gerente ? 'Gerente' : 'Empleado'}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(employee.salario))}
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
            <CardTitle className="text-lg">Top productos por stock</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Cargando productos...
                    </TableCell>
                  </TableRow>
                ) : topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No hay productos para mostrar.
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map((product) => (
                    <TableRow key={product.id_producto} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{product.nombre}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.precio_venta * product.stock)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
