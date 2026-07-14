'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminContext } from './AdminContext';

// Iconos SVG Minimalistas
function EmergenciasIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

function CompaniasIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <line x1="9" y1="22" x2="9" y2="16" />
            <line x1="15" y1="22" x2="15" y2="16" />
            <path d="M9 16h6" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M8 10h.01" />
            <path d="M16 10h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
        </svg>
    );
}

function AgregarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5" />
            <path d="M9 18H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v3" />
            <path d="M12 18v4" />
            <path d="M9 22V9" />
            <path d="M19 16v6" />
            <path d="M16 19h6" />
            <path d="M6 6h.01" />
            <path d="M9 6h.01" />
        </svg>
    );
}

function UsuariosIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

const NAV_ITEMS = [
    { href: '/admin/emergencias', label: 'Emergencias', Icon: EmergenciasIcon },
    { href: '/admin/companias', label: 'Compañías', Icon: CompaniasIcon },
    { href: '/admin/agregar-compania', label: 'Agregar compañía', Icon: AgregarIcon },
    { href: '/admin/usuarios', label: 'Usuarios', Icon: UsuariosIcon },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { usuario, tema, setTema, ui, modoClaro, cerrarSesion } = useAdminContext();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredButton, setHoveredButton] = useState<'theme' | 'logout' | null>(null);

    return (
        <div style={{
            width: '260px',
            minWidth: '260px',
            height: '100%',
            backgroundColor: ui.panel,
            borderRight: `1px solid ${ui.border}`,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: modoClaro ? '0 16px 40px rgba(16, 35, 61, 0.04)' : 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
            {/* Header / Brand */}
            <div style={{
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(230, 57, 70, 0.09)',
                    color: '#E63946',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease',
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: ui.text, letterSpacing: '-0.02em' }}>
                        OmniGuard
                    </div>
                    <div style={{ color: ui.mutedText, fontSize: '11px', fontWeight: 500 }}>
                        Centro de Control
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                {NAV_ITEMS.map((item, index) => {
                    const activo = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                    const isHovered = hoveredIndex === index;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: activo ? 600 : 500,
                                fontSize: '13.5px',
                                color: activo
                                    ? '#E63946'
                                    : (isHovered ? ui.text : ui.mutedText),
                                backgroundColor: activo
                                    ? (modoClaro ? 'rgba(230, 57, 70, 0.06)' : 'rgba(230, 57, 70, 0.12)')
                                    : (isHovered ? (modoClaro ? 'rgba(16, 35, 61, 0.03)' : 'rgba(255, 255, 255, 0.03)') : 'transparent'),
                                borderLeft: `3px solid ${activo ? '#E63946' : 'transparent'}`,
                                transition: 'all 0.18s ease-in-out',
                            }}
                        >
                            <span style={{
                                display: 'flex',
                                color: activo ? '#E63946' : (isHovered ? ui.text : ui.softerText),
                                transition: 'color 0.18s ease-in-out',
                            }}>
                                <item.Icon />
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Profile & Controls */}
            <div style={{
                padding: '20px 16px',
                borderTop: `1px solid ${ui.border}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
            }}>
                {/* User Card */}
                {usuario && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '4px',
                    }}>
                        <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: modoClaro ? 'rgba(16, 35, 61, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: ui.text,
                            textTransform: 'uppercase',
                            border: `1px solid ${ui.border}`,
                        }}>
                            {usuario.nombre ? usuario.nombre.charAt(0) : 'A'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{
                                fontWeight: 600,
                                fontSize: '13px',
                                color: ui.text,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {usuario.nombre}
                            </div>
                        </div>
                    </div>
                )}

                {/* Control Actions (Side-by-side) */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}
                        onMouseEnter={() => setHoveredButton('theme')}
                        onMouseLeave={() => setHoveredButton(null)}
                        title={modoClaro ? 'Activar modo oscuro' : 'Activar modo claro'}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: hoveredButton === 'theme'
                                ? (modoClaro ? 'rgba(16, 35, 61, 0.04)' : 'rgba(255, 255, 255, 0.05)')
                                : 'transparent',
                            border: `1px solid ${ui.border}`,
                            borderRadius: '6px',
                            color: ui.text,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                            transition: 'all 0.15s ease-in-out',
                        }}
                    >
                        {modoClaro ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" />
                            </svg>
                        )}
                        <span>Tema</span>
                    </button>

                    <button
                        onClick={cerrarSesion}
                        onMouseEnter={() => setHoveredButton('logout')}
                        onMouseLeave={() => setHoveredButton(null)}
                        title="Cerrar sesión"
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: hoveredButton === 'logout'
                                ? 'rgba(230, 57, 70, 0.08)'
                                : 'transparent',
                            border: hoveredButton === 'logout'
                                ? '1px solid rgba(230, 57, 70, 0.2)'
                                : `1px solid ${ui.border}`,
                            borderRadius: '6px',
                            color: hoveredButton === 'logout' ? '#E63946' : ui.mutedText,
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                            transition: 'all 0.15s ease-in-out',
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Salir</span>
                    </button>
                </div>
            </div>
        </div>
    );
}