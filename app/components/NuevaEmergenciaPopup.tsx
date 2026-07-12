'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type EmergenciaPopupData = {
  id: string;
  tipo?: string;
  estado?: string;
  etiqueta_ia?: string;
  nivel_confianza_ia?: number;
  direccion_aproximada?: string | null;
  creado_en?: string;
  companias_bomberos?: {
    nombre?: string | null;
    telefono?: string | null;
  } | null;
  usuarios?: {
    dni?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
  } | null;
};

interface NuevaEmergenciaPopupProps {
  emergencia: EmergenciaPopupData | null;
  onClose: () => void;
  onVerDetalle: () => void;
  tema?: 'light' | 'dark';
}

const colorEstado: Record<string, string> = {
  pendiente: '#FFC300',
  en_proceso: '#4361EE',
  culminado: '#2DC653',
  falsa_alarma: '#666666',
};

const colorEtiquetaIA: Record<string, string> = {
  aprobado: '#2DC653',
  revision_manual: '#FFC300',
  rechazado: '#E63946',
  pendiente: '#666666',
};

function formatFecha(fecha?: string) {
  if (!fecha) return 'Sin fecha';

  const dt = new Date(fecha);
  if (Number.isNaN(dt.getTime())) return 'Sin fecha';

  return `${dt.toLocaleDateString('es-PE')} ${dt.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function NuevaEmergenciaPopup({ emergencia, onClose, onVerDetalle, tema = 'dark' }: NuevaEmergenciaPopupProps) {
  const [hoveredBtn, setHoveredBtn] = useState<'close' | 'ver' | null>(null);

  useEffect(() => {
    if (!emergencia) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [emergencia]);

  if (!emergencia || typeof document === 'undefined') return null;

  const tipo = emergencia.tipo || 'Emergencia';
  const estado = emergencia.estado || 'pendiente';
  const etiquetaIA = emergencia.etiqueta_ia || 'pendiente';
  const confianza = typeof emergencia.nivel_confianza_ia === 'number' ? emergencia.nivel_confianza_ia : null;

  const modoClaro = tema === 'light';
  const colors = {
    overlay: modoClaro ? 'rgba(15, 23, 42, 0.45)' : 'rgba(5, 10, 15, 0.72)',
    background: modoClaro ? '#FFFFFF' : '#141414',
    border: modoClaro ? '#D8E2F0' : '#2A2A2A',
    borderLight: modoClaro ? '#EEF4FB' : '#222222',
    borderButton: modoClaro ? '#D8E2F0' : '#2D2D2D',
    buttonBg: modoClaro ? '#E7EEF7' : '#1C1C1C',
    buttonText: modoClaro ? '#20324D' : '#FFFFFF',
    cardBg: modoClaro ? '#F8FAFD' : '#1B1B1B',
    text: modoClaro ? '#10233D' : '#FFFFFF',
    mutedText: modoClaro ? '#5F6B7A' : '#A0A0A0',
    softerText: modoClaro ? '#7D8896' : '#777777',
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200000,
        backgroundColor: colors.overlay,
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(500px, 100%)',
          borderRadius: '20px',
          background: colors.background,
          border: `1px solid ${colors.border}`,
          boxShadow: modoClaro ? '0 28px 80px rgba(16, 35, 61, 0.12)' : '0 28px 80px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 20px 14px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(230, 57, 70, 0.09)',
                color: '#E63946',
                flexShrink: 0,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: colors.text, fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Nueva emergencia asignada
              </div>
              <div style={{ color: colors.mutedText, fontSize: '11.5px', marginTop: '2px', fontWeight: 500 }}>
                Asignación en tiempo real a tu compañía.
              </div>
            </div>

            <button
              onClick={onClose}
              onMouseEnter={() => setHoveredBtn('close')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                backgroundColor: hoveredBtn === 'close' ? (modoClaro ? 'rgba(16, 35, 61, 0.04)' : 'rgba(255, 255, 255, 0.05)') : 'transparent',
                color: colors.text,
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                transition: 'all 0.15s ease-in-out',
              }}
              aria-label="Cerrar popup"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Info Blocks */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div style={{ color: colors.mutedText, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tipo
              </div>
              <div style={{ color: colors.text, fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
                {tipo}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div style={{ color: colors.mutedText, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estado
              </div>
              <div style={{ color: colorEstado[estado] || colors.text, fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
                {estado.toUpperCase().replace('_', ' ')}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div style={{ color: colors.mutedText, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Compañía
              </div>
              <div style={{ color: colors.text, fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
                {emergencia.companias_bomberos?.nombre || 'Sin asignar'}
              </div>
            </div>

            <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
              <div style={{ color: colors.mutedText, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dirección aproximada
              </div>
              <div style={{ color: colors.text, fontSize: '13.5px', fontWeight: 500, marginTop: '4px', lineHeight: 1.4 }}>
                {emergencia.direccion_aproximada || 'No disponible'}
              </div>
              <div style={{ color: colors.softerText, fontSize: '11px', marginTop: '6px' }}>
                {formatFecha(emergencia.creado_en)}
              </div>
            </div>
          </div>

          <div style={{ padding: '10px 12px', borderRadius: '10px', backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
            <div style={{ color: colors.mutedText, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reportante
            </div>
            <div style={{ color: colors.text, fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>
              {emergencia.usuarios?.nombres || 'Sin nombre'} {emergencia.usuarios?.apellidos || ''}
            </div>
            <div style={{ color: colors.mutedText, fontSize: '12px', marginTop: '2px' }}>
              DNI: {emergencia.usuarios?.dni || 'N/D'}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '12px 20px 20px',
            borderTop: `1px solid ${colors.borderLight}`,
            backgroundColor: colors.cardBg,
          }}
        >
          <button
            onClick={onVerDetalle}
            onMouseEnter={() => setHoveredBtn('ver')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#E63946',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: hoveredBtn === 'ver' ? '0 6px 16px rgba(230, 57, 70, 0.25)' : 'none',
              transform: hoveredBtn === 'ver' ? 'translateY(-1px)' : 'none',
              transition: 'all 0.15s ease-in-out',
            }}
          >
            Ver en dashboard
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}