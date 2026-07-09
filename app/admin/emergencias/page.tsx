'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminContext } from '../AdminContext';
import { useEmergencias, Emergencia } from './useEmergencias';
import { colorEstado, iconoTipo, colorEtiquetaIA, FILTROS_ESTADO, labelFiltro } from './constants';

export default function EmergenciasPage() {
    const { ui, modoClaro } = useAdminContext();
    const { emergencias, companias, isLoading, reasignandoId, reasignarCompania } = useEmergencias();
    const [seleccionada, setSeleccionada] = useState<Emergencia | null>(null);
    const [testigosDetalle, setTestigosDetalle] = useState<any[]>([]);
    const [cargandoTestigos, setCargandoTestigos] = useState(false);
    const [filtro, setFiltro] = useState<string>('pendiente');
    const [selectEnFoco, setSelectEnFoco] = useState<string | null>(null);

    const emergenciasFiltradas = emergencias.filter((e) => e.estado === filtro);

    const mostrarReasignar = filtro === 'pendiente';
    const gridColumns = mostrarReasignar
        ? '1.6fr 1.8fr 1.2fr 0.8fr 1fr 1.8fr'
        : '1.6fr 1.8fr 1.2fr 0.8fr 1fr';

    const abrirDetalle = async (emergencia: Emergencia) => {
        setSeleccionada(emergencia);
        setCargandoTestigos(true);
        setTestigosDetalle([]);
        try {
            const { data } = await supabase
                .from('testigos_emergencia')
                .select(`creado_en, usuarios (dni, nombres, apellidos)`)
                .eq('emergencia_id', emergencia.id)
                .order('creado_en', { ascending: true });
            setTestigosDetalle(data || []);
        } finally {
            setCargandoTestigos(false);
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ color: '#E63946', fontSize: '28px', marginBottom: '6px' }}>Emergencias</h1>
                <p style={{ color: ui.mutedText, margin: 0 }}>Visualiza y reasigna las emergencias reportadas.</p>
            </div>

            {/* Filtro por estado */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                flexWrap: 'wrap',
            }}>
                {FILTROS_ESTADO.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        style={{
                            padding: '8px 18px',
                            borderRadius: '20px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: filtro === f ? 800 : 600,
                            backgroundColor: filtro === f ? '#E63946' : ui.chip,
                            color: filtro === f ? 'white' : ui.chipText,
                            transition: 'background-color 160ms ease, color 160ms ease',
                        }}
                    >
                        {labelFiltro[f]}
                    </button>
                ))}
            </div>

            <div style={{
                backgroundColor: ui.panel,
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${ui.border}`,
                boxShadow: modoClaro ? '0 14px 36px rgba(16, 35, 61, 0.06)' : 'none',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: gridColumns,
                    padding: '16px',
                    backgroundColor: ui.surface,
                    borderBottom: `1px solid ${ui.border}`,
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: ui.mutedText,
                }}>
                    <div>TIPO</div>
                    <div>COMPAÑÍA ASIGNADA</div>
                    <div>ESTADO</div>
                    <div>TESTIGOS</div>
                    <div>FECHA</div>
                    {mostrarReasignar && <div>REASIGNAR</div>}
                </div>

                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText }}>Cargando...</div>
                ) : emergenciasFiltradas.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText }}>
                        Sin emergencias en estado "{labelFiltro[filtro]}"
                    </div>
                ) : (
                    emergenciasFiltradas.map((e) => {
                        const enFoco = selectEnFoco === e.id;
                        const reasignandoEsta = reasignandoId === e.id;

                        return (
                            <div
                                key={e.id}
                                onClick={() => abrirDetalle(e)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: gridColumns,
                                    padding: '16px',
                                    borderBottom: `1px solid ${ui.border}`,
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: ui.text }}>
                                    <span>{iconoTipo[e.tipo] || '🚨'}</span> {e.tipo}
                                </div>
                                <div style={{ color: ui.mutedText, fontSize: '13px' }}>
                                    {e.companias_bomberos?.nombre || 'Sin asignar'}
                                </div>
                                <div>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px',
                                        backgroundColor: (colorEstado[e.estado] || '#666') + '22',
                                        color: colorEstado[e.estado] || '#666',
                                    }}>
                                        {e.estado.toUpperCase().replace('_', ' ')}
                                    </span>
                                </div>
                                <div style={{ color: ui.mutedText }}>{e.testigos}</div>
                                <div style={{ color: ui.softerText, fontSize: '12px' }}>
                                    {new Date(e.creado_en).toLocaleDateString('es-PE')}
                                </div>

                                {mostrarReasignar && (
                                    <div onClick={(event) => event.stopPropagation()} style={{ position: 'relative' }}>
                                        <select
                                            value={e.compania_asignada_id || ''}
                                            disabled={reasignandoEsta}
                                            onFocus={() => setSelectEnFoco(e.id)}
                                            onBlur={() => setSelectEnFoco((actual) => (actual === e.id ? null : actual))}
                                            onChange={(event) => reasignarCompania(e.id, event.target.value)}
                                            style={{
                                                width: '100%',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                padding: '10px 32px 10px 12px',
                                                borderRadius: '10px',
                                                border: `1px solid ${enFoco ? '#4361EE' : ui.border}`,
                                                boxShadow: enFoco ? '0 0 0 3px rgba(67, 97, 238, 0.18)' : 'none',
                                                backgroundColor: ui.fieldBackground,
                                                color: ui.text,
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                cursor: reasignandoEsta ? 'not-allowed' : 'pointer',
                                                opacity: reasignandoEsta ? 0.55 : 1,
                                                outline: 'none',
                                                transition: 'border-color 160ms ease, box-shadow 160ms ease, opacity 160ms ease',
                                            }}
                                        >
                                            <option value="" disabled>Seleccionar compañía</option>
                                            {companias.filter((c) => c.activa).map((c) => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                        <span style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            pointerEvents: 'none',
                                            fontSize: '12px',
                                            color: ui.mutedText,
                                        }}>
                                            {reasignandoEsta ? '⏳' : '▾'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal de detalle, similar al dashboard */}
            {seleccionada && (
                <div
                    onClick={() => setSeleccionada(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 5000,
                        backgroundColor: ui.modalBackdrop, backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                    }}
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: 'min(620px, 100%)', maxHeight: '85vh', overflowY: 'auto',
                            background: ui.modalPanel, border: `1px solid ${ui.modalBorder}`,
                            borderRadius: '20px', padding: '28px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: ui.text }}>
                                    {iconoTipo[seleccionada.tipo] || '🚨'} {seleccionada.tipo}
                                </h2>
                                <p style={{ margin: '4px 0 0', color: ui.mutedText, fontSize: '13px' }}>
                                    ID: {seleccionada.id.slice(0, 8)}...
                                </p>
                            </div>
                            <button
                                onClick={() => setSeleccionada(null)}
                                style={{ background: ui.neutralButton, border: 'none', borderRadius: '8px', color: ui.neutralButtonText, width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px' }}
                            >✕</button>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: (colorEstado[seleccionada.estado] || '#666') + '22', color: colorEstado[seleccionada.estado] || '#666' }}>
                                {seleccionada.estado.toUpperCase().replace('_', ' ')}
                            </span>
                            <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: colorEtiquetaIA[seleccionada.etiqueta_ia] }}>
                                {seleccionada.etiqueta_ia === 'aprobado' ? '✅ Aprobado por IA' :
                                    seleccionada.etiqueta_ia === 'revision_manual' ? '⚠️ Revisión manual' : '❌ Rechazado por IA'}
                                {' '}({seleccionada.nivel_confianza_ia}%)
                            </span>
                        </div>

                        <div style={{ backgroundColor: ui.surface, borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `1px solid ${ui.border}` }}>
                            <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 8px' }}>👤 CIUDADANO REPORTANTE</h3>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: ui.text }}>
                                {seleccionada.usuarios?.nombres} {seleccionada.usuarios?.apellidos}
                            </div>
                            <div style={{ color: ui.mutedText, fontSize: '13px', marginTop: '4px' }}>DNI: {seleccionada.usuarios?.dni}</div>
                        </div>

                        <div style={{ backgroundColor: ui.surface, borderRadius: '12px', padding: '16px', marginBottom: '12px', border: `1px solid ${ui.border}` }}>
                            <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 8px' }}>📍 DIRECCIÓN Y COMPAÑÍA</h3>
                            <div style={{ fontSize: '14px', color: ui.text }}>{seleccionada.direccion_aproximada || 'No disponible'}</div>
                            <div style={{ color: ui.mutedText, fontSize: '13px', marginTop: '6px' }}>
                                Compañía asignada: <strong>{seleccionada.companias_bomberos?.nombre || 'Sin asignar'}</strong>
                            </div>
                        </div>

                        <div style={{ backgroundColor: ui.surface, borderRadius: '12px', padding: '16px', border: `1px solid ${ui.border}` }}>
                            <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 8px' }}>
                                👥 TESTIGOS ({seleccionada.testigos})
                            </h3>
                            {cargandoTestigos ? (
                                <div style={{ color: ui.mutedText, fontSize: '13px' }}>Cargando...</div>
                            ) : testigosDetalle.length === 0 ? (
                                <div style={{ color: ui.mutedText, fontSize: '13px' }}>Sin testigos registrados</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {testigosDetalle.map((t, i) => (
                                        <div key={i} style={{ fontSize: '13px', color: ui.text }}>
                                            {t.usuarios?.nombres} {t.usuarios?.apellidos} — <span style={{ color: ui.mutedText }}>{t.usuarios?.dni}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}