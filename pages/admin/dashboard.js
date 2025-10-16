import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Papa from 'papaparse';

export default function AdminDashboard() {
  const router = useRouter();
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [resetNum, setResetNum] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sessionStr = localStorage.getItem('admin_session');
    if (!sessionStr) {
      router.replace('/admin');
    }
  }, [router]);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setStatusMsg(null);
    setErrorMsg(null);
    setLoadingUpload(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function(results) {
        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: results.data })
          });
          const data = await res.json();
          if (data.error) {
            setErrorMsg(data.error);
          } else {
            setStatusMsg(data.message);
          }
        } catch (err) {
          setErrorMsg('Error al cargar la base de datos.');
        } finally {
          setLoadingUpload(false);
        }
      },
      error: function(err) {
        setErrorMsg('Error al parsear el archivo CSV.');
        setLoadingUpload(false);
      }
    });
  }

  async function handleReset(e) {
    e.preventDefault();
    setLoadingReset(true);
    setStatusMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/reset-constancias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num: resetNum || null })
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setStatusMsg(data.message);
      }
    } catch (err) {
      setErrorMsg('Error al reiniciar las constancias.');
    } finally {
      setLoadingReset(false);
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1>Panel de administración</h1>
      <section style={{ marginBottom: '2rem' }}>
        <h2>Cargar o actualizar base de datos</h2>
        <p>Sube un archivo CSV con los campos: num_colegiado,nombre,estado,pagado_hasta,congreso_pagado_hasta,seguro_pagado_hasta,email,constancias_disponibles.</p>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        {loadingUpload && <p>Cargando archivo...</p>}
      </section>
      <section style={{ marginBottom: '2rem' }}>
        <h2>Reiniciar constancias disponibles</h2>
        <form onSubmit={handleReset}>
          <label>Número de colegiado (deja vacío para reiniciar a todos)</label>
          <input type="text" value={resetNum} onChange={(e) => setResetNum(e.target.value)} placeholder="Número de colegiado" />
          <button type="submit" disabled={loadingReset}>{loadingReset ? 'Reiniciando...' : 'Reiniciar'}</button>
        </form>
      </section>
      {statusMsg && <p style={{ color: 'green' }}>{statusMsg}</p>}
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      <p><a href="/">Volver al inicio</a></p>
    </div>
  );
}