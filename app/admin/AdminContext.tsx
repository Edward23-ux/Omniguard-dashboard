'use client';

import { createContext, useContext } from 'react';
import { getUiStyles } from './admin.styles';

type AdminContextValue = {
    usuario: any;
    tema: 'dark' | 'light';
    setTema: (tema: 'dark' | 'light') => void;
    modoClaro: boolean;
    ui: ReturnType<typeof getUiStyles>;
    cerrarSesion: () => void;
};

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminContext() {
    const ctx = useContext(AdminContext);
    if (!ctx) {
        throw new Error('useAdminContext debe usarse dentro de <AdminLayout>');
    }
    return ctx;
}