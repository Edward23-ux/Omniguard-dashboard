import React from 'react';

export default function VistaVacia({ ui }: { ui: any }) {
    return (
        <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: ui.mutedText,
        }}>
            <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginBottom: '16px', opacity: 0.3 }}
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: ui.text }}>
                OmniGuard Dashboard
            </div>
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
                Selecciona una emergencia para ver los detalles o abre el mapa de calor histórico.
            </div>
        </div>
    );
}