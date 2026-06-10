import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Configurar cabeceras CORS para desarrollo local o peticiones directas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { key } = req.query;

  // Validar claves autorizadas
  if (!key || !['ct_productos', 'ct_usuarios', 'ct_ventas'].includes(key)) {
    return res.status(400).json({ error: 'Clave de base de datos no válida o ausente' });
  }

  try {
    if (req.method === 'GET') {
      const data = await kv.get(key);
      // Retorna los datos. Si es nulo, el frontend inicializará con valores por defecto
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // Vercel parsea req.body como JSON automáticamente
      const data = req.body;
      
      if (data === undefined) {
        return res.status(400).json({ error: 'El cuerpo de la solicitud no puede estar vacío' });
      }

      await kv.set(key, data);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error operando en Vercel KV:', error);
    return res.status(500).json({ error: error.message });
  }
}
