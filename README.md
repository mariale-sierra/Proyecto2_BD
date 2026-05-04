# 🛒 Sistema de Inventario y Ventas

## 📌 Descripción del Proyecto

Este proyecto consiste en una aplicación web para la gestión de inventario y ventas de una tienda multi-sucursal. Permite administrar productos, clientes, empleados y registrar ventas, manteniendo control del stock por sucursal.

El sistema está compuesto por:

* **Frontend:** React Native (Expo)
* **Backend:** NestJS
* **Base de datos:** PostgreSQL

---

## 🚀 Cómo ejecutar el proyecto

### 1. Clonar repositorio

```bash
git clone https://github.com/mariale-sierra/Proyecto2_BD.git
cd Proyecto2_BD
```

### 2. Levantar el sistema

```bash
docker compose up --build
```

### 3. Acceder a la aplicación

* Frontend: http://localhost:5173
* Backend: http://localhost:3000

---

## ⚠️ Notas importantes

* NO usar `docker compose down -v` ya que elimina la base de datos.
* `init.sql` solo se ejecuta la primera vez.

---

# 🧠 Tareas implementadas de la rúbrica de evaluación

## 🔗 3 consultas con JOIN (múltiples tablas)

* **Crear venta:** combina `Venta + DetalleVenta + Producto + Cliente + Empleado`
* **Buscar producto:** combina `Producto + Categoría`
* **Reporte de ventas:** combina `Venta + Cliente + Empleado + Sucursal`

---

## 🔍 2 Subqueries

* **Pedir a proveedor (EXISTS):**
* **Reporte stock bajo:**
---

## 📊 GROUP BY + HAVING + agregaciones

* **Ventas del día**
* **Ventas por sucursal**
* **Revisión de stock**

---

## 🧾 VIEW utilizadas

* `stock_sucursal`
* `reporte_ventas`
* `productos_reorden`

Estas vistas son consumidas por el backend para mostrar datos en la UI.

---

## 🔄 Transacción con ROLLBACK

La creación de venta implementa una transacción:

* Inserta en `Venta`
* Inserta en `DetalleVenta`
* Descuenta stock en `stock_sucursal`
* Si ocurre un error → `ROLLBACK`

---

# 🖥️ Aplicación Web

## CRUD implementados

* Productos + Categorías
* Clientes
* Empleados
* Sucursales

---

## 📈 Reportes en UI

* Ventas del día
* Ventas por sucursal
* Productos con stock bajo

---

## ⚠️ Manejo de errores

* Validaciones en formularios
* Mensajes de error visibles
* Manejo de errores en backend
* Rollback en transacciones (ej: stock insuficiente)


y además incorpora mejoras como soporte multi-sucursal y control de inventario en tiempo real.
