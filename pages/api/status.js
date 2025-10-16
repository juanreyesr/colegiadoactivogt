import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const { num } = req.query;
  if (!num) {
    return res.status(400).json({ error: 'Número de colegiado faltante.' });
  }
  const { data, error } = await supabase
    .from('colegiados')
    .select('num_colegiado,nombre,estado')
    .eq('num_colegiado', num)
    .maybeSingle();
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al consultar la base de datos.' });
  }
  if (!data) {
    return res.json({ exists: false });
  }
  return res.json({ exists: true, ...data });
}