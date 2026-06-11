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
('prod-12', 'Crewneck Graphic Knit', 'Sudaderas', 850, '7501012', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80', 'Sudadera de cuello redondo con tejido jacquard gráfico experimental en blanco y negro.'),
('prod-13', 'T-Shirt Cyberpunk Tokyo', 'Camisetas', 480, '7501013', 'assets/img/tshirt_cyberpunk.png', 'Camiseta gráfica pesada con impresión digital frontal inspirada en la tipografía urbana de Tokio.'),
('prod-14', 'T-Shirt Boxy Acid Wash', 'Camisetas', 460, '7501014', 'assets/img/tshirt_white.png', 'Corte boxy fit pesado con teñido artesanal acid wash y costuras reforzadas a contraste.'),
('prod-15', 'T-Shirt Minimal Rose', 'Camisetas', 430, '7501015', 'assets/img/tshirt_minimal_rose.png', 'Silueta clásica de C&Tees con una rosa bordada en hilo de seda de alta densidad en el pecho.'),
('prod-16', 'T-Shirt Skate Retro 90s', 'Camisetas', 470, '7501016', 'assets/img/tshirt_vintage.png', 'Prenda de algodón premium inspirada en la época de oro del skate y hip-hop de los 90s.'),
('prod-17', 'T-Shirt Techno Industrial', 'Camisetas', 490, '7501017', 'assets/img/tshirt_techno_grid.png', 'Camiseta de ajuste regular con diseño minimalista reflectante de alta visibilidad inspirado en la estética rave industrial.'),
('prod-18', 'T-Shirt Gothic Chrome', 'Camisetas', 440, '7501018', 'assets/img/tshirt_gothic_chrome.png', 'Chamarra / Playera manga corta holgada con gráfico tipográfico estilo gótico metálico.'),
('prod-19', 'T-Shirt Retro Anime', 'Camisetas', 450, '7501019', 'assets/img/tshirt_retro_anime.png', 'Playera urbana con estampado posterior de ilustración estilo manga/anime noventero.'),
('prod-20', 'T-Shirt Heavy Tie-Dye', 'Camisetas', 470, '7501020', 'assets/img/tshirt_vintage.png', 'Playera pesada en corte boxy con patrón de teñido tie-dye en espiral de tonos carbón.'),
('prod-21', 'T-Shirt Abstract Collage', 'Camisetas', 460, '7501021', 'assets/img/tshirt_graffiti.png', 'Estampado de collage tipográfico y fotográfico abstracto en serigrafía de alta densidad.'),
('prod-22', 'T-Shirt Acid Butterfly', 'Camisetas', 450, '7501022', 'assets/img/tshirt_acid_butterfly.png', 'Diseño vintage acid wash con ilustración psicodélica de mariposa en el panel frontal.'),
('prod-23', 'T-Shirt Distressed Vintage', 'Camisetas', 480, '7501023', 'assets/img/tshirt_vintage.png', 'Acabados deshilachados a mano en cuello y mangas para un look destruido auténtico.'),
('prod-24', 'T-Shirt Cyber Grid', 'Camisetas', 490, '7501024', 'assets/img/tshirt_techno_grid.png', 'Playera minimalista con gráfico de cuadrícula vectorial en tonos neón reactivos a luz UV.'),
('prod-25', 'T-Shirt Skull & Bones', 'Camisetas', 480, '7501025', 'assets/img/tshirt_vintage.png', 'Estampado clásico skate de calavera y huesos cruzados con efecto desgastado retro.'),
('prod-26', 'T-Shirt Graffiti Tag', 'Camisetas', 430, '7501026', 'assets/img/tshirt_graffiti.png', 'Firma de estilo graffiti C&Tees estampada en el pecho con pintura puff en relieve.'),
('prod-27', 'T-Shirt Vintage Rocker', 'Camisetas', 460, '7501027', 'assets/img/tshirt_vintage_rocker.png', 'Playera conmemorativa inspirada en los posters de giras de bandas de rock clásico de los 70s.'),
('prod-28', 'T-Shirt Futuristic Utility', 'Camisetas', 490, '7501028', 'assets/img/tshirt_utility.png', 'Playera táctica con bolsillo de ripstop impermeable en el pecho y hebilla de liberación rápida.'),
('prod-29', 'T-Shirt Retro California', 'Camisetas', 420, '7501029', 'assets/img/tshirt_white.png', 'Estilo playero retro con franjas de colores cálidos al pecho en algodón ultra-suave.'),
('prod-30', 'T-Shirt Core Basic Earth', 'Camisetas', 380, '7501030', 'assets/img/tshirt_white.png', 'Playera esencial de corte regular y tacto de melocotón ideal para combinar en capas.')
ON CONFLICT (id) DO NOTHING;

-- 6. INSERCIÓN DEL USUARIO ADMINISTRADOR INICIAL
INSERT INTO ct_usuarios (usuario, nombre, contrasena) VALUES
('admin', 'Alessandro Vázquez', '12345')
ON CONFLICT (usuario) DO NOTHING;
