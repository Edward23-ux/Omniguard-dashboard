import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Compania } from '../admin.styles';

export function useCompanias() {
    const [companias, setCompanias] = useState<Compania[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editando, setEditando] = useState<string | null>(null);

    const cargarCompanias = async () => {
        const { data, error } = await supabase
            .from('companias_bomberos')
            .select('*')
            .order('nombre');

        if (!error && data) {
            setCompanias(data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        cargarCompanias();
    }, []);

    const actualizarUnidades = async (id: string, nuevoTotal: number) => {
        const companiaActual = companias.find(c => c.id === id);
        if (!companiaActual) return;

        const disponiblesAjustadas = Math.min(
            companiaActual.unidades_disponibles,
            nuevoTotal
        );

        const { error } = await supabase
            .from('companias_bomberos')
            .update({
                unidades_totales: nuevoTotal,
                unidades_disponibles: disponiblesAjustadas
            })
            .eq('id', id);

        if (error) {
            toast.error('Error al actualizar');
        } else {
            toast.success(`✅ Total actualizado a ${nuevoTotal} (disponibles: ${disponiblesAjustadas})`);
            cargarCompanias();
            setEditando(null);
        }
    };

    const toggleActiva = async (id: string, activa: boolean) => {
        const { error } = await supabase
            .from('companias_bomberos')
            .update({ activa: !activa })
            .eq('id', id);

        if (error) {
            toast.error('Error al actualizar');
        } else {
            toast.success(activa ? 'Compañía desactivada' : 'Compañía activada');
            cargarCompanias();
        }
    };

    return {
        companias,
        isLoading,
        editando,
        setEditando,
        actualizarUnidades,
        toggleActiva,
        cargarCompanias,
    };
}