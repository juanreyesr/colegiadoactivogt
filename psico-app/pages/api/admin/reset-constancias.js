import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { num } = req.body || {};
  try {
    let error;
    if (num) {
      const result = await supabaseAdmin
        .from('colegiados')
        .update({ constancias_disponibles: 2 })
        .eq('num_colegiado', num);
      error = result.error;
    } else {
      const result = await supabaseAdmin
        .from('colegiados')
        .update({ constancias_disponibles: 2 });
      error = result.error;
    }
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'No se pudo reiniciar las constancias.' });
    }
    return res.json({ message: num ? 'Constancias reiniciadas para el colegiado.' : 'Constancias reiniciadas para todos los colegiados.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error inesperado.' });
  }
}