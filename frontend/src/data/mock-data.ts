export interface Product {
  id: string
  name: string
  category: 'Bebidas' | 'Lácteos'
  price: number
  stock: number
  supplierId: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  nit: string
  email: string
  purchases: number
}

export interface Employee {
  id: string
  carnet: string
  name: string
  initials: string
  role: 'empleado' | 'empleada' | 'gerente'
  sales: number
  total: number
}

export interface Supplier {
  id: string
  name: string
  phone: string
  email: string
  address: string
  productsCount: number
}

export interface Branch {
  id: string
  name: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export const branches: Branch[] = [
  { id: '1', name: 'Zona 10' },
  { id: '2', name: 'Zona 1' },
  { id: '3', name: 'Mixco' },
]

export const employees: Employee[] = [
  { id: '1', carnet: '1001', name: 'María Ajú', initials: 'MA', role: 'empleada', sales: 12, total: 2150 },
  { id: '2', carnet: '1002', name: 'Pedro Coc', initials: 'PC', role: 'empleado', sales: 8, total: 1480 },
  { id: '3', carnet: '1003', name: 'Luis Toj', initials: 'LT', role: 'gerente', sales: 3, total: 650 },
]

export const suppliers: Supplier[] = [
  { id: '1', name: 'Distribuidora El Sol', phone: '2222-1111', email: 'pedidos@elsol.gt', address: 'Zona 12, Ciudad de Guatemala', productsCount: 15 },
  { id: '2', name: 'Lácteos del Valle', phone: '2222-2222', email: 'pedidos@lacteosvalle.com', address: 'Mixco, Guatemala', productsCount: 8 },
  { id: '3', name: 'Bebidas Premium S.A.', phone: '2222-3333', email: 'info@bebidaspremium.gt', address: 'Zona 10, Ciudad de Guatemala', productsCount: 12 },
]

export const products: Product[] = [
  { id: '1', name: 'Café instantáneo', category: 'Bebidas', price: 35.00, stock: 4, supplierId: '1' },
  { id: '2', name: 'Té verde orgánico', category: 'Bebidas', price: 28.50, stock: 5, supplierId: '3' },
  { id: '3', name: 'Jugo de naranja', category: 'Bebidas', price: 18.00, stock: 24, supplierId: '3' },
  { id: '4', name: 'Leche entera 1L', category: 'Lácteos', price: 12.50, stock: 45, supplierId: '2' },
  { id: '5', name: 'Yogurt natural', category: 'Lácteos', price: 15.00, stock: 8, supplierId: '2' },
  { id: '6', name: 'Queso fresco', category: 'Lácteos', price: 42.00, stock: 0, supplierId: '2' },
]

export const customers: Customer[] = [
  { id: '1', name: 'María García', phone: '55551234', nit: '12345678-9', email: 'maria@email.com', purchases: 8 },
  { id: '2', name: 'Juan Pérez', phone: '55555678', nit: '98765432-1', email: 'juan@email.com', purchases: 3 },
  { id: '3', name: 'Ana López', phone: '55559012', nit: '45678901-2', email: 'ana@email.com', purchases: 12 },
  { id: '4', name: 'Carlos Ruiz', phone: '55553456', nit: '78901234-5', email: 'carlos@email.com', purchases: 1 },
]

export const topProducts = [
  { name: 'Leche entera 1L', units: 45, revenue: 562.50 },
  { name: 'Jugo de naranja', units: 32, revenue: 576.00 },
  { name: 'Queso fresco', units: 18, revenue: 756.00 },
]

export const formatCurrency = (amount: number): string => {
  return `Q ${amount.toFixed(2)}`
}

export const getSupplierById = (id: string): Supplier | undefined => {
  return suppliers.find(s => s.id === id)
}

export const getEmployeeByCarnet = (carnet: string): Employee | undefined => {
  return employees.find(e => e.carnet === carnet)
}

export const isManager = (employee: Employee): boolean => {
  return employee.role === 'gerente'
}
