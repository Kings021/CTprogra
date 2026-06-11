// data.js - Adaptador para base de datos híbrida (Supabase Cloud / LocalStorage Fallback)

// CONFIGURACIÓN DE SUPABASE: Reemplaza con tus claves del panel de Supabase
const SUPABASE_URL = "https://albthufcvjftgffhauec.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYnRodWZjdmpmdGdmZmhhdWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNTUxMjYsImV4cCI6MjA5NjYzMTEyNn0.yA-Wa1S7YC7lUD6_FQrPgFqRlgiOR4b9VK9jhXZqGHA";

let supabaseClient = null;

if (SUPABASE_URL !== "YOUR_SUPABASE_URL" && SUPABASE_KEY !== "YOUR_SUPABASE_ANON_KEY") {
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.error("Error al inicializar el cliente de Supabase:", err);
  }
}

const PRODUCTOS_INICIALES = [
  {
    id: "prod-1",
    nombre: "T-Shirt Oversized Vintage",
    categoria: "Camisetas",
    precio: 450,
    codigoBarras: "7501001",
    imagen: "assets/img/tshirt_vintage.png",
    descripcion: "Camiseta de corte oversized en algodón pesado de 240g con lavado vintage ácido negro.",
    colores: [
      { nombre: "Negro Ácido", hex: "#1a1a1a" },
      { nombre: "Gris Lavado", hex: "#7c7c6e" },
      { nombre: "Hueso", hex: "#e8e0d0" },
      { nombre: "Verde Militar", hex: "#4a5240" }
    ]
  },
  {
    id: "prod-2",
    nombre: "T-Shirt Minimalist White",
    categoria: "Camisetas",
    precio: 390,
    codigoBarras: "7501002",
    imagen: "assets/img/tshirt_white.png",
    descripcion: "Camiseta blanca de algodón orgánico, cuello cerrado y bordado minimalista C&Tees en el pecho.",
    colores: [
      { nombre: "Blanco Óptico", hex: "#f5f5f5" },
      { nombre: "Arena", hex: "#d4c5a9" },
      { nombre: "Azul Niebla", hex: "#b0c4d8" },
      { nombre: "Rosa Palo", hex: "#e8c4b8" }
    ]
  },
  {
    id: "prod-3",
    nombre: "Pants Cargo Streetwear",
    categoria: "Pants",
    precio: 890,
    codigoBarras: "7501003",
    imagen: "assets/img/pants_cargo.png",
    descripcion: "Pantalón cargo de gabardina con múltiples bolsillos y correas de ajuste táctico estilo techwear.",
    colores: [
      { nombre: "Negro Táctico", hex: "#0d0d0d" },
      { nombre: "Caqui", hex: "#8b7355" },
      { nombre: "Gris Carbón", hex: "#3a3a3a" },
      { nombre: "Oliva Oscuro", hex: "#3b3a28" }
    ]
  },
  {
    id: "prod-4",
    nombre: "Joggers Techwear Black",
    categoria: "Pants",
    precio: 790,
    codigoBarras: "7501004",
    imagen: "assets/img/joggers_tech.png",
    descripcion: "Joggers ajustados repelentes al agua con cierres termosellados y tobilleras elásticas premium.",
    colores: [
      { nombre: "Negro Total", hex: "#080808" },
      { nombre: "Grafito", hex: "#2e2e2e" },
      { nombre: "Azul Medianoche", hex: "#1a1f3a" }
    ]
  },
  {
    id: "prod-5",
    nombre: "Retro Bomber Jacket",
    categoria: "Chamarras",
    precio: 1250,
    codigoBarras: "7501005",
    imagen: "assets/img/bomber_retro.png",
    descripcion: "Chamarra bomber satinada con forro acolchado naranja, parches bordados y fit holgado.",
    colores: [
      { nombre: "Negro Satín", hex: "#111111" },
      { nombre: "Naranja Vintage", hex: "#c8581a" },
      { nombre: "Borgoña", hex: "#6b1a2a" },
      { nombre: "Verde Botella", hex: "#2d4a2d" }
    ]
  },
  {
    id: "prod-6",
    nombre: "Denim Distressed Jacket",
    categoria: "Chamarras",
    precio: 1100,
    codigoBarras: "7501006",
    imagen: "assets/img/jacket_denim.png",
    descripcion: "Chamarra de mezclilla gruesa con desgastados hechos a mano y botones metálicos grabados.",
    colores: [
      { nombre: "Índigo", hex: "#2a3f6f" },
      { nombre: "Azul Claro", hex: "#4a7aaa" },
      { nombre: "Azul Oscuro", hex: "#1a2a4a" },
      { nombre: "Gris Denim", hex: "#5a6a7a" }
    ]
  },
  {
    id: "prod-7",
    nombre: "Gorra Snapback Street",
    categoria: "Gorras",
    precio: 350,
    codigoBarras: "7501007",
    imagen: "assets/img/cap_snapback.png",
    descripcion: "Gorra estructurada de 6 paneles con visera plana y broche ajustable clásico de alta resistencia.",
    colores: [
      { nombre: "Negro", hex: "#111111" },
      { nombre: "Rojo Street", hex: "#c0392b" },
      { nombre: "Blanco", hex: "#f0f0f0" },
      { nombre: "Navy", hex: "#1a2a4a" },
      { nombre: "Camo", hex: "#4a5240" }
    ]
  },
  {
    id: "prod-8",
    nombre: "Beanie Neon Coral",
    categoria: "Gorras",
    precio: 290,
    codigoBarras: "7501008",
    imagen: "assets/img/beanie_coral.png",
    descripcion: "Gorro tejido de punto acrílico de alta densidad en tono acento coral brillante C&Tees.",
    colores: [
      { nombre: "Coral Neón", hex: "#ff6b6b" },
      { nombre: "Amarillo Neon", hex: "#f9e54b" },
      { nombre: "Menta", hex: "#5ddfb0" },
      { nombre: "Lila", hex: "#b48fde" }
    ]
  },
  {
    id: "prod-9",
    nombre: "Shorts Athletic Mesh",
    categoria: "Shorts",
    precio: 420,
    codigoBarras: "7501009",
    imagen: "assets/img/shorts_mesh.png",
    descripcion: "Shorts deportivos de malla transpirable con jareta de contraste y logotipo reflectivo.",
    colores: [
      { nombre: "Negro", hex: "#111111" },
      { nombre: "Gris Sport", hex: "#808080" },
      { nombre: "Azul Royal", hex: "#2255cc" },
      { nombre: "Rojo Fire", hex: "#cc2222" }
    ]
  },
  {
    id: "prod-10",
    nombre: "Shorts Cargo Utility",
    categoria: "Shorts",
    precio: 550,
    codigoBarras: "7501010",
    imagen: "assets/img/shorts_cargo.png",
    descripcion: "Shorts de corte relajado tipo cargo en tejido de sarga resistente con cinturón integrado.",
    colores: [
      { nombre: "Caqui", hex: "#9b8b6a" },
      { nombre: "Negro", hex: "#111111" },
      { nombre: "Oliva", hex: "#5a6040" },
      { nombre: "Gris", hex: "#5a5a5a" }
    ]
  },
  {
    id: "prod-11",
    nombre: "Hoodie Pastel Peach",
    categoria: "Sudaderas",
    precio: 950,
    codigoBarras: "7501011",
    imagen: "assets/img/hoodie_peach.png",
    descripcion: "Sudadera con capucha en felpa francesa color durazno pastel, gorro de doble capa sin cordones.",
    colores: [
      { nombre: "Durazno", hex: "#f4a67d" },
      { nombre: "Lavanda", hex: "#c3a8d1" },
      { nombre: "Celeste", hex: "#a8d1e7" },
      { nombre: "Menta", hex: "#a8d8b9" },
      { nombre: "Lemon", hex: "#f0e68c" }
    ]
  },
  {
    id: "prod-12",
    nombre: "Crewneck Graphic Knit",
    categoria: "Sudaderas",
    precio: 850,
    codigoBarras: "7501012",
    imagen: "assets/img/crewneck_graphic.png",
    descripcion: "Sudadera de cuello redondo con tejido jacquard gráfico experimental en blanco y negro.",
    colores: [
      { nombre: "Blanco/Negro", hex: "#f0f0f0" },
      { nombre: "Negro/Blanco", hex: "#1a1a1a" },
      { nombre: "Gris Marl", hex: "#9a9a8a" }
    ]
  },
  {
    id: "prod-13",
    nombre: "T-Shirt Cyberpunk Tokyo",
    categoria: "Camisetas",
    precio: 480,
    codigoBarras: "7501013",
    imagen: "assets/img/tshirt_cyberpunk.png",
    descripcion: "Camiseta gráfica pesada con impresión digital frontal inspirada en la tipografía urbana de Tokio.",
    colores: [
      { nombre: "Negro Cyber", hex: "#111111" },
      { nombre: "Naranja Neón", hex: "#ff5e00" },
      { nombre: "Violeta", hex: "#8a2be2" }
    ]
  },
  {
    id: "prod-14",
    nombre: "T-Shirt Boxy Acid Wash",
    categoria: "Camisetas",
    precio: 460,
    codigoBarras: "7501014",
    imagen: "assets/img/tshirt_boxy_acid.png",
    descripcion: "Corte boxy fit pesado con teñido artesanal acid wash y costuras reforzadas a contraste.",
    colores: [
      { nombre: "Gris Ácido", hex: "#444444" },
      { nombre: "Azul Deslavado", hex: "#4b6584" }
    ]
  },
  {
    id: "prod-15",
    nombre: "T-Shirt Minimal Rose",
    categoria: "Camisetas",
    precio: 430,
    codigoBarras: "7501015",
    imagen: "assets/img/tshirt_minimal_rose.png",
    descripcion: "Silueta clásica de C&Tees con una rosa bordada en hilo de seda de alta densidad en el pecho.",
    colores: [
      { nombre: "Hueso", hex: "#f7f1e3" },
      { nombre: "Rosa Pálido", hex: "#ffb8b8" },
      { nombre: "Negro Mate", hex: "#222222" }
    ]
  },
  {
    id: "prod-16",
    nombre: "T-Shirt Skate Retro 90s",
    categoria: "Camisetas",
    precio: 470,
    codigoBarras: "7501016",
    imagen: "assets/img/tshirt_skate_retro.png",
    descripcion: "Prenda de algodón premium inspirada en la época de oro del skate y hip-hop de los 90s.",
    colores: [
      { nombre: "Mostaza Retro", hex: "#cc8e35" },
      { nombre: "Verde Pino", hex: "#218c74" },
      { nombre: "Azul Marino", hex: "#0c2461" }
    ]
  },
  {
    id: "prod-17",
    nombre: "T-Shirt Techno Industrial",
    categoria: "Camisetas",
    precio: 490,
    codigoBarras: "7501017",
    imagen: "assets/img/tshirt_techno_grid.png",
    descripcion: "Camiseta de ajuste regular con diseño minimalista reflectante de alta visibilidad inspirado en la estética rave industrial.",
    colores: [
      { nombre: "Gris Reflectivo", hex: "#b2bec3" },
      { nombre: "Negro Carbón", hex: "#2d3436" }
    ]
  },
  {
    id: "prod-18",
    nombre: "T-Shirt Gothic Chrome",
    categoria: "Camisetas",
    precio: 440,
    codigoBarras: "7501018",
    imagen: "assets/img/tshirt_gothic_chrome.png",
    descripcion: "Chamarra / Playera manga corta holgada con gráfico tipográfico estilo gótico metálico.",
    colores: [
      { nombre: "Plata Cromo", hex: "#dfe6e9" },
      { nombre: "Negro Profundo", hex: "#000000" }
    ]
  },
  {
    id: "prod-19",
    nombre: "T-Shirt Retro Anime",
    categoria: "Camisetas",
    precio: 450,
    codigoBarras: "7501019",
    imagen: "assets/img/tshirt_retro_anime.png",
    descripcion: "Playera urbana con estampado posterior de ilustración estilo manga/anime noventero.",
    colores: [
      { nombre: "Negro", hex: "#1e272e" },
      { nombre: "Blanco", hex: "#ffffff" },
      { nombre: "Lila Pastel", hex: "#d2dae2" }
    ]
  },
  {
    id: "prod-20",
    nombre: "T-Shirt Heavy Tie-Dye",
    categoria: "Camisetas",
    precio: 470,
    codigoBarras: "7501020",
    imagen: "assets/img/tshirt_heavy_tiedye.png",
    descripcion: "Playera pesada en corte boxy con patrón de teñido tie-dye en espiral de tonos carbón.",
    colores: [
      { nombre: "Gris Tie-Dye", hex: "#718093" },
      { nombre: "Azul Tie-Dye", hex: "#273c75" }
    ]
  },
  {
    id: "prod-21",
    nombre: "T-Shirt Abstract Collage",
    categoria: "Camisetas",
    precio: 460,
    codigoBarras: "7501021",
    imagen: "assets/img/tshirt_graffiti.png",
    descripcion: "Estampado de collage tipográfico y fotográfico abstracto en serigrafía de alta densidad.",
    colores: [
      { nombre: "Blanco Off-White", hex: "#f5f6fa" },
      { nombre: "Gris Carbón", hex: "#2f3640" }
    ]
  },
  {
    id: "prod-22",
    nombre: "T-Shirt Acid Butterfly",
    categoria: "Camisetas",
    precio: 450,
    codigoBarras: "7501022",
    imagen: "assets/img/tshirt_acid_butterfly.png",
    descripcion: "Diseño vintage acid wash con ilustración psicodélica de mariposa en el panel frontal.",
    colores: [
      { nombre: "Negro Lavado", hex: "#353b48" },
      { nombre: "Verde Ácido", hex: "#44bd32" }
    ]
  },
  {
    id: "prod-23",
    nombre: "T-Shirt Distressed Vintage",
    categoria: "Camisetas",
    precio: 480,
    codigoBarras: "7501023",
    imagen: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80",
    descripcion: "Acabados deshilachados a mano en cuello y mangas para un look destruido auténtico.",
    colores: [
      { nombre: "Gris Destruido", hex: "#7f8c8d" },
      { nombre: "Hueso", hex: "#f5f6fa" }
    ]
  },
  {
    id: "prod-24",
    nombre: "T-Shirt Cyber Grid",
    categoria: "Camisetas",
    precio: 490,
    codigoBarras: "7501024",
    imagen: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&auto=format&fit=crop&q=80",
    descripcion: "Playera minimalista con gráfico de cuadrícula vectorial en tonos neón reactivos a luz UV.",
    colores: [
      { nombre: "Negro", hex: "#1e272e" },
      { nombre: "Verde UV", hex: "#00d2d3" }
    ]
  },
  {
    id: "prod-25",
    nombre: "T-Shirt Skull & Bones",
    categoria: "Camisetas",
    precio: 480,
    codigoBarras: "7501025",
    imagen: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80",
    descripcion: "Estampado clásico skate de calavera y huesos cruzados con efecto desgastado retro.",
    colores: [
      { nombre: "Negro Ácido", hex: "#2c3e50" },
      { nombre: "Crema Hueso", hex: "#f1f2f6" }
    ]
  },
  {
    id: "prod-26",
    nombre: "T-Shirt Graffiti Tag",
    categoria: "Camisetas",
    precio: 430,
    codigoBarras: "7501026",
    imagen: "https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500&auto=format&fit=crop&q=80",
    descripcion: "Firma de estilo graffiti C&Tees estampada en el pecho con pintura puff en relieve.",
    colores: [
      { nombre: "Blanco", hex: "#ffffff" },
      { nombre: "Amarillo Tag", hex: "#f1c40f" },
      { nombre: "Negro", hex: "#2c3e50" }
    ]
  },
  {
    id: "prod-27",
    nombre: "T-Shirt Vintage Rocker",
    categoria: "Camisetas",
    precio: 460,
    codigoBarras: "7501027",
    imagen: "assets/img/tshirt_vintage_rocker.png",
    descripcion: "Playera conmemorativa inspirada en los posters de giras de bandas de rock clásico de los 70s.",
    colores: [
      { nombre: "Carbón Lavado", hex: "#34495e" },
      { nombre: "Azul Denim", hex: "#2980b9" }
    ]
  },
  {
    id: "prod-28",
    nombre: "T-Shirt Futuristic Utility",
    categoria: "Camisetas",
    precio: 490,
    codigoBarras: "7501028",
    imagen: "assets/img/tshirt_utility.png",
    descripcion: "Playera táctica con bolsillo de ripstop impermeable en el pecho y hebilla de liberación rápida.",
    colores: [
      { nombre: "Negro Táctico", hex: "#1e272e" },
      { nombre: "Verde Oliva", hex: "#27ae60" }
    ]
  },
  {
    id: "prod-29",
    nombre: "T-Shirt Retro California",
    categoria: "Camisetas",
    precio: 420,
    codigoBarras: "7501029",
    imagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
    descripcion: "Estilo playero retro con franjas de colores cálidos al pecho en algodón ultra-suave.",
    colores: [
      { nombre: "Crema Arena", hex: "#f5f6fa" },
      { nombre: "Azul Celeste", hex: "#00a8ff" },
      { nombre: "Amarillo Sol", hex: "#fbc531" }
    ]
  },
  {
    id: "prod-30",
    nombre: "T-Shirt Core Basic Earth",
    categoria: "Camisetas",
    precio: 380,
    codigoBarras: "7501030",
    imagen: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500&auto=format&fit=crop&q=80",
    descripcion: "Playera esencial de corte regular y tacto de melocotón ideal para combinar en capas.",
    colores: [
      { nombre: "Café Tierra", hex: "#8c7ae6" },
      { nombre: "Arena Fina", hex: "#e1b12c" },
      { nombre: "Hueso Natural", hex: "#f5f6fa" }
    ]
  }
];

const DB = {
  // Inicialización de la base de datos híbrida
  async init() {
    try {
      if (supabaseClient) {
        // Intentar autoinicializar productos en Supabase si la tabla está vacía
        const productos = await this.getProductos();
        if (productos.length === 0) {
          await this.guardarAlmacen("ct_productos", PRODUCTOS_INICIALES);
        } else {
          // Fusionar nuevos productos iniciales a Supabase
          let updated = false;
          let merged = [...productos];

          PRODUCTOS_INICIALES.forEach(initP => {
            if (!merged.some(p => p.id === initP.id)) {
              merged.push(initP);
              updated = true;
            }
          });

          // Sincronizar imágenes iniciales locales en Supabase si ya existe la tabla
          const updatedProds = merged.map(p => {
            const matchingInicial = PRODUCTOS_INICIALES.find(initP => initP.id === p.id);
            if (matchingInicial) {
              if (p.imagen !== matchingInicial.imagen && !p.imagen.startsWith("data:")) {
                p.imagen = matchingInicial.imagen;
                updated = true;
              }
              if (JSON.stringify(p.colores) !== JSON.stringify(matchingInicial.colores)) {
                p.colores = matchingInicial.colores;
                updated = true;
              }
            }
            return p;
          });

          if (updated) {
            await this.guardarAlmacen("ct_productos", updatedProds);
          }
        }

        // Intentar autoinicializar usuarios en Supabase si la tabla está vacía
        const usuarios = await this.getUsuarios();
        if (usuarios.length === 0) {
          const usuarioDemo = [
            {
              nombre: "Alessandro Vázquez",
              usuario: "admin",
              contrasena: "12345"
            }
          ];
          await this.guardarAlmacen("ct_usuarios", usuarioDemo);
        }
      }
    } catch (e) {
      console.warn("Error al inicializar la base de datos en Supabase. Se utilizará LocalStorage:", e);
    }

    // Inicializar localStorage como contingencia o actualizar si hay nuevos productos iniciales
    const storedProds = localStorage.getItem("ct_productos");
    if (!storedProds) {
      localStorage.setItem("ct_productos", JSON.stringify(PRODUCTOS_INICIALES));
    } else {
      try {
        let prods = JSON.parse(storedProds);
        let updated = false;

        // Agregar nuevos productos iniciales que falten
        PRODUCTOS_INICIALES.forEach(initP => {
          if (!prods.some(p => p.id === initP.id)) {
            prods.push(initP);
            updated = true;
          }
        });

        // Sincronizar imágenes y colores por si acaso
        prods = prods.map(p => {
          const matchingInicial = PRODUCTOS_INICIALES.find(initP => initP.id === p.id);
          if (matchingInicial) {
            if (p.imagen !== matchingInicial.imagen && !p.imagen.startsWith("data:")) {
              p.imagen = matchingInicial.imagen;
              updated = true;
            }
            if (JSON.stringify(p.colores) !== JSON.stringify(matchingInicial.colores)) {
              p.colores = matchingInicial.colores;
              updated = true;
            }
          }
          return p;
        });

        if (updated) {
          localStorage.setItem("ct_productos", JSON.stringify(prods));
          if (supabaseClient) {
            await this.guardarAlmacen("ct_productos", prods);
          }
        }
      } catch (err) {
        console.error("Error al actualizar productos iniciales en localStorage:", err);
      }
    }
    if (!localStorage.getItem("ct_usuarios")) {
      localStorage.setItem("ct_usuarios", JSON.stringify([{ nombre: "Alessandro Vázquez", usuario: "admin", contrasena: "12345" }]));
    }
    if (!localStorage.getItem("ct_ventas")) {
      localStorage.setItem("ct_ventas", JSON.stringify([]));
    }
  },

  // Helper asíncrono para obtener registros desde Supabase o LocalStorage
  async obtenerAlmacen(key) {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from(key).select('*');
        if (error) throw error;

        if (data !== null) {
          // Sincronizar en local storage para respaldo offline
          localStorage.setItem(key, JSON.stringify(data));
          return data;
        }
      } catch (error) {
        console.warn(`[SUPABASE] Error al leer la tabla '${key}'. Usando respaldo LocalStorage:`, error);
      }
    }

    // Contingencia LocalStorage
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  },

  // Helper asíncrono para guardar/actualizar registros en Supabase y LocalStorage
  async guardarAlmacen(key, data) {
    // Sincronizar localmente siempre
    localStorage.setItem(key, JSON.stringify(data));

    if (supabaseClient) {
      try {
        let error = null;
        if (key === "ct_ventas" && data.length === 0) {
          // Si vacían el historial, vaciar la tabla en Supabase
          const res = await supabaseClient.from(key).delete().neq('id', 'placeholder_for_clear');
          error = res.error;
        } else {
          // Guardado masivo eficiente mediante UPSERT
          const res = await supabaseClient.from(key).upsert(data);
          error = res.error;
        }

        if (error) throw error;
        return true;
      } catch (error) {
        console.warn(`[SUPABASE] Error al guardar en la tabla '${key}'. Guardado localmente:`, error);
        return false;
      }
    }
    return false;
  },

  // --- MÉTODOS DE CONSULTA Y ESCRITURA PÚBLICOS ---

  // Obtener productos
  async getProductos() {
    const prods = await this.obtenerAlmacen("ct_productos");
    return prods || [];
  },

  // Guardar un producto nuevo (Admin)
  async guardarProducto(producto) {
    const productos = await this.getProductos();
    productos.push(producto);
    await this.guardarAlmacen("ct_productos", productos);
    return productos;
  },

  // Obtener usuarios
  async getUsuarios() {
    const users = await this.obtenerAlmacen("ct_usuarios");
    return users || [];
  },

  // Registrar un nuevo usuario
  async registrarUsuario(usuario) {
    const usuarios = await this.getUsuarios();
    usuarios.push(usuario);
    await this.guardarAlmacen("ct_usuarios", usuarios);
    return true;
  },

  // Obtener ventas
  async getVentas() {
    const ventas = await this.obtenerAlmacen("ct_ventas");
    return ventas || [];
  },

  // Registrar una nueva venta
  async registrarVenta(venta) {
    const ventas = await this.getVentas();
    ventas.push(venta);
    await this.guardarAlmacen("ct_ventas", ventas);
    return true;
  },

  // Limpiar historial
  async limpiarHistorial() {
    await this.guardarAlmacen("ct_ventas", []);
    return true;
  },

  // Manejo de Sesión Activa (Local en navegador)
  setSesionActiva(usuarioInfo) {
    localStorage.setItem("ct_sesion_activa", JSON.stringify(usuarioInfo));
  },

  getSesionActiva() {
    const sesion = localStorage.getItem("ct_sesion_activa");
    return sesion ? JSON.parse(sesion) : null;
  },

  getLookbookUrls() {
    const defaults = {
      hero: "assets/img/tshirt_vintage.png",
      camisetas: "assets/img/tshirt_white.png",
      sudaderas: "assets/img/hoodie_peach.png",
      pants: "assets/img/joggers_tech.png",
      chamarras: "assets/img/bomber_retro.png",
      gorras: "assets/img/cap_snapback.png",
      shorts: "assets/img/shorts_cargo.png"
    };
    const stored = localStorage.getItem("ct_lookbook_urls");
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  },

  saveLookbookUrls(urls) {
    localStorage.setItem("ct_lookbook_urls", JSON.stringify(urls));
    return true;
  },

  async updateProductImage(productId, newUrl) {
    const productos = await this.getProductos();
    const prod = productos.find(p => p.id === productId);
    if (prod) {
      prod.imagen = newUrl;
      await this.guardarAlmacen("ct_productos", productos);
      return true;
    }
    return false;
  },

  eliminarSesion() {
    localStorage.removeItem("ct_sesion_activa");
  }
};

// Inicializar DB al cargar
DB.init();
