--CREAR TABLAS
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);


CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    direccion TEXT
);


CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    id_categoria INT NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);


CREATE TABLE suministro (
    id_producto INT,
    id_proveedor INT,
    precio_compra DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_producto, id_proveedor),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
);


CREATE TABLE sucursal (
    id_sucursal SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    hora_abre TIME,
    hora_cierra TIME
);


CREATE TABLE empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    es_gerente BOOLEAN,
    salario DECIMAL(10,2),
    id_sucursal INT,
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
);


CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    correo VARCHAR(100),
    nit VARCHAR(20)
);

CREATE TABLE venta (
    id_venta SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    total DECIMAL(10,2),
    id_cliente INT,
    id_empleado INT,
    id_sucursal INT,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado),
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
);

CREATE TABLE detalle_venta (
    id_venta INT,
    id_producto INT,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2),
    PRIMARY KEY (id_venta, id_producto),
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE stock_sucursal (
    id_producto INT,
    id_sucursal INT,
    cantidad INT NOT NULL,
    PRIMARY KEY (id_producto, id_sucursal),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
);

--INSERTAR DATOS
--dejar asi para desarrollo, más adelante llenar para min25 por tabla
INSERT INTO categoria (nombre) VALUES
('Bebidas'),
('Snacks'),
('Lácteos');

INSERT INTO proveedor (nombre, telefono, correo, direccion) VALUES
('Distribuidora A', '12345678', 'a@mail.com', 'Zona 1'),
('Proveedor B', '87654321', 'b@mail.com', 'Zona 10');

INSERT INTO producto (nombre, precio_venta, id_categoria) VALUES
('Coca Cola', 5.00, 1),
('Pepsi', 4.50, 1),
('Papas', 3.00, 2),
('Leche', 6.00, 3);

INSERT INTO suministro VALUES
(1, 1, 3.00),
(2, 1, 2.80),
(3, 2, 1.50),
(4, 2, 4.00);

INSERT INTO sucursal (nombre, telefono, direccion, hora_abre, hora_cierra) VALUES
('Sucursal Centro', '11111111', 'Zona 1', '08:00', '20:00'),
('Sucursal Norte', '22222222', 'Zona 5', '09:00', '21:00');

INSERT INTO empleado (nombre, apellido, es_gerente, salario, id_sucursal) VALUES
('Juan', 'Perez', true, 5000, 1),
('Maria', 'Lopez', false, 3000, 1),
('Carlos', 'Ramirez', true, 5500, 2);

INSERT INTO cliente (nombre, telefono, correo, nit) VALUES
('Cliente 1', '33333333', 'c1@mail.com', '1234567'),
('Cliente 2', '44444444', 'c2@mail.com', '7654321');

INSERT INTO stock_sucursal VALUES
(1, 1, 50),
(2, 1, 40),
(3, 2, 30),
(4, 2, 20);

INSERT INTO venta (fecha, total, id_cliente, id_empleado, id_sucursal) VALUES
('2026-04-01', 15.00, 1, 1, 1),
('2026-04-02', 9.00, 2, 2, 1);


INSERT INTO detalle_venta VALUES
(1, 1, 2, 5.00),
(1, 3, 1, 3.00),
(2, 2, 2, 4.50);