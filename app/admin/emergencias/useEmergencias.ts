import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

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

            toast.success('Emergencia reasignada correctamente');
        } catch (error: any) {
            console.error('Error al reasignar compañía:', error);
            toast.error(error.message || 'No se pudo reasignar la emergencia');
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