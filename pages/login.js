import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [num, setNum] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num, password })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Store token or user info in local storage
        if (typeof window !== 'undefined') {
          localStorage.setItem('session', JSON.stringify(data));
        }
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="num">Número de Colegiado</label>
        <input id="num" type="text" value={num} onChange={(e) => setNum(e.target.value)} required />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <a href="/reset">¿Olvidaste tu contraseña?</a>
      </p>
      <p>
        <a href="/">Volver</a>
      </p>
    </div>
  );
}