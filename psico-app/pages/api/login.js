import { supabase } from '../../lib/supabaseClient';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { num, password } = req.body || {};
  if (!num || !password) {
    return res.status(400).json({ error: 'Número y contraseña son requeridos.' });
  }
  const { data, error } = await supabase
    .from('colegiados')
    .select('*')
    .eq('num_colegiado', num)
    .maybeSingle();
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al consultar la base de datos.' });
  }
  if (!data) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }
  const hash = data.password_hash;
  if (!hash) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }
  const match = await bcrypt.compare(password, hash);
  if (!match) {
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
  }
  // Return only safe fields
  const { num_colegiado, nombre } = data;
  return res.json({ num_colegiado, nombre });
}