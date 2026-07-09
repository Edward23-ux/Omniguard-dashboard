'use client';

import { useAdminContext } from '../AdminContext';
import { useCompanias } from './useCompanias';

export default function CompaniasPage() {
    const { ui, modoClaro } = useAdminContext();
    const {
        companias,
        isLoading,
        editando,
        setEditando,
        actualizarUnidades,
        toggleActiva,
    } = useCompanias();

    const cardStyle = {
        backgroundColor: ui.panel,
        padding: '12px 16px',
        borderRadius: '14px',
        border: `1px solid ${ui.border}`,
        boxShadow: modoClaro ? '0 6px 16px rgba(16, 35, 61, 0.03)' : 'none',
        display: 'flex',
        flexDirection: 'row' as const,
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.22s ease',
    };

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ color: '#E63946', fontSize: '28px', marginBottom: '6px' }}>Compañías</h1>
                <p style={{ color: ui.mutedText, margin: 0 }}>Gestiona las compañías de bomberos registradas.</p>
            </div>

            {/* Resumen en una sola card con 4 métricas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '32px',
            }}>
                {/* Compañías */}
                <div
                    style={cardStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                        e.currentTarget.style.boxShadow = modoClaro ? '0 8px 20px rgba(16, 35, 61, 0.06)' : '0 8px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = modoClaro ? '0 6px 16px rgba(16, 35, 61, 0.03)' : 'none';
                    }}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(230, 57, 70, 0.1)',
                        color: '#E63946',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: ui.text, lineHeight: '1.1' }}>{companias.length}</div>
                        <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>Compañías</div>
                    </div>
                </div>

                {/* Unidades Totales */}
                <div
                    style={cardStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                        e.currentTarget.style.boxShadow = modoClaro ? '0 8px 20px rgba(16, 35, 61, 0.06)' : '0 8px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = modoClaro ? '0 6px 16px rgba(16, 35, 61, 0.03)' : 'none';
                    }}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(67, 97, 238, 0.1)',
                        color: ui.primaryButton,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: ui.text, lineHeight: '1.1' }}>
                            {companias.reduce((sum, c) => sum + c.unidades_totales, 0)}
                        </div>
                        <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>Unidades totales</div>
                    </div>
                </div>

                {/* Activas */}
                <div
                    style={cardStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                        e.currentTarget.style.boxShadow = modoClaro ? '0 8px 20px rgba(16, 35, 61, 0.06)' : '0 8px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = modoClaro ? '0 6px 16px rgba(16, 35, 61, 0.03)' : 'none';
                    }}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(45, 198, 83, 0.1)',
                        color: '#2DC653',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: ui.text, lineHeight: '1.1' }}>
                            {companias.filter(c => c.activa).length}
                        </div>
                        <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>Activas</div>
                    </div>
                </div>

                {/* Inactivas */}
                <div
                    style={cardStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1.5px)';
                        e.currentTarget.style.boxShadow = modoClaro ? '0 8px 20px rgba(16, 35, 61, 0.06)' : '0 8px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = modoClaro ? '0 6px 16px rgba(16, 35, 61, 0.03)' : 'none';
                    }}
                >
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255, 195, 0, 0.1)',
                        color: '#FFC300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: ui.text, lineHeight: '1.1' }}>
                            {companias.filter(c => !c.activa).length}
                        </div>
                        <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '2px', fontWeight: 500 }}>Inactivas</div>
                    </div>
                </div>
            </div>

            {/* Tabla de compañías — misma lógica de acciones que el admin original */}
            <div style={{
                backgroundColor: ui.panel,
                borderRadius: '16px',
                overflow: 'hidden',
                border: `1px solid ${ui.border}`,
                boxShadow: modoClaro ? '0 14px 36px rgba(16, 35, 61, 0.06)' : 'none',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 2.5fr 1.2fr 80px 100px 160px',
                    padding: '16px',
                    backgroundColor: ui.surface,
                    borderBottom: `1px solid ${ui.border}`,
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: ui.mutedText,
                }}>
                    <div>NOMBRE</div>
                    <div>DIRECCIÓN</div>
                    <div style={{ textAlign: 'center' }}>TELÉFONO</div>
                    <div style={{ textAlign: 'center' }}>UNIDADES</div>
                    <div style={{ textAlign: 'center' }}>ESTADO</div>
                    <div style={{ textAlign: 'center' }}>ACCIONES</div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText }}>Cargando...</div>
                ) : (
                    companias.map(compania => (
                        <div key={compania.id} style={{
                            display: 'grid',
                            gridTemplateColumns: '2.5fr 2.5fr 1.2fr 80px 100px 160px',
                            padding: '16px',
                            borderBottom: `1px solid ${ui.border}`,
                            alignItems: 'center',
                            fontSize: '14px',
                        }}>
                            <div style={{ fontWeight: 'bold', color: ui.text }}>{compania.nombre}</div>
                            <div style={{ color: ui.mutedText, fontSize: '12px' }}>{compania.direccion}</div>
                            <div style={{ color: ui.mutedText, fontSize: '12px', textAlign: 'center' }}>{compania.telefono}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {editando === compania.id ? (
                                    <input
                                        type="number"
                                        defaultValue={compania.unidades_totales}
                                        min="0"
                                        max="10"
                                        onBlur={(e) => actualizarUnidades(compania.id, parseInt(e.target.value))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                actualizarUnidades(compania.id, parseInt((e.target as HTMLInputElement).value));
                                            }
                                        }}
                                        style={{
                                            width: '60px',
                                            padding: '6px',
                                            backgroundColor: ui.surface,
                                            border: '1px solid #E63946',
                                            borderRadius: '8px',
                                            color: ui.text,
                                            textAlign: 'center',
                                        }}
                                        autoFocus
                                    />
                                ) : (
                                    <span style={{ fontWeight: 'bold', color: '#E63946' }}>{compania.unidades_totales}</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    backgroundColor: compania.activa ? '#2DC65322' : '#66666622',
                                    color: compania.activa ? '#2DC653' : '#666666',
                                }}>
                                    {compania.activa ? 'ACTIVA' : 'INACTIVA'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                {editando === compania.id ? (
                                    <button
                                        onClick={() => setEditando(null)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            border: `1px solid ${ui.border}`,
                                            backgroundColor: ui.neutralButton,
                                            color: ui.dangerText || '#E63946',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            outline: 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(230, 57, 70, 0.15)';
                                            e.currentTarget.style.backgroundColor = 'rgba(230, 57, 70, 0.08)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.backgroundColor = ui.neutralButton;
                                        }}
                                        title="Cancelar edición"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setEditando(compania.id)}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            border: `1px solid ${ui.border}`,
                                            backgroundColor: ui.neutralButton,
                                            color: ui.text,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            outline: 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.05)';
                                            e.currentTarget.style.filter = 'brightness(0.95)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.style.filter = 'none';
                                        }}
                                        title="Editar unidades"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    onClick={() => toggleActiva(compania.id, compania.activa)}
                                    style={{
                                        minWidth: '95px',
                                        padding: '6px 12px',
                                        borderRadius: '999px',
                                        border: `1px solid ${compania.activa ? 'rgba(45, 198, 83, 0.35)' : ui.border}`,
                                        backgroundColor: compania.activa ? 'rgba(45, 198, 83, 0.08)' : ui.neutralButton,
                                        color: compania.activa ? '#2DC653' : ui.neutralButtonText,
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: '11px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: compania.activa ? '0 2px 8px rgba(45, 198, 83, 0.1)' : 'none',
                                        outline: 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = compania.activa
                                            ? '0 4px 10px rgba(45, 198, 83, 0.2)'
                                            : '0 4px 10px rgba(0, 0, 0, 0.05)';
                                        if (compania.activa) {
                                            e.currentTarget.style.backgroundColor = 'rgba(45, 198, 83, 0.14)';
                                        } else {
                                            e.currentTarget.style.filter = 'brightness(0.95)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = compania.activa ? '0 2px 8px rgba(45, 198, 83, 0.1)' : 'none';
                                        e.currentTarget.style.backgroundColor = compania.activa ? 'rgba(45, 198, 83, 0.08)' : ui.neutralButton;
                                        e.currentTarget.style.filter = 'none';
                                    }}
                                    title={compania.activa ? 'Desactivar' : 'Activar'}
                                >
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: compania.activa ? '#2DC653' : ui.mutedText,
                                        transition: 'all 0.25s ease',
                                        transform: compania.activa ? 'scale(1.2)' : 'scale(1)',
                                        boxShadow: compania.activa ? '0 0 6px #2DC653' : 'none',
                                    }} />
                                    {compania.activa ? 'Activa' : 'Inactiva'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}