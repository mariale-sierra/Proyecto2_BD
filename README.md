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

# 👤 Modelo del sistema

En este archivo se encuentran los diagramas y dependencias explicadas para entender el sistema y que corresponden a las primeras tareas de la rúbrica de evaluación
https://docs.google.com/document/d/17fy9KTf-4FbpkY6U6HHbUKlLCPNzw8P35lCBo34G9Ro/edit?usp=sharing 


---

# 🧠 Tareas implementadas de la rúbrica de evaluación

## 🔐 Roles y autenticación en el DBMS

Se definieron 5 roles en PostgreSQL con permisos granulares:

* `dueno`
* `gerente_sucursal`
* `vendedor`
* `contador`
* `bodeguero`

Además, el script incluye usuarios de prueba del DBMS y el frontend cuenta con sesión con cookie HttpOnly, login/logout y control visual por rol.

### Acceso desde la UI

En la pantalla de login puedes ingresar un carnet numérico o una credencial demo:

| Rol | Credencial demo | Qué debes ver |
| --- | --- | --- |
| Dueño | `dueno123` | Acceso a todas las vistas, selector de sucursales completo y navegación completa |
| Gerente de sucursal | `gerente123` | Acceso a ventas, clientes, inventario, reportes y proveedores; sucursal fija a la propia |
| Vendedor | `vendedor123` | Acceso a nueva venta, clientes e inventario; no ve reportes ni proveedores |
| Contador | `contador123` | Acceso solo a reportes |
| Bodeguero | `bodeguero123` | Acceso a inventario y proveedores; sucursal fija |

### Qué validar en cada rol

* El dueño puede cambiar de sucursal desde el menú superior.
* El gerente ve el mismo menú de navegación que el dueño, pero no puede cambiar a sucursales ajenas.
* El vendedor no ve enlaces a reportes ni proveedores.
* El contador entra directamente a reportes.
* El bodeguero solo ve inventario y proveedores.
* El botón `Cerrar sesión` cierra la sesión persistente y obliga a volver al login.

### Nota sobre la base de datos

Si el contenedor de PostgreSQL ya existía antes de estos cambios, puede quedar un volumen con el esquema antiguo. En ese caso la app sigue funcionando, pero conviene recrear la base para tener la columna `rol` en `empleado` y cargar el script actualizado desde cero.

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

## 🖥️ CRUD implementados

* Productos + Categorías
* Clientes
* Empleados
* Sucursales

---

## ⚙️ Stored Procedures y ORM

* 5 rutinas del módulo de ventas se invocan desde el backend.
* `registrar_venta` maneja validaciones, transacción lógica y errores.
* `generar_factura` usa parámetros de salida.
* `reporte_ventas` devuelve un resumen estructurado para la UI.
* TypeORM se usa en CRUD reales de categorías, clientes, sucursales, empleados y ventas.

## 📈 Reportes en UI

* Ventas del día
* Ventas por sucursal
* Productos con stock bajo

---

## 🧪 Cómo probar cada rol

1. Levanta el sistema con `docker compose up --build`.
2. Abre la UI en `http://localhost:5173`.
3. Ingresa una credencial demo o un carnet válido.
4. Observa las vistas y opciones disponibles según el rol.
5. Usa `Cerrar sesión` para probar otro rol.

### Flujo esperado por pantalla

* `Nueva venta`: selección de productos, cliente y confirmación de la venta.
* `Clientes`: listado, búsqueda y CRUD de clientes.
* `Inventario`: productos, stock por sucursal y edición de producto.
* `Reportes`: resumen por sucursal con empleados y stock.
* `Proveedores`: sugerencias de reabastecimiento y gestión de proveedores.

## ⚠️ Manejo de errores

* Validaciones en formularios
* Mensajes de error visibles
* Manejo de errores en backend
* Rollback en transacciones (ej: stock insuficiente)

