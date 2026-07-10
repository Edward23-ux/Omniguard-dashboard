import React from 'react';

export default function VistaVacia({ ui }: { ui: any }) {
    return (
        <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: ui.mutedText,
        }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛡️</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: ui.text }}>
                OmniGuard Dashboard
            </div>
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
                Selecciona una emergencia para ver los detalles o abre el mapa de calor histórico.
            </div>
        </div>
    );
}