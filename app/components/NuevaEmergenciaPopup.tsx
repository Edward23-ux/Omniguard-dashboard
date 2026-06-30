'use client';

import { useEffect } from 'react';
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

export default function NuevaEmergenciaPopup({ emergencia, onClose, onVerDetalle }: NuevaEmergenciaPopupProps) {
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

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200000,
        backgroundColor: 'rgba(5, 10, 15, 0.72)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(560px, 100%)',
          borderRadius: '24px',
          background: 'linear-gradient(180deg, #171717 0%, #101010 100%)',
          border: '1px solid #2F2F2F',
          boxShadow: '0 28px 80px rgba(0, 0, 0, 0.55)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '22px 22px 16px', borderBottom: '1px solid #262626' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#E6394622',
                border: '1px solid #E6394644',
                fontSize: '24px',
                flexShrink: 0,
              }}
            >
              🚨
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 800, lineHeight: 1.2 }}>
                Nueva emergencia asignada
              </div>
              <div style={{ color: '#A8A8A8', fontSize: '13px', marginTop: '4px' }}>
                Se asignó una emergencia a tu compañía en tiempo real.
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                border: '1px solid #2D2D2D',
                backgroundColor: '#1C1C1C',
                color: '#FFFFFF',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Cerrar popup"
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: '20px 22px 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#151515', border: '1px solid #262626' }}>
              <div style={{ color: '#A8A8A8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Tipo
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>
                {tipo}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#151515', border: '1px solid #262626' }}>
              <div style={{ color: '#A8A8A8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Estado
              </div>
              <div style={{ color: colorEstado[estado] || '#FFFFFF', fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>
                {estado.toUpperCase().replace('_', ' ')}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#151515', border: '1px solid #262626' }}>
              <div style={{ color: '#A8A8A8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Compañía
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>
                {emergencia.companias_bomberos?.nombre || 'Sin asignar'}
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#151515', border: '1px solid #262626' }}>
              <div style={{ color: '#A8A8A8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Confianza IA
              </div>
              <div style={{ color: colorEtiquetaIA[etiquetaIA] || '#FFFFFF', fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>
                {confianza !== null ? `${confianza}%` : 'N/D'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', backgroundColor: '#151515', border: '1px solid #262626' }}>
            <div style={{ color: '#A8A8A8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Reportante
            </div>
            <div style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginTop: '6px' }}>
              {emergencia.usuarios?.nombres || 'Sin nombre'} {emergencia.usuarios?.apellidos || ''}
            </div>
            <div style={{ color: '#A8A8A8', fontSize: '13px', marginTop: '4px' }}>
              DNI: {emergencia.usuarios?.dni || 'N/D'}
            </div>
          </div>

          <div style={{ marginTop: '14px', padding: '14px', borderRadius: '16px', backgroundColor: '#151515', border: '1px solid #262626' }}>
            <div style={{ color: '#A8A8A8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Dirección aproximada
            </div>
            <div style={{ color: '#FFFFFF', fontSize: '14px', marginTop: '6px', lineHeight: 1.5 }}>
              {emergencia.direccion_aproximada || 'No disponible'}
            </div>
            <div style={{ color: '#7D7D7D', fontSize: '12px', marginTop: '10px' }}>
              {formatFecha(emergencia.creado_en)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '18px 22px 22px',
          }}
        >
          <button
            onClick={onVerDetalle}
            style={{
              padding: '11px 16px',
              borderRadius: '12px',
              border: '1px solid #E6394644',
              backgroundColor: '#E63946',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 800,
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