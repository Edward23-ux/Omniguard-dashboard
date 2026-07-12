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

  // Interactive UI States
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const [hoveredButton, setHoveredButton] = useState<'theme' | 'submit' | null>(null);

  const router = useRouter();
  const modoClaro = tema === 'light';

  const ui = {
    appBackground: modoClaro
      ? 'radial-gradient(circle at top left, rgba(70, 97, 238, 0.12), transparent 32%), radial-gradient(circle at top right, rgba(230, 57, 70, 0.08), transparent 28%), linear-gradient(180deg, #F7FAFF 0%, #EAF1FA 100%)'
      : 'radial-gradient(circle at top left, rgba(70, 97, 238, 0.14), transparent 32%), radial-gradient(circle at top right, rgba(230, 57, 70, 0.08), transparent 28%), linear-gradient(180deg, #111111 0%, #0D0D0D 100%)',
    text: modoClaro ? '#10233D' : '#FFFFFF',
    mutedText: modoClaro ? '#5F6B7A' : '#AAAAAA',
    softerText: modoClaro ? '#7D8896' : '#666666',
    panel: modoClaro ? '#FFFFFF' : '#161616',
    surface: modoClaro ? '#F7FAFD' : '#0D0D0D',
    border: modoClaro ? '#D8E2F0' : '#2A2A2A',
    input: modoClaro ? '#FFFFFF' : '#111111',
    inputBorder: modoClaro ? '#D8E2F0' : '#2C2C2C',
    inputBorderFocus: '#E63946',
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
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            width: 'min(400px, 100%)',
            borderRadius: '20px',
            border: '1px solid #D8E2F0',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 18px 48px rgba(16, 35, 61, 0.04)',
            padding: '40px',
            textAlign: 'center',
            fontWeight: 500,
            fontSize: '14px',
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
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <Toaster position="top-right" />

      {/* Modern Theme Switcher Button */}
      <button
        type="button"
        onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}
        onMouseEnter={() => setHoveredButton('theme')}
        onMouseLeave={() => setHoveredButton(null)}
        aria-label={modoClaro ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
        title={modoClaro ? 'Modo oscuro' : 'Modo claro'}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: `1px solid ${ui.border}`,
          backgroundColor: hoveredButton === 'theme'
            ? (modoClaro ? 'rgba(16, 35, 61, 0.04)' : 'rgba(255, 255, 255, 0.05)')
            : ui.panel,
          color: ui.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: modoClaro ? '0 10px 24px rgba(16, 35, 61, 0.04)' : 'none',
          zIndex: 20,
          transition: 'all 0.15s ease-in-out',
        }}
      >
        {modoClaro ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" />
          </svg>
        )}
      </button>

      {/* Login Card */}
      <div style={{
        backgroundColor: ui.panel,
        padding: '48px 40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: modoClaro ? '0 20px 50px rgba(16, 35, 61, 0.06)' : '0 16px 40px rgba(0, 0, 0, 0.4)',
        border: `1px solid ${ui.border}`,
      }}>

        {/* Logo and Identity */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: 'rgba(230, 57, 70, 0.09)',
            color: '#E63946',
            borderRadius: '14px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 style={{ color: ui.text, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
            OmniGuard
          </h1>
          <p style={{ color: ui.mutedText, fontSize: '13.5px', fontWeight: 500, margin: 0 }}>
            Dashboard de Bomberos
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>

          {/* Email Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: ui.mutedText,
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Correo Electrónico
            </label>
            <input
              type="text"
              inputMode="email"
              value={email}
              onKeyDown={(e) => {
                if (e.key === '@' || e.key === '.') {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const input = e.target;
                const val = input.value;
                const parts = val.split('@');
                const rawUsername = parts[0] || '';
                const username = rawUsername.replace(/[@.]/g, '');
                
                let selectionStart = input.selectionStart || 0;
                if (selectionStart > username.length) {
                  selectionStart = username.length;
                }

                if (username.length > 0) {
                  setEmail(username + '@omniguard.pe');
                  requestAnimationFrame(() => {
                    input.setSelectionRange(selectionStart, selectionStart);
                  });
                } else {
                  setEmail('');
                }
              }}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: ui.input,
                border: `1px solid ${focusedInput === 'email' ? ui.inputBorderFocus : ui.inputBorder}`,
                boxShadow: focusedInput === 'email' ? '0 0 0 3px rgba(230, 57, 70, 0.12)' : 'none',
                borderRadius: '10px',
                color: ui.text,
                fontSize: '14px',
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.15s ease-in-out',
              }}
              placeholder="admin@omniguard.pe"
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block',
              color: ui.mutedText,
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: ui.input,
                border: `1px solid ${focusedInput === 'password' ? ui.inputBorderFocus : ui.inputBorder}`,
                boxShadow: focusedInput === 'password' ? '0 0 0 3px rgba(230, 57, 70, 0.12)' : 'none',
                borderRadius: '10px',
                color: ui.text,
                fontSize: '14px',
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.15s ease-in-out',
              }}
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => setHoveredButton('submit')}
            onMouseLeave={() => setHoveredButton(null)}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#E63946',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transform: hoveredButton === 'submit' && !isLoading ? 'translateY(-1px)' : 'none',
              boxShadow: hoveredButton === 'submit' && !isLoading
                ? '0 10px 24px rgba(230, 57, 70, 0.25)'
                : 'none',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Ingresar al Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}