import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { rows } = req.body || {};
  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: 'Formato de datos inválido.' });
  }
  // Prepare data for upsert. Convert empty strings to null.
  const prepared = rows.map((r) => {
    return {
      num_colegiado: r.num_colegiado?.toString()?.trim(),
      nombre: r.nombre?.trim() || null,
      estado: r.estado?.trim()?.toLowerCase() || 'inactivo',
      pagado_hasta: r.pagado_hasta || null,
      congreso_pagado_hasta: r.congreso_pagado_hasta || null,
      seguro_pagado_hasta: r.seguro_pagado_hasta || null,
      email: r.email?.trim() || null,
      constancias_disponibles: r.constancias_disponibles ? parseInt(r.constancias_disponibles, 10) : 2
    };
  });
  try {
    const { error } = await supabaseAdmin
      .from('colegiados')
      .upsert(prepared, { onConflict: 'num_colegiado' });
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'No se pudo actualizar la base de datos.' });
    }
    return res.json({ message: 'Base de datos actualizada correctamente.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ocurrió un error inesperado.' });
  }
}