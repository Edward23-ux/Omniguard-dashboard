'use client';

import { useMemo, useState } from 'react';
import { useAdminContext } from '../AdminContext';
import { useUsuarios } from './useUsuarios';

type Criterio = 'reportante' | 'testigo' | 'falsaAlarma';

const CRITERIOS: { key: Criterio; label: string }[] = [
    { key: 'reportante', label: 'Veces como reportante' },
    { key: 'testigo', label: 'Veces como testigo' },
    { key: 'falsaAlarma', label: 'Falsas alarmas' },
];

export default function UsuariosPage() {
    const { ui, modoClaro } = useAdminContext();
    const { usuarios, isLoading } = useUsuarios();
    const [criterio, setCriterio] = useState<Criterio>('reportante');

    const usuariosOrdenados = useMemo(() => {
        return [...usuarios].sort((a, b) => b[criterio] - a[criterio]);
    }, [usuarios, criterio]);

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ color: '#E63946', fontSize: '28px', marginBottom: '6px' }}>Usuarios</h1>
                    <p style={{ color: ui.mutedText, margin: 0 }}>Actividad de los ciudadanos registrados en el sistema.</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: ui.mutedText, fontSize: '13px' }}>Rankear por:</span>
                    <select
                        value={criterio}
                        onChange={(e) => setCriterio(e.target.value as Criterio)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: `1px solid ${ui.border}`,
                            backgroundColor: ui.fieldBackground,
                            color: ui.text,
                            fontSize: '13px',
                            fontWeight: 700,
                        }}
                    >
                        {CRITERIOS.map((c) => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                    </select>
                </div>
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
                    gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr',
                    padding: '16px',
                    backgroundColor: ui.surface,
                    borderBottom: `1px solid ${ui.border}`,
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: ui.mutedText,
                }}>
                    <div>NOMBRE</div>
                    <div>DNI</div>
                    <div style={{ textAlign: 'center' }}>REPORTANTE</div>
                    <div style={{ textAlign: 'center' }}>TESTIGO</div>
                    <div style={{ textAlign: 'center' }}>FALSA ALARMA</div>
                </div>

                {isLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText }}>Cargando...</div>
                ) : usuariosOrdenados.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText }}>Sin usuarios registrados</div>
                ) : (
                    usuariosOrdenados.map((u) => (
                        <div key={u.id} style={{
                            display: 'grid',
                            gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr',
                            padding: '16px',
                            borderBottom: `1px solid ${ui.border}`,
                            alignItems: 'center',
                            fontSize: '14px',
                        }}>
                            <div style={{ color: ui.text }}>{u.nombres} {u.apellidos}</div>
                            <div style={{ color: ui.mutedText, fontSize: '13px', fontFamily: 'monospace' }}>{u.dni}</div>
                            <div style={{ color: criterio === 'reportante' ? '#1E6B37' : ui.text, fontWeight: criterio === 'reportante' ? 800 : 500, textAlign: 'center' }}>{u.reportante}</div>
                            <div style={{ color: criterio === 'testigo' ? '#4361EE' : ui.text, fontWeight: criterio === 'testigo' ? 800 : 500, textAlign: 'center' }}>{u.testigo}</div>
                            <div style={{ color: criterio === 'falsaAlarma' ? '#E63946' : ui.text, fontWeight: criterio === 'falsaAlarma' ? 800 : 500, textAlign: 'center' }}>{u.falsaAlarma}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}