-- =========================================================
-- SCRIPT DE INICIALIZACIÓN DE TABLAS EN SUPABASE
-- C&TEES - LUXURY STREETWEAR STORE
-- =========================================================

-- 1. CREACIÓN DE LA TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS ct_productos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  "codigoBarras" TEXT UNIQUE NOT NULL,
  imagen TEXT NOT NULL,
  descripcion TEXT
);

-- 2. CREACIÓN DE LA TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS ct_usuarios (
  usuario TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  contrasena TEXT NOT NULL
);

-- 3. CREACIÓN DE LA TABLA DE VENTAS
CREATE TABLE IF NOT EXISTS ct_ventas (
  id TEXT PRIMARY KEY,
  vendedor TEXT NOT NULL,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  productos TEXT NOT NULL,
  total NUMERIC NOT NULL,
  cupon TEXT,
  "detallesItems" JSONB
);

-- 4. CONFIGURACIÓN DE POLÍTICAS DE SEGURIDAD (RLS)
-- Nota: Habilitamos RLS y agregamos políticas de acceso libre/anónimo
-- ideales para proyectos escolares sencillos sin autenticación obligatoria.

ALTER TABLE ct_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ct_ventas ENABLE ROW LEVEL SECURITY;

-- Políticas para Tabla de Productos
DROP POLICY IF EXISTS "Lectura pública de productos" ON ct_productos;
CREATE POLICY "Lectura pública de productos" ON ct_productos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Inserción pública de productos" ON ct_productos;
CREATE POLICY "Inserción pública de productos" ON ct_productos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualización pública de productos" ON ct_productos;
CREATE POLICY "Actualización pública de productos" ON ct_productos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Eliminación pública de productos" ON ct_productos;
CREATE POLICY "Eliminación pública de productos" ON ct_productos FOR DELETE USING (true);

-- Políticas para Tabla de Usuarios
DROP POLICY IF EXISTS "Todo permitido en usuarios" ON ct_usuarios;
CREATE POLICY "Todo permitido en usuarios" ON ct_usuarios FOR ALL USING (true) WITH CHECK (true);

-- Políticas para Tabla de Ventas
DROP POLICY IF EXISTS "Todo permitido en ventas" ON ct_ventas;
CREATE POLICY "Todo permitido en ventas" ON ct_ventas FOR ALL USING (true) WITH CHECK (true);

-- 5. INSERCIÓN DE PRODUCTOS INICIALES (Mecanismo para evitar duplicados en re-ejecuciones)
INSERT INTO ct_productos (id, nombre, categoria, precio, "codigoBarras", imagen, descripcion) VALUES
('prod-1', 'T-Shirt Oversized Vintage', 'Camisetas', 450, '7501001', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80', 'Camiseta de corte oversized en algodón pesado de 240g con lavado vintage ácido negro.'),
('prod-2', 'T-Shirt Minimalist White', 'Camisetas', 390, '7501002', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80', 'Camiseta blanca de algodón orgánico, cuello cerrado y bordado minimalista C&Tees en el pecho.'),
('prod-3', 'Pants Cargo Streetwear', 'Pants', 890, '7501003', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80', 'Pantalón cargo de gabardina con múltiples bolsillos y correas de ajuste táctico estilo techwear.'),
('prod-4', 'Joggers Techwear Black', 'Pants', 790, '7501004', 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=500&auto=format&fit=crop&q=80', 'Joggers ajustados repelentes al agua con cierres termosellados y tobilleras elásticas premium.'),
('prod-5', 'Retro Bomber Jacket', 'Chamarras', 1250, '7501005', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80', 'Chamarra bomber satinada con forro acolchado naranja, parches bordados y fit holgado.'),
('prod-6', 'Denim Distressed Jacket', 'Chamarras', 1100, '7501006', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80', 'Chamarra de mezclilla gruesa con desgastados hechos a mano y botones metálicos grabados.'),
('prod-7', 'Gorra Snapback Street', 'Gorras', 350, '7501007', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80', 'Gorra estructurada de 6 paneles con visera plana y broche ajustable clásico de alta resistencia.'),
('prod-8', 'Beanie Neon Coral', 'Gorras', 290, '7501008', 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=500&auto=format&fit=crop&q=80', 'Gorro tejido de punto acrílico de alta densidad en tono acento coral brillante C&Tees.'),
('prod-9', 'Shorts Athletic Mesh', 'Shorts', 420, '7501009', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=80', 'Shorts deportivos de malla transpirable con jareta de contraste y logotipo reflectivo.'),
('prod-10', 'Shorts Cargo Utility', 'Shorts', 550, '7501010', 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=80', 'Shorts de corte relajado tipo cargo en tejido de sarga resistente con cinturón integrado.'),
('prod-11', 'Hoodie Pastel Peach', 'Sudaderas', 950, '7501011', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80', 'Sudadera con capucha en felpa francesa color durazno pastel, gorro de doble capa sin cordones.'),
('prod-12', 'Crewneck Graphic Knit', 'Sudaderas', 850, '7501012', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80', 'Sudadera de cuello redondo con tejido jacquard gráfico experimental en blanco y negro.')
ON CONFLICT (id) DO NOTHING;

-- 6. INSERCIÓN DEL USUARIO ADMINISTRADOR INICIAL
INSERT INTO ct_usuarios (usuario, nombre, contrasena) VALUES
('admin', 'Alessandro Vázquez', '12345')
ON CONFLICT (usuario) DO NOTHING;
