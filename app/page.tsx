'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

const THEME_STORAGE_KEY = 'omniguard-theme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tema, setTema] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const modoClaro = tema === 'light';

  const ui = {
    appBackground: modoClaro
      ? 'radial-gradient(circle at top left, rgba(70, 97, 238, 0.14), transparent 28%), radial-gradient(circle at top right, rgba(230, 57, 70, 0.10), transparent 24%), linear-gradient(180deg, #F7FAFF 0%, #EAF1FA 100%)'
      : 'radial-gradient(circle at top left, rgba(70, 97, 238, 0.16), transparent 28%), radial-gradient(circle at top right, rgba(230, 57, 70, 0.10), transparent 24%), linear-gradient(180deg, #111111 0%, #0D0D0D 100%)',
    text: modoClaro ? '#10233D' : '#FFFFFF',
    mutedText: modoClaro ? '#5F6B7A' : '#AAAAAA',
    softerText: modoClaro ? '#7D8896' : '#666666',
    panel: modoClaro ? '#FFFFFF' : '#1A1A1A',
    surface: modoClaro ? '#F7FAFD' : '#0D0D0D',
    border: modoClaro ? '#D8E2F0' : '#2A2A2A',
    input: modoClaro ? '#EEF4FB' : '#2A2A2A',
    inputBorder: modoClaro ? '#C7D4E3' : '#3A3A3A',
    neutralButton: modoClaro ? '#E7EEF7' : '#2A2A2A',
    neutralButtonText: modoClaro ? '#20324D' : '#AAAAAA',
  };

  useEffect(() => {
    const guardado = localStorage.getItem(THEME_STORAGE_KEY);

    if (guardado === 'dark' || guardado === 'light') {
      setTema(guardado);
    } else {
      setTema(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(THEME_STORAGE_KEY, tema);
  }, [mounted, tema]);

  // Verificar si ya hay sesión guardada
  useEffect(() => {
    const session = localStorage.getItem('dashboard_session');
    if (session) {
      const { rol, expira } = JSON.parse(session);
      if (expira > Date.now()) {
        // Redirigir según el rol
        if (rol === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        localStorage.removeItem('dashboard_session');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Guardar sesión (expira en 8 horas)
        const session = {
          usuarioId: data.usuario.id,
          email: data.usuario.email,
          nombre: data.usuario.nombre,
          rol: data.usuario.rol,
          compania_id: data.usuario.compania_id,
          expira: Date.now() + 8 * 60 * 60 * 1000, // 8 horas
        };
        localStorage.setItem('dashboard_session', JSON.stringify(session));

        toast.success(`Bienvenido ${data.usuario.nombre}`);

        // Redirigir según rol
        if (data.usuario.rol === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EDF3FA',
          color: '#10233D',
          padding: '24px',
        }}
      >
        <div
          style={{
            width: 'min(400px, 100%)',
            borderRadius: '24px',
            border: '1px solid #D8E2F0',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 18px 48px rgba(16, 35, 61, 0.08)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          Cargando interfaz...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: ui.appBackground,
      backgroundColor: modoClaro ? '#EDF3FA' : '#0D0D0D',
      color: ui.text,
      position: 'relative',
    }}>
      <Toaster position="top-right" />

      <button
        type="button"
        onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}
        aria-label={modoClaro ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        title={modoClaro ? 'Modo oscuro' : 'Modo claro'}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          border: `1px solid ${ui.border}`,
          backgroundColor: ui.neutralButton,
          color: ui.neutralButtonText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: modoClaro ? '0 10px 24px rgba(16, 35, 61, 0.08)' : 'none',
          zIndex: 20,
        }}
      >
        {modoClaro ? '🌙' : '☀️'}
      </button>

      <div style={{
        backgroundColor: ui.panel,
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: modoClaro ? '0 18px 48px rgba(16, 35, 61, 0.08)' : '0 8px 32px rgba(0,0,0,0.3)',
        border: `1px solid ${ui.border}`,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#E63946',
            borderRadius: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            marginBottom: '16px',
          }}>
            🛡️
          </div>
          <h1 style={{ color: ui.text, fontSize: '24px', marginBottom: '8px' }}>
            OmniGuard
          </h1>
          <p style={{ color: ui.mutedText, fontSize: '14px' }}>
            Dashboard de Bomberos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: ui.mutedText,
              fontSize: '14px',
              marginBottom: '8px',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: ui.input,
                border: `1px solid ${ui.inputBorder}`,
                borderRadius: '12px',
                color: ui.text,
                fontSize: '14px',
                outline: 'none',
              }}
              placeholder="admin@omniguard.pe"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: ui.mutedText,
              fontSize: '14px',
              marginBottom: '8px',
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: ui.input,
                border: `1px solid ${ui.inputBorder}`,
                borderRadius: '12px',
                color: ui.text,
                fontSize: '14px',
                outline: 'none',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#E63946',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Ingresar al Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}