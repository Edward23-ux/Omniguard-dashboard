// app/admin/useAdmin.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { Compania } from './admin.styles';

type NuevaCompaniaForm = {
  nombre: string;
  direccion: string;
  telefono: string;
  latitud: string;
  longitud: string;
  unidadesTotales: string;
  activa: boolean;
};

type Coordenadas = {
  lat: number;
  lng: number;
};

type FormErrors = Partial<Record<keyof NuevaCompaniaForm, string>>;

const DEFAULT_FORM: NuevaCompaniaForm = {
  nombre: '',
  direccion: '',
  telefono: '',
  latitud: '',
  longitud: '',
  unidadesTotales: '1',
  activa: true,
};

const sanitizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

const sanitizePhone = (value: string) => value.replace(/\D/g, '');

const sanitizeCoordinateInput = (value: string) => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const withoutExtraMinus = cleaned
    .replace(/(?!^)-/g, '')
    .replace(/^--+/, '-');

  const [integerPart = '', ...decimalParts] = withoutExtraMinus.split('.');
  if (decimalParts.length === 0) return withoutExtraMinus;
  return `${integerPart}.${decimalParts.join('')}`;
};

export function useAdmin() {
  const [usuario, setUsuario] = useState<any>(null);
  const [companias, setCompanias] = useState<Compania[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [isModalAgregarOpen, setIsModalAgregarOpen] = useState(false);
  const [isSavingCompania, setIsSavingCompania] = useState(false);
  const [nuevaCompania, setNuevaCompania] = useState<NuevaCompaniaForm>(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapDraftCoords, setMapDraftCoords] = useState<Coordenadas | null>(null);
  
  const [tema, setTema] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const guardado = localStorage.getItem('omniguard-admin-theme');
    if (guardado === 'dark' || guardado === 'light') return guardado;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const router = useRouter();

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
    localStorage.setItem('omniguard-admin-theme', tema);
  }, [tema]);

  useEffect(() => {
    const session = localStorage.getItem('dashboard_session');
    if (!session) {
      router.push('/');
      return;
    }
    const sessionData = JSON.parse(session);
    if (sessionData.expira < Date.now()) {
      localStorage.removeItem('dashboard_session');
      router.push('/');
      return;
    }
    if (sessionData.rol !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setUsuario(sessionData);
    cargarCompanias();
  }, [router]);

  const abrirModalCompania = () => {
    setFormErrors({});
    setNuevaCompania(DEFAULT_FORM);
    setServerError(null);
    setIsMapPickerOpen(false);
    setMapDraftCoords(null);
    setIsModalAgregarOpen(true);
  };

  const cerrarModalCompania = () => {
    if (isSavingCompania) return;
    setIsModalAgregarOpen(false);
    setIsMapPickerOpen(false);
    setMapDraftCoords(null);
    setFormErrors({});
    setNuevaCompania(DEFAULT_FORM);
    setServerError(null);
  };

  const abrirMapPicker = () => {
    const lat = Number.parseFloat(nuevaCompania.latitud);
    const lng = Number.parseFloat(nuevaCompania.longitud);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      setMapDraftCoords({ lat, lng });
    } else {
      setMapDraftCoords({ lat: -12.0464, lng: -77.0428 });
    }
    setIsMapPickerOpen(true);
  };

  const cerrarMapPicker = () => {
    setIsMapPickerOpen(false);
  };

  const seleccionarCoordenadasEnMapa = (coords: Coordenadas) => {
    setMapDraftCoords(coords);
  };

  const confirmarCoordenadasMapa = () => {
    if (!mapDraftCoords) {
      toast.error('Selecciona una ubicación en el mapa');
      return;
    }

    setNuevaCompania((actual) => ({
      ...actual,
      latitud: mapDraftCoords.lat.toFixed(6),
      longitud: mapDraftCoords.lng.toFixed(6),
    }));

    setFormErrors((actual) => {
      const siguiente = { ...actual };
      delete siguiente.latitud;
      delete siguiente.longitud;
      return siguiente;
    });

    setIsMapPickerOpen(false);
  };

  const actualizarCampoCompania = (campo: keyof NuevaCompaniaForm, valor: string | boolean) => {
    setNuevaCompania((actual) => ({
      ...actual,
      [campo]:
        campo === 'telefono' && typeof valor === 'string'
          ? // sanitize on input: only digits, max 9
            valor.replace(/\D/g, '').slice(0, 9)
          : (campo === 'latitud' || campo === 'longitud') && typeof valor === 'string'
          ? sanitizeCoordinateInput(valor)
          : typeof valor === 'string'
          ? valor
          : valor,
    }));

    setFormErrors((actual) => {
      if (!actual[campo]) return actual;
      const siguiente = { ...actual };
      delete siguiente[campo];
      return siguiente;
    });
  };

  const validarNuevaCompania = () => {
    const errores: FormErrors = {};
    const nombre = sanitizeText(nuevaCompania.nombre);
    const direccion = sanitizeText(nuevaCompania.direccion);
    const telefono = sanitizePhone(nuevaCompania.telefono);
    const latitud = sanitizeCoordinateInput(nuevaCompania.latitud);
    const longitud = sanitizeCoordinateInput(nuevaCompania.longitud);
    const unidadesTotales = Number.parseInt(nuevaCompania.unidadesTotales, 10);
    const latitudNum = Number.parseFloat(latitud);
    const longitudNum = Number.parseFloat(longitud);

    if (!nombre) errores.nombre = 'El nombre es obligatorio';
    if (!direccion) errores.direccion = 'La dirección es obligatoria';
    if (!telefono) errores.telefono = 'El teléfono es obligatorio';
    else if (telefono.length !== 9) errores.telefono = 'El teléfono debe tener 9 dígitos';
    if (!latitud) errores.latitud = 'La latitud es obligatoria';
    else if (Number.isNaN(latitudNum) || latitudNum < -90 || latitudNum > 90) {
      errores.latitud = 'La latitud debe estar entre -90 y 90';
    }
    if (!longitud) errores.longitud = 'La longitud es obligatoria';
    else if (Number.isNaN(longitudNum) || longitudNum < -180 || longitudNum > 180) {
      errores.longitud = 'La longitud debe estar entre -180 y 180';
    }
    if (!nuevaCompania.unidadesTotales.trim()) {
      errores.unidadesTotales = 'Las unidades totales son obligatorias';
    } else if (Number.isNaN(unidadesTotales) || unidadesTotales < 0) {
      errores.unidadesTotales = 'Ingresa un número válido mayor o igual a 0';
    }

    const ubicacionWkt = `POINT(${longitudNum} ${latitudNum})`;

    return {
      errores,
      payload: {
        nombre,
        direccion,
        telefono,
        latitud: latitudNum,
        longitud: longitudNum,
        ubicacion: ubicacionWkt,
        unidadesTotales,
      },
    };
  };

  const guardarNuevaCompania = async () => {
    const { errores, payload } = validarNuevaCompania();

    if (Object.keys(errores).length > 0) {
      setFormErrors(errores);
      toast.error('Revisa los campos de la compañía');
      return;
    }

    setIsSavingCompania(true);
    setServerError(null);

    try {
      const unidadesDisponibles = nuevaCompania.activa ? payload.unidadesTotales : 0;

      const insertPayload = {
        nombre: payload.nombre,
        direccion: payload.direccion,
        telefono: payload.telefono,
        latitud: payload.latitud,
        longitud: payload.longitud,
        ubicacion: payload.ubicacion,
        unidades_totales: payload.unidadesTotales,
        unidades_disponibles: unidadesDisponibles,
        activa: nuevaCompania.activa,
      };

      // Call server-side API that uses service role to bypass RLS safely
      const resp = await fetch('/api/companias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertPayload),
      });

      const json = await resp.json();

      if (!resp.ok) {
        const msg = json?.error || `Server returned ${resp.status}`;
        setServerError(msg);
        toast.error(msg);
        return;
      }

      toast.success('Compañía registrada correctamente');
      setIsModalAgregarOpen(false);
      setNuevaCompania(DEFAULT_FORM);
      setFormErrors({});
      await cargarCompanias();
    } catch (error) {
      console.error('Error al crear compañía:', error);
      const err = error as { message?: string } | null;
      const message = err?.message || 'No se pudo registrar la compañía';
      setServerError(message);
      toast.error(message);
    } finally {
      setIsSavingCompania(false);
    }
  };

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
    usuario,
    companias,
    isLoading,
    editando,
    setEditando,
    isModalAgregarOpen,
    isSavingCompania,
    nuevaCompania,
    formErrors,
    serverError,
    isMapPickerOpen,
    mapDraftCoords,
    tema,
    setTema,
    actualizarUnidades,
    toggleActiva,
    abrirModalCompania,
    cerrarModalCompania,
    actualizarCampoCompania,
    abrirMapPicker,
    cerrarMapPicker,
    seleccionarCoordenadasEnMapa,
    confirmarCoordenadasMapa,
    guardarNuevaCompania,
    router,
  };
}