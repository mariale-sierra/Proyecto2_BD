-- ==========================================
-- ROLES DE POSTGRESQL
-- ==========================================

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE sucursal (
    id_sucursal SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    hora_abre TIME,
    hora_cierra TIME
);

CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion TEXT
);

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100),
    nit VARCHAR(20)
);

CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    es_gerente BOOLEAN NOT NULL DEFAULT FALSE,
    salario DECIMAL(10,2) NOT NULL,
    id_sucursal INT,
    CONSTRAINT fk_empleado_sucursal
        FOREIGN KEY (id_sucursal)
        REFERENCES sucursal (id_sucursal)
        ON DELETE SET NULL
);

CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    id_categoria INT NOT NULL,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria)
        ON DELETE RESTRICT
);

CREATE TABLE venta (
    id_venta SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10,2),
    id_cliente INT,
    id_empleado INT,
    id_sucursal INT,
    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente (id_cliente)
        ON DELETE SET NULL,
    CONSTRAINT fk_venta_empleado
        FOREIGN KEY (id_empleado)
        REFERENCES empleado (id_empleado)
        ON DELETE SET NULL,
    CONSTRAINT fk_venta_sucursal
        FOREIGN KEY (id_sucursal)
        REFERENCES sucursal (id_sucursal)
        ON DELETE SET NULL
);

CREATE TABLE suministro (
    id_producto INT NOT NULL,
    id_proveedor INT NOT NULL,
    precio_compra DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_producto, id_proveedor),
    CONSTRAINT fk_suministro_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
        ON DELETE CASCADE,
    CONSTRAINT fk_suministro_proveedor
        FOREIGN KEY (id_proveedor)
        REFERENCES proveedor (id_proveedor)
        ON DELETE CASCADE
);

CREATE TABLE detalle_venta (
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_venta, id_producto),
    CONSTRAINT fk_detalle_venta_venta
        FOREIGN KEY (id_venta)
        REFERENCES venta (id_venta)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_venta_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
        ON DELETE RESTRICT
);

CREATE TABLE stock_sucursal (
    id_producto INT NOT NULL,
    id_sucursal INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_producto, id_sucursal),
    CONSTRAINT fk_stock_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto (id_producto)
        ON DELETE CASCADE,
    CONSTRAINT fk_stock_sucursal
        FOREIGN KEY (id_sucursal)
        REFERENCES sucursal (id_sucursal)
        ON DELETE CASCADE
);

CREATE ROLE dueno;
CREATE ROLE gerente_sucursal;
CREATE ROLE vendedor;
CREATE ROLE contador;
CREATE ROLE bodeguero;

-- dueno: acceso total
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dueno;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dueno;

-- gerente_sucursal: administra su sucursal
GRANT SELECT, INSERT, UPDATE ON venta, detalle_venta, stock_sucursal TO gerente_sucursal;
GRANT SELECT ON producto, categoria, cliente, empleado, sucursal, proveedor, suministro TO gerente_sucursal;

-- vendedor: solo registrar ventas y consultar
GRANT SELECT ON producto, categoria, cliente, sucursal, stock_sucursal TO vendedor;
GRANT SELECT, INSERT ON venta, detalle_venta TO vendedor;
GRANT UPDATE ON stock_sucursal TO vendedor;

-- contador: solo lectura para reportes
GRANT SELECT ON ALL TABLES IN SCHEMA public TO contador;

-- bodeguero: maneja stock y proveedores
GRANT SELECT, UPDATE ON stock_sucursal TO bodeguero;
GRANT SELECT ON producto, proveedor, suministro TO bodeguero;
GRANT INSERT ON suministro TO bodeguero;

-- ==========================================
-- VISTAS
-- ==========================================

CREATE VIEW vista_venta_detalle AS
SELECT v.id_venta, v.fecha, v.total,
       c.nombre AS cliente,
       e.nombre || ' ' || e.apellido AS empleado,
       s.nombre AS sucursal,
       p.nombre AS producto,
       dv.cantidad,
       dv.precio_unitario,
       (dv.cantidad * dv.precio_unitario) AS subtotal
FROM venta v
JOIN cliente c      ON v.id_cliente  = c.id_cliente
JOIN empleado e     ON v.id_empleado = e.id_empleado
JOIN sucursal s     ON v.id_sucursal = s.id_sucursal
JOIN detalle_venta dv ON v.id_venta  = dv.id_venta
JOIN producto p     ON dv.id_producto = p.id_producto;

CREATE VIEW vista_stock_sucursal AS
SELECT p.id_producto, p.nombre AS producto,
       c.nombre AS categoria,
       s.id_sucursal, s.nombre AS sucursal,
       ss.cantidad,
       CASE
           WHEN ss.cantidad = 0 THEN 'sin_stock'
           WHEN ss.cantidad < 5 THEN 'bajo'
           ELSE 'ok'
       END AS nivel_stock
FROM producto p
JOIN categoria c ON p.id_categoria = c.id_categoria
JOIN stock_sucursal ss ON p.id_producto = ss.id_producto
JOIN sucursal s ON ss.id_sucursal = s.id_sucursal;

CREATE VIEW vista_productos_reorden AS
SELECT p.id_producto, p.nombre AS producto,
       ss.id_sucursal, s.nombre AS sucursal,
       ss.cantidad AS stock_actual,
       pr.id_proveedor, pr.nombre AS proveedor,
       pr.correo AS correo_proveedor,
       su.precio_compra
FROM producto p
JOIN stock_sucursal ss ON p.id_producto = ss.id_producto
JOIN sucursal s ON ss.id_sucursal = s.id_sucursal
JOIN suministro su ON p.id_producto = su.id_producto
JOIN proveedor pr ON su.id_proveedor = pr.id_proveedor
WHERE ss.cantidad < 5;

-- ==========================================
-- SP 1: registrar_venta (con transaccion y validaciones)
-- ==========================================

CREATE OR REPLACE FUNCTION registrar_venta(
    p_id_cliente  INT,
    p_id_empleado INT,
    p_items       JSONB,
    p_id_sucursal INT
)
RETURNS INT AS $$
DECLARE
    v_id_venta     INT;
    v_id_sucursal  INT;
    v_total        DECIMAL(10,2) := 0;
    v_item         JSONB;
    v_stock_actual INT;
    v_id_producto  INT;
    v_cantidad     INT;
    v_precio       DECIMAL(10,2);
BEGIN
    -- validar empleado y obtener su sucursal
    SELECT id_sucursal INTO v_id_sucursal
    FROM empleado WHERE id_empleado = p_id_empleado;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Empleado no encontrado';
    END IF;

    IF v_id_sucursal IS DISTINCT FROM p_id_sucursal THEN
        RAISE EXCEPTION 'El empleado no pertenece a la sucursal seleccionada';
    END IF;

    -- validar cliente
    IF NOT EXISTS (SELECT 1 FROM cliente WHERE id_cliente = p_id_cliente) THEN
        RAISE EXCEPTION 'Cliente no encontrado';
    END IF;

    -- validar stock de todos los productos antes de insertar nada
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_id_producto := (v_item->>'id_producto')::INT;
        v_cantidad    := (v_item->>'cantidad')::INT;

        IF NOT EXISTS (SELECT 1 FROM producto WHERE id_producto = v_id_producto) THEN
            RAISE EXCEPTION 'Producto % no existe', v_id_producto;
        END IF;

        SELECT cantidad INTO v_stock_actual
        FROM stock_sucursal
        WHERE id_producto = v_id_producto AND id_sucursal = v_id_sucursal;

        IF NOT FOUND OR v_stock_actual < v_cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente para el producto %', v_id_producto;
        END IF;
    END LOOP;

    -- calcular total
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_total := v_total +
            (v_item->>'precio_unitario')::DECIMAL *
            (v_item->>'cantidad')::INT;
    END LOOP;

    -- insertar venta
    INSERT INTO venta (fecha, total, id_cliente, id_empleado, id_sucursal)
    VALUES (CURRENT_DATE, v_total, p_id_cliente, p_id_empleado, v_id_sucursal)
    RETURNING id_venta INTO v_id_venta;

    -- insertar detalles y descontar stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_id_producto := (v_item->>'id_producto')::INT;
        v_cantidad    := (v_item->>'cantidad')::INT;
        v_precio      := (v_item->>'precio_unitario')::DECIMAL;

        INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario)
        VALUES (v_id_venta, v_id_producto, v_cantidad, v_precio);

        UPDATE stock_sucursal
        SET cantidad = cantidad - v_cantidad
        WHERE id_producto = v_id_producto AND id_sucursal = v_id_sucursal;
    END LOOP;

    RETURN v_id_venta;

EXCEPTION
    WHEN OTHERS THEN
        RAISE; -- rollback automatico + propaga el error al backend
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- SP 2: reabastecer_stock (para bodeguero)
-- ==========================================

CREATE OR REPLACE FUNCTION reabastecer_stock(
    p_id_producto  INT,
    p_id_sucursal  INT,
    p_cantidad     INT
)
RETURNS VOID AS $$
BEGIN
    -- validar que el producto existe
    IF NOT EXISTS (SELECT 1 FROM producto WHERE id_producto = p_id_producto) THEN
        RAISE EXCEPTION 'Producto no encontrado';
    END IF;

    -- validar que la sucursal existe
    IF NOT EXISTS (SELECT 1 FROM sucursal WHERE id_sucursal = p_id_sucursal) THEN
        RAISE EXCEPTION 'Sucursal no encontrada';
    END IF;

    -- validar cantidad positiva
    IF p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
    END IF;

    -- si ya existe el registro, sumar; si no, insertar
    INSERT INTO stock_sucursal (id_producto, id_sucursal, cantidad)
    VALUES (p_id_producto, p_id_sucursal, p_cantidad)
    ON CONFLICT (id_producto, id_sucursal)
    DO UPDATE SET cantidad = stock_sucursal.cantidad + p_cantidad;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- SP 3: generar_factura (con OUT params)
-- ==========================================

CREATE OR REPLACE FUNCTION generar_factura(
    p_id_venta        INT,
    OUT numero_factura VARCHAR(20),
    OUT cliente_nombre VARCHAR(100),
    OUT empleado_nombre VARCHAR(200),
    OUT sucursal_nombre VARCHAR(100),
    OUT fecha_venta    DATE,
    OUT total          DECIMAL(10,2)
)
AS $$
BEGIN
    SELECT
        'FAC-' || LPAD(v.id_venta::TEXT, 6, '0'),
        c.nombre,
        e.nombre || ' ' || e.apellido,
        s.nombre,
        v.fecha,
        v.total
    INTO
        numero_factura,
        cliente_nombre,
        empleado_nombre,
        sucursal_nombre,
        fecha_venta,
        total
    FROM venta v
    JOIN cliente c  ON v.id_cliente  = c.id_cliente
    JOIN empleado e ON v.id_empleado = e.id_empleado
    JOIN sucursal s ON v.id_sucursal = s.id_sucursal
    WHERE v.id_venta = p_id_venta;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Venta % no encontrada', p_id_venta;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- SP 4: actualizar_precio_producto
-- ==========================================

CREATE OR REPLACE FUNCTION actualizar_precio_producto(
    p_id_producto  INT,
    p_precio_nuevo DECIMAL(10,2)
)
RETURNS VOID AS $$
BEGIN
    -- validar que el producto existe
    IF NOT EXISTS (SELECT 1 FROM producto WHERE id_producto = p_id_producto) THEN
        RAISE EXCEPTION 'Producto no encontrado';
    END IF;

    -- validar precio positivo
    IF p_precio_nuevo <= 0 THEN
        RAISE EXCEPTION 'El precio debe ser mayor a 0';
    END IF;

    UPDATE producto
    SET precio_venta = p_precio_nuevo
    WHERE id_producto = p_id_producto;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- SP 5: reporte_ventas (por sucursal y fechas)
-- ==========================================

CREATE OR REPLACE FUNCTION reporte_ventas(
    p_id_sucursal  INT DEFAULT NULL,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin    DATE DEFAULT NULL
)
RETURNS TABLE (
    sucursal       VARCHAR,
    empleado       TEXT,
    total_ventas   BIGINT,
    ingresos       DECIMAL,
    ticket_promedio DECIMAL,
    fecha          DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.nombre::VARCHAR         AS sucursal,
        (e.nombre || ' ' || e.apellido)::TEXT AS empleado,
        COUNT(v.id_venta)         AS total_ventas,
        SUM(v.total)              AS ingresos,
        AVG(v.total)              AS ticket_promedio,
        v.fecha                   AS fecha
    FROM venta v
    JOIN empleado e ON v.id_empleado = e.id_empleado
    JOIN sucursal s ON v.id_sucursal = s.id_sucursal
    WHERE
        (p_id_sucursal IS NULL OR v.id_sucursal = p_id_sucursal)
        AND (p_fecha_inicio IS NULL OR v.fecha >= p_fecha_inicio)
        AND (p_fecha_fin    IS NULL OR v.fecha <= p_fecha_fin)
    GROUP BY s.nombre, e.nombre, e.apellido, v.fecha
    ORDER BY v.fecha DESC, ingresos DESC;
END;
$$ LANGUAGE plpgsql;

-- INSERTAR DATOS

INSERT INTO categoria (nombre) VALUES
('Bebidas'),
('Snacks'),
('Lácteos'),
('Panadería'),
('Limpieza'),
('Granos y Cereales'),
('Carnes'),
('Frutas y Verduras');

INSERT INTO proveedor (nombre, telefono, correo, direccion) VALUES
('Distribuidora El Sol', '22001100', 'sol@mail.com', 'Zona 1, Guatemala'),
('Proveedor Norte', '22001101', 'norte@mail.com', 'Zona 5, Guatemala'),
('Lácteos del País', '22001102', 'lacteos@mail.com', 'Zona 10, Guatemala'),
('Granos y Más', '22001103', 'granos@mail.com', 'Zona 3, Guatemala'),
('Distribuidora Central', '22001104', 'central@mail.com', 'Zona 4, Guatemala'),
('Bebidas GT', '22001105', 'bebidas@mail.com', 'Zona 6, Guatemala'),
('Panadería Industrial', '22001106', 'pan@mail.com', 'Zona 7, Guatemala'),
('Carnes Premium', '22001107', 'carnes@mail.com', 'Zona 8, Guatemala'),
('Frutas Frescas', '22001108', 'frutas@mail.com', 'Zona 9, Guatemala'),
('Limpieza Total', '22001109', 'limpieza@mail.com', 'Zona 11, Guatemala'),
('Snacks de Guatemala', '22001110', 'snacks@mail.com', 'Zona 12, Guatemala'),
('Distribuidora Sur', '22001111', 'sur@mail.com', 'Villa Nueva'),
('Alimentos Básicos', '22001112', 'basicos@mail.com', 'Mixco'),
('Agro Productos', '22001113', 'agro@mail.com', 'Zona 14, Guatemala'),
('Global Foods', '22001114', 'global@mail.com', 'Zona 15, Guatemala'),
('Proveedora Maya', '22001115', 'maya@mail.com', 'Antigua Guatemala'),
('Distribuidora Xela', '22001116', 'xela@mail.com', 'Quetzaltenango'),
('Cárnicos del Norte', '22001117', 'carnicos@mail.com', 'Zona 2, Guatemala'),
('Lactosa GT', '22001118', 'lactosa@mail.com', 'Zona 13, Guatemala'),
('Cereales y Granos', '22001119', 'cereales@mail.com', 'Zona 16, Guatemala'),
('Bebidas Tropicales', '22001120', 'tropicales@mail.com', 'Zona 17, Guatemala'),
('Pan Artesanal GT', '22001121', 'artesanal@mail.com', 'Zona 18, Guatemala'),
('Verduras del Campo', '22001122', 'verduras@mail.com', 'Zona 19, Guatemala'),
('Higiene y Más', '22001123', 'higiene@mail.com', 'Zona 21, Guatemala'),
('Importadora GT', '22001124', 'importadora@mail.com', 'Zona 10, Guatemala');


INSERT INTO sucursal (nombre, telefono, direccion, hora_abre, hora_cierra) VALUES
('Sucursal Centro',  '11111111', 'Zona 1, Guatemala',  '08:00', '20:00'),
('Sucursal Norte',   '22222222', 'Zona 5, Guatemala',  '09:00', '21:00'),
('Sucursal Sur',     '33333333', 'Villa Nueva',        '08:00', '20:00'),
('Sucursal Mixco',   '44444444', 'Mixco',              '09:00', '21:00'),
('Sucursal Xela',    '55555555', 'Quetzaltenango',     '08:00', '19:00');


INSERT INTO empleado (nombre, apellido, es_gerente, salario, id_sucursal) VALUES
('Juan',     'Pérez',     true,  5000.00, 1),
('María',    'López',     false, 3000.00, 1),
('Carlos',   'Ramírez',   false, 3000.00, 1),
('Ana',      'García',    false, 2800.00, 1),
('Luis',     'Mendoza',   false, 2800.00, 1),
('Sofia',    'Ajú',       true,  5500.00, 2),
('Pedro',    'Coc',       false, 3000.00, 2),
('Diana',    'Toj',       false, 2800.00, 2),
('Roberto',  'Ixcoy',     false, 2800.00, 2),
('Elena',    'Pac',       false, 3000.00, 2),
('Mario',    'Chávez',    true,  5200.00, 3),
('Laura',    'Simón',     false, 2800.00, 3),
('Jorge',    'Batz',      false, 3000.00, 3),
('Claudia',  'Xol',       false, 2800.00, 3),
('Andrés',   'Caal',      false, 2800.00, 3),
('Patricia', 'Noj',       true,  5300.00, 4),
('Ricardo',  'Tzoc',      false, 3000.00, 4),
('Verónica', 'Chun',      false, 2800.00, 4),
('Miguel',   'Pú',        false, 2800.00, 4),
('Sandra',   'Yat',       false, 3000.00, 4),
('Fernando', 'Sacul',     true,  5100.00, 5),
('Gabriela', 'Pop',       false, 2800.00, 5),
('Héctor',   'Choc',      false, 3000.00, 5),
('Ingrid',   'Xiquin',    false, 2800.00, 5),
('Oscar',    'Maquin',    false, 2800.00, 5);


INSERT INTO cliente (nombre, telefono, correo, nit) VALUES
('Ana Méndez',      '55001001', 'ana.mendez@mail.com',    '1000001'),
('Carlos Ruiz',     '55001002', 'carlos.ruiz@mail.com',   '1000002'),
('María Ajú',       '55001003', 'maria.aju@mail.com',     '1000003'),
('Pedro López',     '55001004', 'pedro.lopez@mail.com',   '1000004'),
('Sofía García',    '55001005', 'sofia.garcia@mail.com',  '1000005'),
('Luis Pérez',      '55001006', 'luis.perez@mail.com',    '1000006'),
('Diana Torres',    '55001007', 'diana.torres@mail.com',  '1000007'),
('Roberto Choc',    '55001008', 'roberto.choc@mail.com',  '1000008'),
('Elena Coc',       '55001009', 'elena.coc@mail.com',     '1000009'),
('Mario Toj',       '55001010', 'mario.toj@mail.com',     '1000010'),
('Laura Batz',      '55001011', 'laura.batz@mail.com',    '1000011'),
('Jorge Ixcoy',     '55001012', 'jorge.ixcoy@mail.com',   '1000012'),
('Claudia Pac',     '55001013', 'claudia.pac@mail.com',   '1000013'),
('Andrés Xol',      '55001014', 'andres.xol@mail.com',    '1000014'),
('Patricia Caal',   '55001015', 'patricia.caal@mail.com', '1000015'),
('Ricardo Noj',     '55001016', 'ricardo.noj@mail.com',   '1000016'),
('Verónica Tzoc',   '55001017', 'veronica.tzoc@mail.com', '1000017'),
('Miguel Chun',     '55001018', 'miguel.chun@mail.com',   '1000018'),
('Sandra Pú',       '55001019', 'sandra.pu@mail.com',     '1000019'),
('Fernando Yat',    '55001020', 'fernando.yat@mail.com',  '1000020'),
('Gabriela Sacul',  '55001021', 'gabriela.sacul@mail.com','1000021'),
('Héctor Pop',      '55001022', 'hector.pop@mail.com',    '1000022'),
('Ingrid Choc',     '55001023', 'ingrid.choc@mail.com',   '1000023'),
('Oscar Xiquin',    '55001024', 'oscar.xiquin@mail.com',  '1000024'),
('Lucía Maquin',    '55001025', 'lucia.maquin@mail.com',  '1000025');


INSERT INTO producto (nombre, precio_venta, id_categoria) VALUES
('Coca Cola 500ml',     8.00,  1),
('Pepsi 500ml',         7.50,  1),
('Agua Pura 1L',        3.00,  1),
('Jugo de Naranja',     9.00,  1),
('Café Molido 250g',   45.00,  1),
('Papas Fritas',        6.00,  2),
('Doritos',             7.00,  2),
('Galletas María',      5.00,  2),
('Chicles',             2.00,  2),
('Chocolates',         10.00,  2),
('Leche Entera 1L',    12.00,  3),
('Queso Fresco',       25.00,  3),
('Crema',              15.00,  3),
('Yogurt Natural',     14.00,  3),
('Mantequilla',        18.00,  3),
('Pan Francés',         4.00,  4),
('Pan Dulce',           3.00,  4),
('Tortillas x12',       8.00,  4),
('Detergente 1kg',     22.00,  5),
('Jabón de Barra',      5.00,  5),
('Arroz 1kg',          10.00,  6),
('Frijoles 1kg',        9.00,  6),
('Pollo Entero',       65.00,  7),
('Carne Molida 1lb',   45.00,  7),
('Tomate 1lb',          6.00,  8);

INSERT INTO suministro VALUES
(1,  1,  5.00),
(2,  1,  4.50),
(3,  6,  1.50),
(4,  6,  6.00),
(5,  1,  30.00),
(6,  11, 3.50),
(7,  11, 4.00),
(8,  11, 2.50),
(9,  11, 1.00),
(10, 11, 6.00),
(11, 3,  8.00),
(12, 3,  15.00),
(13, 3,  9.00),
(14, 3,  9.00),
(15, 3,  12.00),
(16, 7,  2.00),
(17, 7,  1.50),
(18, 7,  5.00),
(19, 10, 14.00),
(20, 10, 3.00),
(21, 4,  6.00),
(22, 4,  5.50),
(23, 8,  40.00),
(24, 8,  28.00),
(25, 9,  3.50);

INSERT INTO stock_sucursal VALUES
-- sucursal 1
(1,  1, 50), (2,  1, 40), (3,  1, 80), (4,  1,  3), (5,  1, 15),
(6,  1, 60), (7,  1, 45), (8,  1, 25), (9,  1, 100),(10, 1, 20),
(11, 1, 35), (12, 1,  4), (13, 1, 25), (14, 1, 30), (15, 1,  0),
(16, 1, 70), (17, 1, 55), (18, 1, 40), (19, 1,  3), (20, 1, 90),
(21, 1, 60), (22, 1, 45), (23, 1, 10), (24, 1, 20), (25, 1, 35),
-- sucursal 2
(1,  2, 30), (2,  2, 25), (3,  2, 50), (4,  2, 10), (5,  2, 8),
(6,  2, 60), (7,  2, 45), (8,  2,  2), (9,  2,100), (10, 2, 20),
(11, 2, 20), (12, 2, 15), (13, 2, 10), (14, 2, 12), (15, 2,  5),
(16, 2, 30), (17, 2, 20), (18, 2, 15), (19, 2,  8), (20, 2, 40),
(21, 2, 25), (22, 2, 30), (23, 2,  5), (24, 2, 10), (25, 2, 20),
-- sucursal 3
(1,  3, 20), (2,  3, 15), (3,  3, 40), (4,  3,  5), (5,  3, 10),
(6,  3, 35), (7,  3, 30), (8,  3, 20), (9,  3, 60), (10, 3, 15),
(11, 3, 35), (12, 3,  4), (13, 3, 25), (14, 3, 30), (15, 3,  0),
(16, 3, 20), (17, 3, 25), (18, 3, 10), (19, 3,  2), (20, 3, 50),
(21, 3, 30), (22, 3, 20), (23, 3,  8), (24, 3, 15), (25, 3, 25),
-- sucursal 4
(1,  4, 25), (2,  4, 20), (3,  4, 60), (4,  4,  8), (5,  4, 12),
(6,  4, 45), (7,  4, 35), (8,  4, 15), (9,  4, 80), (10, 4, 10),
(11, 4, 20), (12, 4, 10), (13, 4, 15), (14, 4, 20), (15, 4,  3),
(16, 4, 70), (17, 4, 55), (18, 4, 40), (19, 4,  3), (20, 4, 90),
(21, 4, 40), (22, 4, 35), (23, 4,  6), (24, 4, 12), (25, 4, 30),
-- sucursal 5
(1,  5, 15), (2,  5, 10), (3,  5, 30), (4,  5,  4), (5,  5,  6),
(6,  5, 25), (7,  5, 20), (8,  5, 10), (9,  5, 50), (10, 5,  8),
(11, 5, 15), (12, 5,  8), (13, 5, 12), (14, 5, 15), (15, 5,  2),
(16, 5, 30), (17, 5, 25), (18, 5, 20), (19, 5,  1), (20, 5, 45),
(21, 5, 60), (22, 5, 45), (23, 5, 10), (24, 5, 20), (25, 5, 35);


INSERT INTO venta (fecha, total, id_cliente, id_empleado, id_sucursal) VALUES
('2026-03-01', 35.00,  1,  2, 1),
('2026-03-02', 52.50,  2,  2, 1),
('2026-03-05', 18.00,  3,  3, 1),
('2026-03-08', 87.00,  4,  3, 1),
('2026-03-10', 45.00,  1,  4, 1),
('2026-03-12', 23.00,  5,  7, 2),
('2026-03-14', 66.00,  6,  7, 2),
('2026-03-15', 38.50,  7,  8, 2),
('2026-03-18', 91.00,  8,  9, 2),
('2026-03-20', 14.00,  9, 10, 2),
('2026-03-22', 55.00, 10, 12, 3),
('2026-03-24', 29.00, 11, 12, 3),
('2026-03-25', 73.00, 12, 13, 3),
('2026-03-27', 41.00, 13, 14, 3),
('2026-03-28', 18.00, 14, 15, 3),
('2026-04-01', 62.00, 15, 17, 4),
('2026-04-03', 47.00, 16, 17, 4),
('2026-04-05', 33.00, 17, 18, 4),
('2026-04-07', 88.00, 18, 19, 4),
('2026-04-09', 25.00, 19, 20, 4),
('2026-04-11', 54.00, 20, 22, 5),
('2026-04-13', 39.00, 21, 22, 5),
('2026-04-15', 71.00, 22, 23, 5),
('2026-04-17', 16.00, 23, 24, 5),
('2026-04-19', 93.00, 24, 25, 5);

INSERT INTO detalle_venta VALUES
(1,  1, 2,  8.00),
(1,  6, 1,  6.00),
(2,  2, 3,  7.50),
(2, 11, 1, 12.00),
(3,  3, 3,  3.00),
(4,  5, 1, 45.00),
(4, 12, 1, 25.00),
(5,  1, 2,  8.00),
(5,  8, 3,  5.00),
(6,  9, 4,  2.00),
(6, 20, 1,  5.00),
(7, 11, 2, 12.00),
(7, 13, 1, 15.00),
(8,  6, 3,  6.00),
(8,  7, 1,  7.00),
(9, 23, 1, 65.00),
(10, 9, 3,  2.00),
(11,12, 1, 25.00),
(11,16, 3,  4.00),
(12,17, 3,  3.00),
(13,24, 1, 45.00),
(14,18, 2,  8.00),
(15, 3, 6,  3.00),
(16,11, 2, 12.00),
(17,21, 2, 10.00);