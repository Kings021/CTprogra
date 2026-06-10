// data.js - Adaptador asíncrono para base de datos híbrida (Vercel KV Cloud / LocalStorage Fallback)

const PRODUCTOS_INICIALES = [
  {
    id: "prod-1",
    nombre: "T-Shirt Oversized Vintage",
    categoria: "Camisetas",
    precio: 450,
    codigoBarras: "7501001",
    imagen: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
    descripcion: "Camiseta de corte oversized en algodón pesado de 240g con lavado vintage ácido negro."
  },
  {
    id: "prod-2",
    nombre: "T-Shirt Minimalist White",
    categoria: "Camisetas",
    precio: 390,
    codigoBarras: "7501002",
    imagen: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=80",
    descripcion: "Camiseta blanca de algodón orgánico, cuello cerrado y bordado minimalista C&Tees en el pecho."
  },
  {
    id: "prod-3",
    nombre: "Pants Cargo Streetwear",
    categoria: "Pants",
    precio: 890,
    codigoBarras: "7501003",
    imagen: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop&q=80",
    descripcion: "Pantalón cargo de gabardina con múltiples bolsillos y correas de ajuste táctico estilo techwear."
  },
  {
    id: "prod-4",
    nombre: "Joggers Techwear Black",
    categoria: "Pants",
    precio: 790,
    codigoBarras: "7501004",
    imagen: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=500&auto=format&fit=crop&q=80",
    descripcion: "Joggers ajustados repelentes al agua con cierres termosellados y tobilleras elásticas premium."
  },
  {
    id: "prod-5",
    nombre: "Retro Bomber Jacket",
    categoria: "Chamarras",
    precio: 1250,
    codigoBarras: "7501005",
    imagen: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80",
    descripcion: "Chamarra bomber satinada con forro acolchado naranja, parches bordados y fit holgado."
  },
  {
    id: "prod-6",
    nombre: "Denim Distressed Jacket",
    categoria: "Chamarras",
    precio: 1100,
    codigoBarras: "7501006",
    imagen: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80",
    descripcion: "Chamarra de mezclilla gruesa con desgastados hechos a mano y botones metálicos grabados."
  },
  {
    id: "prod-7",
    nombre: "Gorra Snapback Street",
    categoria: "Gorras",
    precio: 350,
    codigoBarras: "7501007",
    imagen: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop&q=80",
    descripcion: "Gorra estructurada de 6 paneles con visera plana y broche ajustable clásico de alta resistencia."
  },
  {
    id: "prod-8",
    nombre: "Beanie Neon Coral",
    categoria: "Gorras",
    precio: 290,
    codigoBarras: "7501008",
    imagen: "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=500&auto=format&fit=crop&q=80",
    descripcion: "Gorro tejido de punto acrílico de alta densidad en tono acento coral brillante C&Tees."
  },
  {
    id: "prod-9",
    nombre: "Shorts Athletic Mesh",
    categoria: "Shorts",
    precio: 420,
    codigoBarras: "7501009",
    imagen: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=80",
    descripcion: "Shorts deportivos de malla transpirable con jareta de contraste y logotipo reflectivo."
  },
  {
    id: "prod-10",
    nombre: "Shorts Cargo Utility",
    categoria: "Shorts",
    precio: 550,
    codigoBarras: "7501010",
    imagen: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=80",
    descripcion: "Shorts de corte relajado tipo cargo en tejido de sarga resistente con cinturón integrado."
  },
  {
    id: "prod-11",
    nombre: "Hoodie Pastel Peach",
    categoria: "Sudaderas",
    precio: 950,
    codigoBarras: "7501011",
    imagen: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80",
    descripcion: "Sudadera con capucha en felpa francesa color durazno pastel, gorro de doble capa sin cordones."
  },
  {
    id: "prod-12",
    nombre: "Crewneck Graphic Knit",
    categoria: "Sudaderas",
    precio: 850,
    codigoBarras: "7501012",
    imagen: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80",
    descripcion: "Sudadera de cuello redondo con tejido jacquard gráfico experimental en blanco y negro."
  }
];

const DB = {
  // Inicialización de la base de datos híbrida
  async init() {
    try {
      // Intentar comprobar e inicializar productos
      const productos = await this.getProductos();
      if (productos.length === 0) {
        await this.guardarAlmacen("ct_productos", PRODUCTOS_INICIALES);
      }

      // Intentar comprobar e inicializar usuarios
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

      // Intentar comprobar e inicializar ventas
      const ventas = await this.getVentas();
      if (ventas === null) {
        await this.guardarAlmacen("ct_ventas", []);
      }
    } catch (e) {
      console.warn("Error inicializando base de datos en la nube. Fallback local activado:", e);
      // Inicializar localStorage como contingencia síncrona
      if (!localStorage.getItem("ct_productos")) {
        localStorage.setItem("ct_productos", JSON.stringify(PRODUCTOS_INICIALES));
      }
      if (!localStorage.getItem("ct_usuarios")) {
        localStorage.setItem("ct_usuarios", JSON.stringify([{ nombre: "Alessandro Vázquez", usuario: "admin", contrasena: "12345" }]));
      }
      if (!localStorage.getItem("ct_ventas")) {
        localStorage.setItem("ct_ventas", JSON.stringify([]));
      }
    }
  },

  // Helper asíncrono para obtener del servidor o de localStorage
  async obtenerAlmacen(key) {
    try {
      const response = await fetch(`/api/db?key=${key}`);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const data = await response.json();
      
      // Sincronizar localmente como copia de seguridad
      if (data !== null) {
        localStorage.setItem(key, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn(`[DB WARNING] Falló conexión a la nube para '${key}'. Usando LocalStorage:`, error);
    }
    
    // Fallback LocalStorage
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : null;
  },

  // Helper asíncrono para guardar en el servidor y en localStorage
  async guardarAlmacen(key, data) {
    // Sincronizar en LocalStorage siempre
    localStorage.setItem(key, JSON.stringify(data));

    try {
      const response = await fetch(`/api/db?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return true;
    } catch (error) {
      console.warn(`[DB WARNING] Falló guardado en la nube para '${key}'. Sincronizado solo localmente:`, error);
      return false;
    }
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

  // Manejo de Sesión Activa (Esta siempre es local en el navegador por seguridad y persistencia de pestaña)
  setSesionActiva(usuarioInfo) {
    localStorage.setItem("ct_sesion_activa", JSON.stringify(usuarioInfo));
  },

  getSesionActiva() {
    const sesion = localStorage.getItem("ct_sesion_activa");
    return sesion ? JSON.parse(sesion) : null;
  },

  eliminarSesion() {
    localStorage.removeItem("ct_sesion_activa");
  }
};

// Inicializar DB al cargar
DB.init();
