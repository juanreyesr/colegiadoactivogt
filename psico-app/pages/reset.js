import { useState } from 'react';

export default function ResetPassword() {
  const [num, setNum] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(data.message || 'Si el número existe, se ha enviado una nueva contraseña a su correo.');
      }
    } catch (err) {
      setError('Error al solicitar el reinicio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1>Reiniciar contraseña</h1>
      <p>Si es la primera vez que ingresas, coloca tu número de colegiado y presiona el botón para generar una nueva contraseña.</p>
      <form onSubmit={handleReset}>
        <label htmlFor="num">Número de Colegiado</label>
        <input id="num" type="text" value={num} onChange={(e) => setNum(e.target.value)} required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Reiniciar contraseña'}</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <a href="/login">Volver al login</a>
      </p>
    </div>
  );
}