import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { format } from 'date-fns';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { num } = req.body || {};
  if (!num) {
    return res.status(400).json({ error: 'Número de colegiado requerido' });
  }
  // Fetch the colegiado from DB
  const { data, error } = await supabaseAdmin
    .from('colegiados')
    .select('num_colegiado,nombre,estado,pagado_hasta,constancias_disponibles')
    .eq('num_colegiado', num)
    .maybeSingle();
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al consultar la base de datos.' });
  }
  if (!data) {
    return res.status(404).json({ error: 'Colegiado no encontrado.' });
  }
  // Check status and payments
  if (data.estado !== 'activo') {
    return res.status(400).json({ error: 'El colegiado no está activo.' });
  }
  // Validate vigencia: pagado hasta + 3 meses >= hoy
  if (!data.pagado_hasta) {
    return res.status(400).json({ error: 'No hay información de pagos.' });
  }
  const pagadoDate = new Date(data.pagado_hasta);
  const vigenciaDate = new Date(pagadoDate);
  vigenciaDate.setMonth(vigenciaDate.getMonth() + 3);
  if (vigenciaDate < new Date()) {
    return res.status(400).json({ error: 'El colegiado no tiene pagos vigentes.' });
  }
  if (data.constancias_disponibles <= 0) {
    return res.status(400).json({ error: 'Límite de constancias alcanzado.' });
  }
  // Generate PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size in points
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const title = 'Constancia de Colegiado Activo';
  const issueDate = format(new Date(), 'yyyy-MM-dd');
  const lines = [];
  lines.push(`Colegio de Psicólogos de Guatemala`);
  lines.push('');
  lines.push(title);
  lines.push('');
  lines.push(`Se hace constar que ${data.nombre}, con número de colegiado ${data.num_colegiado},`);
  lines.push(`se encuentra registrado como colegiado activo del Colegio de Psicólogos de Guatemala.`);
  lines.push(`Su colegiación se encuentra pagada hasta el ${data.pagado_hasta}.`);
  lines.push('');
  lines.push(`Esta constancia se emite el día ${issueDate}.`);
  lines.push('');
  lines.push('Atentamente,');
  lines.push('');
  lines.push('Junta Directiva');
  lines.push('Colegio de Psicólogos de Guatemala');
  // Write text lines
  let y = height - 80;
  const fontSize = 12;
  for (const line of lines) {
    page.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= fontSize + 6;
  }
  const pdfBytes = await pdfDoc.save();
  // Decrease constancias_disponibles
  const { error: updError } = await supabaseAdmin
    .from('colegiados')
    .update({ constancias_disponibles: data.constancias_disponibles - 1 })
    .eq('num_colegiado', num);
  if (updError) {
    console.error(updError);
    // continue; do not prevent sending the PDF
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="constancia_${data.num_colegiado}.pdf"`);
  res.send(Buffer.from(pdfBytes));
}