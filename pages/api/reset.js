import { supabaseAdmin } from '../../lib/supabaseAdmin';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { num } = req.body || {};
  if (!num) {
    return res.status(400).json({ error: 'Número de colegiado es requerido.' });
  }
  // Find user by colegiado
  const { data, error } = await supabaseAdmin
    .from('colegiados')
    .select('num_colegiado, nombre, email')
    .eq('num_colegiado', num)
    .maybeSingle();
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al consultar la base de datos.' });
  }
  if (!data) {
    // Respond with generic message to avoid enumeration
    return res.json({ message: 'Si el colegiado existe, se enviará una contraseña al correo registrado.' });
  }
  // Generate random password
  const newPassword = crypto.randomBytes(5).toString('base64');
  const hashed = await bcrypt.hash(newPassword, 10);
  // Update password in database
  const { error: updError } = await supabaseAdmin
    .from('colegiados')
    .update({ password_hash: hashed })
    .eq('num_colegiado', num);
  if (updError) {
    console.error(updError);
    return res.status(500).json({ error: 'No se pudo actualizar la contraseña.' });
  }
  // Send email
  const host = process.env.MAIL_SERVER_HOST;
  const port = parseInt(process.env.MAIL_SERVER_PORT || '587', 10);
  const user = process.env.MAIL_SERVER_USER;
  const pass = process.env.MAIL_SERVER_PASS;
  const from = process.env.MAIL_FROM;
  if (host && user && pass && data.email) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass }
    });
    try {
      await transporter.sendMail({
        from,
        to: data.email,
        subject: 'Reinicio de contraseña del sistema de colegiados',
        text: `Hola ${data.nombre},\n\nSe ha generado una nueva contraseña para tu usuario en el sistema de colegiados.\n\nNúmero de colegiado: ${data.num_colegiado}\nNueva contraseña: ${newPassword}\n\nTe recomendamos iniciar sesión y cambiar esta contraseña.\n\nSaludos,\nColegio de Psicólogos de Guatemala`
      });
    } catch (mailErr) {
      console.error('Error al enviar correo', mailErr);
      // Continue without failing; email may not be configured
    }
  }
  return res.json({ message: 'Se ha enviado una nueva contraseña al correo registrado.' });
}