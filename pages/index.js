import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!number) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/status?num=${encodeURIComponent(number)}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: 'Error al consultar el estado.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1>Sistema de Colegiados Activos</h1>
      <p>Consulta el estado de tu colegiado o ingresa para ver tu constancia.</p>
      <label htmlFor="num">Número de Colegiado</label>
      <input
        id="num"
        type="text"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Ingrese su número de colegiado"
      />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={handleCheck} disabled={loading}>Consultar estado</button>
        <button onClick={() => router.push('/login')}>Ingresar</button>
      </div>
      {loading && <p>Consultando...</p>}
      {result && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
          {result.error && <p style={{ color: 'red' }}>{result.error}</p>}
          {result.exists === false && <p>No se encontró un colegiado con ese número.</p>}
          {result.exists && (
            <div>
              <p><strong>Número:</strong> {result.num_colegiado}</p>
              <p><strong>Nombre:</strong> {result.nombre}</p>
              <p><strong>Estado:</strong> {result.estado}</p>
            </div>
          )}
        </div>
      )}
      {/* Enlace para acceso de administrador */}
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        <a href="/admin" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Acceso administrador
        </a>
      </p>
      {/* Enlace para crear usuario o restablecer contraseña */}
      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
        <a href="/reset" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          Crear usuario / Olvidé mi contraseña
        </a>
      </p>
    </div>
  );
}