import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export type UsuarioStats = {
    id: string;
    dni: string;
    nombres: string;
    apellidos: string;
    reportante: number;
    testigo: number;
    falsaAlarma: number;
};

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState<UsuarioStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            try {
                const [{ data: usuariosData, error: errUsuarios },
                    { data: emergenciasData, error: errEmergencias },
                    { data: testigosData, error: errTestigos }] = await Promise.all([
                        supabase.from('usuarios').select('id, dni, nombres, apellidos'),
                        supabase.from('emergencias').select('usuario_id, estado'),
                        supabase.from('testigos_emergencia').select('usuario_id'),
                    ]);

                if (errUsuarios) throw errUsuarios;
                if (errEmergencias) throw errEmergencias;
                if (errTestigos) throw errTestigos;

                const reportanteCount = new Map<string, number>();
                const falsaAlarmaCount = new Map<string, number>();
                (emergenciasData || []).forEach((e: any) => {
                    if (!e.usuario_id) return;
                    reportanteCount.set(e.usuario_id, (reportanteCount.get(e.usuario_id) || 0) + 1);
                    if (e.estado === 'falsa_alarma') {
                        falsaAlarmaCount.set(e.usuario_id, (falsaAlarmaCount.get(e.usuario_id) || 0) + 1);
                    }
                });

                const testigoCount = new Map<string, number>();
                (testigosData || []).forEach((t: any) => {
                    if (!t.usuario_id) return;
                    testigoCount.set(t.usuario_id, (testigoCount.get(t.usuario_id) || 0) + 1);
                });

                const stats: UsuarioStats[] = (usuariosData || []).map((u: any) => ({
                    id: u.id,
                    dni: u.dni,
                    nombres: u.nombres,
                    apellidos: u.apellidos,
                    reportante: reportanteCount.get(u.id) || 0,
                    testigo: testigoCount.get(u.id) || 0,
                    falsaAlarma: falsaAlarmaCount.get(u.id) || 0,
                }));

                setUsuarios(stats);
            } catch (e) {
                console.error(e);
                toast.error('Error al cargar usuarios');
            } finally {
                setIsLoading(false);
            }
        };

        cargar();
    }, []);

    return { usuarios, isLoading };
}