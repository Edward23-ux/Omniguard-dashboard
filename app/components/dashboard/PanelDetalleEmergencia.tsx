import React from 'react';
import MapaEmergencia from '../MapaEmergencia';
import { iconoTipo, colorEstado, colorEtiquetaIA } from '@/app/dashboard/dashboard.styles'; // Ajusta la ruta si es necesario

// Función auxiliar local para los botones
function hexToRgba(hex: string, alpha: number) {
    const limpio = hex.replace('#', '');
    const value = limpio.length === 3 ? limpio.split('').map((char) => char + char).join('') : limpio;
    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function PanelDetalleEmergencia({
    seleccionada,
    ui,
    tema,
    accionesPermitidas,
    estadoActualSeleccionado,
    sinUnidades,
    actualizando,
    actualizarEstado,
    ACCIONES_EMERGENCIA,
    formatFecha,
    verTestigos
}: any) {
    const modoClaro = tema === 'light';
    const [verEvidencia, setVerEvidencia] = React.useState(false);
    const [errorImagen, setErrorImagen] = React.useState(false);

    return (
        <div style={{ padding: '32px' }}>
            {/* HEADER con título + estado + ACCIONES RÁPIDAS */}
            <div style={{
                backgroundColor: ui.panel,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                border: `1px solid ${ui.border}`,
                boxShadow: modoClaro ? '0 16px 40px rgba(16, 35, 61, 0.06)' : 'none',
            }}>
                <span style={{ fontSize: '40px' }}>{iconoTipo[seleccionada.tipo] || '🚨'}</span>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: ui.text }}>
                        {seleccionada.tipo}
                    </h1>
                    <p style={{ color: ui.mutedText, margin: '4px 0 0', fontSize: '12px' }}>
                        ID: {seleccionada.id.slice(0, 8)}...
                    </p>
                </div>

                {/* Badge estado */}
                <div style={{
                    padding: '8px 16px', borderRadius: '20px',
                    backgroundColor: colorEstado[seleccionada.estado] + '22',
                    color: colorEstado[seleccionada.estado],
                    fontWeight: 'bold', fontSize: '14px',
                }}>
                    {seleccionada.estado.toUpperCase().replace('_', ' ')}
                </div>

                {/* Acciones rápidas */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {ACCIONES_EMERGENCIA.map((accion: any) => {
                        const esAccionPermitida = accionesPermitidas.includes(accion.estado);
                        const esEstadoActual = estadoActualSeleccionado === accion.estado;
                        const bloqueadoPorUnidades = sinUnidades && accion.estado === 'en_proceso';
                        const deshabilitado = actualizando || esEstadoActual || !esAccionPermitida || bloqueadoPorUnidades;

                        const backgroundColor = deshabilitado
                            ? (modoClaro ? 'rgba(16, 35, 61, 0.05)' : 'rgba(255, 255, 255, 0.04)')
                            : hexToRgba(accion.color, modoClaro ? 0.16 : 0.2);
                        const textColor = deshabilitado
                            ? hexToRgba(accion.color, modoClaro ? 0.62 : 0.72)
                            : accion.color;
                        const borderColor = deshabilitado
                            ? hexToRgba(accion.color, modoClaro ? 0.18 : 0.24)
                            : hexToRgba(accion.color, modoClaro ? 0.35 : 0.42);
                        const boxShadow = deshabilitado
                            ? 'none'
                            : `0 10px 24px ${hexToRgba(accion.color, modoClaro ? 0.15 : 0.18)}`;

                        return (
                            <button
                                key={accion.estado}
                                onClick={() => actualizarEstado(seleccionada.id, accion.estado)}
                                disabled={deshabilitado}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    border: `1px solid ${borderColor}`,
                                    cursor: deshabilitado ? 'not-allowed' : 'pointer',
                                    backgroundColor,
                                    color: textColor,
                                    fontWeight: 800,
                                    fontSize: '13px',
                                    opacity: deshabilitado ? 0.56 : 1,
                                    boxShadow,
                                    transition: 'all 180ms ease',
                                }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', verticalAlign: 'middle' }}>
                                    <accion.Icon />
                                    <span>{accion.label}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── SECCIÓN DE DETALLE DE DOS COLUMNAS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-[16px] mb-[16px] items-stretch">
                <div className="flex flex-col gap-[16px]">
                    {/* Dirección */}
                    <div style={{ backgroundColor: ui.panel, borderRadius: '16px', padding: '14px 16px', border: `1px solid ${ui.border}` }}>
                        <h3 style={{ color: ui.mutedText, fontSize: '11px', fontWeight: 700, margin: '0 0 6px 0' }}>DIRECCIÓN APROXIMADA</h3>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: ui.text }}>{seleccionada.direccion_aproximada || 'No disponible'}</div>
                        <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '4px' }}>{seleccionada.creado_en ? formatFecha(seleccionada.creado_en) : '-'}</div>
                    </div>

                    {/* Testigos */}
                    <div style={{ backgroundColor: ui.panel, borderRadius: '16px', padding: '14px 16px', border: `1px solid ${ui.border}` }}>
                        <h3 style={{ color: ui.mutedText, fontSize: '11px', fontWeight: 700, margin: '0 0 6px 0' }}>TESTIGOS</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#E63946', lineHeight: 1 }}>{seleccionada.testigos}</div>
                                <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '4px' }}>usuario(s) reportando</div>
                            </div>
                            <button
                                onClick={() => verTestigos(seleccionada)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#4361EE12',
                                    border: '1px solid #4361EE28', borderRadius: '8px', color: '#4361EE', cursor: 'pointer', fontSize: '12.5px', fontWeight: 'bold'
                                }}
                            >
                                Ver
                            </button>
                        </div>
                    </div>

                    {/* Detalles IA */}
                    <div style={{
                        backgroundColor: ui.panel,
                        borderRadius: '16px',
                        padding: '14px 16px',
                        border: `1px solid ${ui.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ color: ui.mutedText, fontSize: '11px', fontWeight: 700, margin: '0 0 6px 0' }}>DETALLES</h3>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: ui.text }}>{seleccionada.usuarios?.nombres} {seleccionada.usuarios?.apellidos}</div>
                            <div style={{ fontSize: '12px', color: ui.mutedText, marginBottom: '8px' }}>DNI: {seleccionada.usuarios?.dni}</div>
                            {seleccionada.foto_url && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700,
                                    padding: '3px 8px', borderRadius: '12px', backgroundColor: colorEtiquetaIA[seleccionada.etiqueta_ia] + '18',
                                    color: colorEtiquetaIA[seleccionada.etiqueta_ia], textTransform: 'uppercase'
                                }}>
                                    {seleccionada.etiqueta_ia} ({seleccionada.nivel_confianza_ia}%)
                                </div>
                            )}
                        </div>
                        <div>
                            {seleccionada.foto_url ? (
                                <button
                                    onClick={() => {
                                        setErrorImagen(false);
                                        setVerEvidencia(true);
                                    }}
                                    style={{
                                        padding: '8px 14px',
                                        backgroundColor: '#4361EE12',
                                        border: '1px solid #4361EE28',
                                        borderRadius: '8px',
                                        color: '#4361EE',
                                        cursor: 'pointer',
                                        fontSize: '12.5px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    Ver evidencia
                                </button>
                            ) : (
                                <button
                                    disabled
                                    style={{
                                        padding: '8px 14px',
                                        backgroundColor: ui.border,
                                        border: `1px solid ${ui.border}`,
                                        borderRadius: '8px',
                                        color: ui.mutedText,
                                        cursor: 'not-allowed',
                                        fontSize: '12.5px',
                                        fontWeight: 'bold',
                                        opacity: 0.6
                                    }}
                                >
                                    Sin evidencia
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mapa */}
                <div style={{ backgroundColor: ui.panel, borderRadius: '16px', padding: '20px', border: `1px solid ${ui.border}`, display: 'flex', flexDirection: 'column' }} className="h-[350px] lg:h-auto">
                    <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 12px' }}>UBICACIÓN DE LA EMERGENCIA</h3>
                    <div style={{ flex: 1, minHeight: '280px', borderRadius: '12px', overflow: 'hidden' }}>
                        <MapaEmergencia ubicacion={seleccionada.ubicacion} tema={tema} />
                    </div>
                </div>
            </div>

            {/* Modal Lightbox Evidencia */}
            {verEvidencia && seleccionada.foto_url && (
                <div
                    onClick={() => setVerEvidencia(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99999,
                        backdropFilter: 'blur(6px)',
                        padding: '24px',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            backgroundColor: ui.panel,
                            borderRadius: '20px',
                            border: `1px solid ${ui.border}`,
                            padding: '20px',
                            maxWidth: '90vw',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        }}
                    >
                        {/* Header del Lightbox */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px', gap: '20px' }}>
                            <div style={{ fontWeight: 'bold', color: ui.text, fontSize: '16px' }}>Evidencia de Emergencia</div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button
                                    onClick={() => setVerEvidencia(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: ui.text,
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        lineHeight: 1,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Imagen o Error */}
                        {errorImagen ? (
                            <div style={{ padding: '40px 20px', color: '#E63946', textAlign: 'center', fontWeight: 'bold' }}>
                                ⚠️ Error al cargar la evidencia (URL expirada o rota)
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                <img
                                    src={seleccionada.foto_url}
                                    alt="Evidencia"
                                    onError={() => setErrorImagen(true)}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '65vh',
                                        objectFit: 'contain',
                                        borderRadius: '12px',
                                    }}
                                />
                                {seleccionada.descripcion && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px 16px',
                                        backgroundColor: modoClaro ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
                                        borderRadius: '10px',
                                        color: ui.text,
                                        fontSize: '13.5px',
                                        lineHeight: '1.5',
                                        maxWidth: '100%',
                                        textAlign: 'center',
                                        borderLeft: '3px solid #4361EE',
                                        fontStyle: 'italic'
                                    }}>
                                        "{seleccionada.descripcion}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}