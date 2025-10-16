export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: 'Configuración de administrador no establecida.' });
  }
  if (!password || password !== adminPassword) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }
  // Generate a simple token (not used for server validation, just for client)
  const token = Math.random().toString(36).substring(2);
  res.json({ token });
}