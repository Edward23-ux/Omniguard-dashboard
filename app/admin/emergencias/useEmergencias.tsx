import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useAdminContext } from '../AdminContext';

export type Emergencia = {
    id: string;
    tipo: string;
    estado: string;
    etiqueta_ia: string;
    nivel_confianza_ia: number;
    testigos: number;
    direccion_aproximada: string;
    creado_en: string;
    compania_asignada_id: string | null;
    companias_bomberos: { nombre: string; telefono: string } | null;
    usuarios: { dni: string; nombres: string; apellidos: string } | null;
};

export type CompaniaOpcion = { id: string; nombre: string; activa: boolean };

export function useEmergencias() {
    const { ui, modoClaro } = useAdminContext();
    const [emergencias, setEmergencias] = useState<Emergencia[]>([]);
    const [companias, setCompanias] = useState<CompaniaOpcion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [reasignandoId, setReasignandoId] = useState<string | null>(null);

    const cargarEmergencias = useCallback(async () => {
        const { data, error } = await supabase
            .from('emergencias')
            .select(`
        id, tipo, estado, etiqueta_ia, nivel_confianza_ia, testigos,
        direccion_aproximada, creado_en, compania_asignada_id, foto_url, descripcion,
        companias_bomberos (nombre, telefono),
        usuarios (dni, nombres, apellidos)
      `)
            .order('creado_en', { ascending: false })
            .limit(200);

        if (error) {
            toast.error('Error al cargar emergencias');
        } else {
            setEmergencias((data || []) as unknown as Emergencia[]);
        }
        setIsLoading(false);
    }, []);

    const cargarCompanias = useCallback(async () => {
        const { data, error } = await supabase
            .from('companias_bomberos')
            .select('id, nombre, activa')
            .order('nombre');
        if (!error && data) setCompanias(data);
    }, []);

    useEffect(() => {
        cargarEmergencias();
        cargarCompanias();
    }, [cargarEmergencias, cargarCompanias]);

    const reasignarCompania = async (emergenciaId: string, nuevaCompaniaId: string) => {
        setReasignandoId(emergenciaId);

        const toastId = toast.loading(
            <span style={{ fontWeight: 500, fontSize: '13.5px' }}>Reasignando emergencia...</span>,
            {
                icon: (
                    <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(230, 57, 70, 0.2)',
                        borderTopColor: '#E63946',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                    }} />
                ),
                style: {
                    background: modoClaro ? '#FFFFFF' : '#161616',
                    color: ui.text,
                    border: `1px solid ${ui.border}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                }
            }
        );

        try {
            const response = await fetch('/api/companias', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emergenciaId,
                    companiaId: nuevaCompaniaId || null,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'No se pudo reasignar la emergencia');
            }

            // Update optimista: refleja el cambio de inmediato en la tabla y en el combobox
            const companiaNueva = companias.find((c) => c.id === nuevaCompaniaId);
            const emergenciaActual = emergencias.find((e) => e.id === emergenciaId);
            const nombreCompaniaAnterior = emergenciaActual?.companias_bomberos?.nombre || 'Sin asignar';
            const nombreCompaniaNueva = companiaNueva ? companiaNueva.nombre : 'Sin asignar';

            setEmergencias((actual) =>
                actual.map((e) =>
                    e.id === emergenciaId
                        ? {
                            ...e,
                            compania_asignada_id: nuevaCompaniaId || null,
                            companias_bomberos: companiaNueva
                                ? { nombre: companiaNueva.nombre, telefono: e.companias_bomberos?.telefono || '' }
                                : null,
                        }
                        : e
                )
            );

            toast.success(
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: ui.text }}>Reasignación Exitosa</span>
                    <span style={{ fontSize: '12.5px', color: ui.mutedText }}>
                        Se reasignó la emergencia de la compañía <strong>{nombreCompaniaAnterior}</strong> a la compañía <strong>{nombreCompaniaNueva}</strong>.
                    </span>
                </div>,
                {
                    id: toastId,
                    icon: (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'rgba(46, 204, 113, 0.15)',
                            color: '#2ECC71',
                            borderRadius: '50%',
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }}>
                            ✓
                        </span>
                    ),
                    style: {
                        background: modoClaro ? '#FFFFFF' : '#161616',
                        color: ui.text,
                        border: `1px solid ${ui.border}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                    },
                    duration: 4000,
                }
            );
        } catch (error: any) {
            console.error('Error al reasignar compañía:', error);
            toast.error(
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: ui.text }}>Error</span>
                    <span style={{ fontSize: '12.5px', color: ui.mutedText }}>
                        {error.message || 'No se pudo reasignar la emergencia.'}
                    </span>
                </div>,
                {
                    id: toastId,
                    icon: (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            backgroundColor: 'rgba(230, 57, 70, 0.15)',
                            color: '#E63946',
                            borderRadius: '50%',
                            fontWeight: 'bold',
                            fontSize: '12px'
                        }}>
                            !
                        </span>
                    ),
                    style: {
                        background: modoClaro ? '#FFFFFF' : '#161616',
                        color: ui.text,
                        border: `1px solid ${ui.border}`,
                        borderRadius: '12px',
                        padding: '12px 16px',
                    }
                }
            );
        } finally {
            setReasignandoId(null);
            // Refetch en segundo plano para sincronizar por completo con el servidor
            cargarEmergencias();
        }
    };

    return {
        emergencias,
        companias,
        isLoading,
        reasignandoId,
        reasignarCompania,
        cargarEmergencias,
    };
}
