import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format, addMonths, parseISO, isAfter } from 'date-fns';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certMsg, setCertMsg] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Retrieve session from localStorage
    if (typeof window === 'undefined') return;
    const sessionStr = localStorage.getItem('session');
    if (!sessionStr) {
      router.replace('/login');
      return;
    }
    const sess = JSON.parse(sessionStr);
    setUser(sess);
    // Fetch profile details
    fetchProfile(sess.num_colegiado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile(num) {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile?num=${encodeURIComponent(num)}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setProfile(data);
      }
    } catch (err) {
      setError('No se pudo obtener el perfil.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!profile || downloading) return;
    setDownloading(true);
    setCertMsg(null);
    try {
      const res = await fetch('/api/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num: profile.num_colegiado })
      });
      if (res.status === 400) {
        const data = await res.json();
        setCertMsg(data.error);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `constancia_${profile.num_colegiado}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      // refresh profile to update available constancias
      fetchProfile(profile.num_colegiado);
    } catch (err) {
      setCertMsg('Error al generar la constancia.');
    } finally {
      setDownloading(false);
    }
  }

  function isColegiadoVigente() {
    if (!profile) return false;
    if (profile.estado !== 'activo') return false;
    try {
      const pagadoHasta = parseISO(profile.pagado_hasta);
      const vigenciaFin = addMonths(pagadoHasta, 3);
      return isAfter(vigenciaFin, new Date());
    } catch (err) {
      return false;
    }
  }

  if (loading) {
    return <p style={{ padding: '2rem' }}>Cargando...</p>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => router.push('/login')}>Volver</button>
      </div>
    );
  }

  if (!profile) return null;

  const vigente = isColegiadoVigente();
  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1>Bienvenido(a) {profile.nombre}</h1>
      <p><strong>Número de Colegiado:</strong> {profile.num_colegiado}</p>
      <p><strong>Estado:</strong> {profile.estado}</p>
      <p><strong>Pagado hasta:</strong> {profile.pagado_hasta ? format(new Date(profile.pagado_hasta), 'yyyy-MM-dd') : 'N/A'}</p>
      <p><strong>Congreso pagado hasta:</strong> {profile.congreso_pagado_hasta || 'N/A'}</p>
      <p><strong>Seguro pagado hasta:</strong> {profile.seguro_pagado_hasta || 'N/A'}</p>
      <p><strong>Constancias disponibles:</strong> {profile.constancias_disponibles}</p>
      {vigente ? (
        <div>
          <button onClick={handleDownload} disabled={downloading || profile.constancias_disponibles <= 0}>
            {downloading ? 'Generando...' : 'Descargar constancia PDF'}
          </button>
          {profile.constancias_disponibles <= 0 && <p style={{ color: 'red', marginTop: '0.5rem' }}>Has alcanzado el límite de descargas. Contacta al administrador.</p>}
        </div>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: 'red' }}>No tienes tus cuotas al día.</p>
          <ul>
            <li>Pago de colegiación hasta: {profile.pagado_hasta || 'N/A'}</li>
            <li>Pago de congreso anual hasta: {profile.congreso_pagado_hasta || 'N/A'}</li>
            <li>Pago de seguro hasta: {profile.seguro_pagado_hasta || 'N/A'}</li>
          </ul>
        </div>
      )}
      {certMsg && <p style={{ color: profile.constancias_disponibles > 0 ? 'red' : 'green', marginTop: '1rem' }}>{certMsg}</p>}
      <p style={{ marginTop: '1rem' }}>
        <a href="/">Cerrar sesión</a>
      </p>
    </div>
  );
}