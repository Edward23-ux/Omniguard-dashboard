'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { AdminContext } from './AdminContext';
import { AdminSidebar } from './AdminSidebar';
import { getUiStyles } from './admin.styles';

const THEME_STORAGE_KEY = 'omniguard-admin-theme';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [usuario, setUsuario] = useState<any>(null);
    const [tema, setTema] = useState<'dark' | 'light'>('dark');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        const guardado = localStorage.getItem(THEME_STORAGE_KEY);
        if (guardado === 'dark' || guardado === 'light') {
            setTema(guardado);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTema('light');
        }
    }, []);

    useEffect(() => {
        if (mounted) localStorage.setItem(THEME_STORAGE_KEY, tema);
    }, [tema, mounted]);

    useEffect(() => {
        const session = localStorage.getItem('dashboard_session');
        if (!session) {
            router.push('/');
            return;
        }
        const sessionData = JSON.parse(session);
        if (sessionData.expira < Date.now()) {
            localStorage.removeItem('dashboard_session');
            router.push('/');
            return;
        }
        if (sessionData.rol !== 'admin') {
            router.push('/dashboard');
            return;
        }
        setUsuario(sessionData);
    }, [router]);

    const cerrarSesion = () => {
        localStorage.removeItem('dashboard_session');
        router.push('/');
    };

    const modoClaro = tema === 'light';
    const ui = getUiStyles(modoClaro);

    if (!mounted || !usuario) {
        return (
            <div style={{
                padding: '40px',
                textAlign: 'center',
                color: modoClaro ? '#10233D' : '#FFFFFF',
                backgroundColor: modoClaro ? '#EDF3FA' : '#0D0D0D',
                minHeight: '100vh',
            }}>
                Cargando...
            </div>
        );
    }

    return (
        <AdminContext.Provider value={{ usuario, tema, setTema, modoClaro, ui, cerrarSesion }}>
            <div style={{
                display: 'flex',
                height: '100vh',          // antes: minHeight: '100vh'
                overflow: 'hidden',        // evita que el contenedor padre crezca
                backgroundImage: ui.appBackground,
                backgroundColor: modoClaro ? '#EDF3FA' : '#0D0D0D',
                color: ui.text,
            }}>
                <Toaster position="top-right" />
                <AdminSidebar />
                <main style={{
                    flex: 1,
                    minWidth: 0,
                    height: '100%',          // ocupa exactamente el alto del contenedor
                    overflowY: 'auto',       // el scroll queda contenido aquí
                }}>
                    {children}
                </main>
            </div>
        </AdminContext.Provider>
    );
}