'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import MapaEmergencia from '@/app/components/MapaEmergencia';
import NuevaEmergenciaPopup from '@/app/components/NuevaEmergenciaPopup';
import PanelDetalleEmergencia from '@/app/components/dashboard/PanelDetalleEmergencia';
import PanelMapaCalor from '@/app/components/dashboard/PanelMapaCalor';
import VistaVacia from '@/app/components/dashboard/VistaVacia';


type VistaPrincipal = 'detalle' | 'mapaCalor' | 'vacio';

const FILTROS = ['pendiente', 'en_proceso', 'culminado', 'falsa_alarma'];

const colorEstado: Record<string, string> = {
  pendiente: '#FFC300',
  en_proceso: '#4361EE',
  culminado: '#2DC653',
  falsa_alarma: '#666666',
};

const iconoTipo: Record<string, React.ReactNode> = {
  'Incendio': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E63946', verticalAlign: 'middle' }}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  'Accidente Vehicular': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4361EE', verticalAlign: 'middle' }}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 17h6" />
    </svg>
  ),
  'Fuga de Gas': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#06D6A0', verticalAlign: 'middle' }}>
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  ),
  'Rescate': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FF006E', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 9.17 4.24-4.24" />
      <path d="m14.83 14.83 4.24 4.24" />
      <path d="m9.17 14.83-4.24 4.24" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  'Derrumbe': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FB8500', verticalAlign: 'middle' }}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
      <path d="m11 5 2 5-4 2 2 3" />
    </svg>
  ),
  'Inundación': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00B4D8', verticalAlign: 'middle' }}>
      <path d="M2 6c.6 0 1.2-.2 1.6-.6L5 4l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L11 4l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L17 4l1.4 1.4c.4.4 1 .6 1.6.6" />
      <path d="M2 12c.6 0 1.2-.2 1.6-.6L5 10l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L11 10l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L17 10l1.4 1.4c.4.4 1 .6 1.6.6" />
      <path d="M2 18c.6 0 1.2-.2 1.6-.6L5 16l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L11 16l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L17 16l1.4 1.4c.4.4 1 .6 1.6.6" />
    </svg>
  ),
  'Explosión': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#D62828', verticalAlign: 'middle' }}>
      <path d="m12 3-1.912 5.886L4.2 8.878l4.757 4.107-1.818 6.015L12 15.275l4.86 3.725-1.817-6.015 4.756-4.107-5.888-.008z" />
    </svg>
  ),
  'Otro': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8338EC', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

const colorEtiquetaIA: Record<string, string> = {
  aprobado: '#2DC653',
  revision_manual: '#FFC300',
  rechazado: '#E63946',
  pendiente: '#666666',
};

const THEME_STORAGE_KEY = 'omniguard-dashboard-theme';

type EstadoEmergencia = 'pendiente' | 'en_proceso' | 'culminado' | 'falsa_alarma';
type AccionEmergencia = {
  estado: EstadoEmergencia;
  label: string;
  color: string;
  Icon: React.ComponentType<{ style?: React.CSSProperties }>;
};

const ACCIONES_EMERGENCIA: AccionEmergencia[] = [
  {
    estado: 'pendiente',
    label: 'Pendiente',
    color: '#B38A2D',
    Icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  {
    estado: 'en_proceso',
    label: 'Atender',
    color: '#3B82F6',
    Icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <circle cx="7.5" cy="18.5" r="2.5" />
        <path d="M14 14h7.5c.9 0 1.5-.5 1.5-1.2V9.5c0-.9-.7-1.5-1.5-1.5H14" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    )
  },
  {
    estado: 'culminado',
    label: 'Culminar',
    color: '#22C55E',
    Icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  {
    estado: 'falsa_alarma',
    label: 'Falsa Alarma',
    color: '#E63946',
    Icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    )
  },
];

const ESTADOS_HABILITADOS_POR_ESTADO: Record<EstadoEmergencia, EstadoEmergencia[]> = {
  pendiente: ['en_proceso', 'falsa_alarma'],
  en_proceso: ['culminado'],
  culminado: [],
  falsa_alarma: [],
};

function hexToRgba(hex: string, alpha: number) {
  const limpio = hex.replace('#', '');
  const value = limpio.length === 3
    ? limpio.split('').map((char) => char + char).join('')
    : limpio;

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getAccionesPermitidas(estadoActual?: string) {
  const estadoNormalizado = (estadoActual || '').toLowerCase() as EstadoEmergencia;
  return ESTADOS_HABILITADOS_POR_ESTADO[estadoNormalizado] || [];
}


export default function DashboardPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [vistaActiva, setVistaActiva] = useState<VistaPrincipal>('vacio');
  const [emergencias, setEmergencias] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('pendiente');
  const [tema, setTema] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const temaGuardado = localStorage.getItem(THEME_STORAGE_KEY);
    if (temaGuardado === 'dark' || temaGuardado === 'light') {
      setTema(temaGuardado);
    } else {
      setTema('light');
    }
  }, []);
  const [seleccionada, setSeleccionada] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [compania, setCompania] = useState<any>(null);
  const [modalTestigos, setModalTestigos] = useState<any>(null);
  const [testigos, setTestigos] = useState<any[]>([]);
  const [cargandoTestigos, setCargandoTestigos] = useState(false);
  const [nuevaEmergenciaAsignada, setNuevaEmergenciaAsignada] = useState<any>(null);
  const [modalDetalles, setModalDetalles] = useState<any>(null);
  const [pulsingEmergencies, setPulsingEmergencies] = useState<Record<string, boolean>>({});
  const [hoveredEmergencyId, setHoveredEmergencyId] = useState<string | null>(null);
  const [hoveredFooterButton, setHoveredFooterButton] = useState<'theme' | 'logout' | null>(null);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  const prevTestigosRef = useRef<Record<string, number>>({});
  const emergenciasIdsPreviasRef = useRef<Set<string>>(new Set());
  const primeraCargaEmergenciasRef = useRef(true);
  const emergenciasNotificadasRef = useRef<Set<string>>(new Set());
  const router = useRouter();
  const modoClaro = tema === 'light';

  const ui = {
    appBackground: modoClaro
      ? 'radial-gradient(circle at top left, rgba(70, 97, 238, 0.14), transparent 28%), radial-gradient(circle at top right, rgba(230, 57, 70, 0.10), transparent 24%), linear-gradient(180deg, #F7FAFF 0%, #EAF1FA 100%)'
      : 'radial-gradient(circle at top left, rgba(70, 97, 238, 0.16), transparent 28%), radial-gradient(circle at top right, rgba(230, 57, 70, 0.10), transparent 24%), linear-gradient(180deg, #111111 0%, #0D0D0D 100%)',
    text: modoClaro ? '#10233D' : '#FFFFFF',
    mutedText: modoClaro ? '#5F6B7A' : '#AAAAAA',
    softerText: modoClaro ? '#7D8896' : '#666666',
    sidebar: modoClaro ? '#FFFFFF' : '#1A1A1A',
    panel: modoClaro ? '#FFFFFF' : '#1A1A1A',
    surface: modoClaro ? '#F7FAFD' : '#0D0D0D',
    border: modoClaro ? '#D8E2F0' : '#2A2A2A',
    borderStrong: modoClaro ? '#C7D4E3' : '#2A2A2A',
    chip: modoClaro ? '#E7EEF7' : '#2A2A2A',
    chipText: modoClaro ? '#20324D' : '#AAAAAA',
    card: modoClaro ? '#FFFFFF' : '#1A1A1A',
    cardSoft: modoClaro ? '#F5F8FC' : '#0D0D0D',
    neutralButton: modoClaro ? '#E7EEF7' : '#2A2A2A',
    neutralButtonText: modoClaro ? '#20324D' : '#AAAAAA',
    toggleActive: modoClaro ? '#10233D' : '#FFFFFF',
    toggleInactive: modoClaro ? '#D9E4F1' : '#2A2A2A',
  };

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, tema);
  }, [tema]);

  const registrarNuevasEmergencias = useCallback((emergenciasRecibidas: any[]) => {
    const idsActuales = new Set(emergenciasRecibidas.map((emergencia: any) => emergencia.id));

    if (primeraCargaEmergenciasRef.current) {
      emergenciasIdsPreviasRef.current = idsActuales;
      primeraCargaEmergenciasRef.current = false;
      return;
    }

    const companiaIdUsuario = usuario?.compania_id;
    if (!companiaIdUsuario) {
      emergenciasIdsPreviasRef.current = idsActuales;
      return;
    }

    const nuevasEmergencias = emergenciasRecibidas.filter((emergencia: any) => {
      return !emergenciasIdsPreviasRef.current.has(emergencia.id) &&
        emergencia.compania_asignada_id === companiaIdUsuario;
    });

    if (nuevasEmergencias.length > 0) {
      const emergenciaMasReciente = [...nuevasEmergencias].sort((a, b) => {
        return new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime();
      })[0];

      if (emergenciaMasReciente?.id && !emergenciasNotificadasRef.current.has(emergenciaMasReciente.id)) {
        emergenciasNotificadasRef.current.add(emergenciaMasReciente.id);
        setNuevaEmergenciaAsignada(emergenciaMasReciente);
      }
    }

    emergenciasIdsPreviasRef.current = idsActuales;
  }, [usuario?.compania_id]);

  const cargarCompania = useCallback(async (companiaId: string) => {
    const { data, error } = await supabase
      .from('companias_bomberos')
      .select('id, nombre, unidades_disponibles, unidades_totales')
      .eq('id', companiaId)
      .single();
    if (!error && data) setCompania(data);
  }, []);

  const cargarEmergencias = useCallback(async (usuarioData?: any) => {
    const usr = usuarioData || usuario;
    if (!usr) return;

    try {
      let query = supabase
        .from('emergencias')
        .select(`
          id, tipo, estado, etiqueta_ia, testigos,
          direccion_aproximada, nivel_confianza_ia, foto_url, descripcion,
          creado_en, actualizado_en, compania_asignada_id, usuario_id,
          companias_bomberos (nombre, telefono),
          usuarios (dni, nombres, apellidos)
        `)
        .order('creado_en', { ascending: false })
        .limit(100);

      if (usr.rol !== 'admin' && usr.compania_id) {
        query = query.eq('compania_asignada_id', usr.compania_id);
      }

      const { data: emergenciasData, error } = await query;
      if (error) throw error;

      const { data: ubicaciones } = await supabase.rpc('get_todas_ubicaciones');

      const emergenciasConUbicacion = (emergenciasData || []).map((e: any) => {
        const ubObj = ubicaciones?.find((u: any) => u.id === e.id);
        return { ...e, ubicacion: ubObj?.ubicacion_texto || 'POINT(-79.8449 -6.7714)' };
      });

      setEmergencias(emergenciasConUbicacion);

      // Detectar aumento en el contador de testigos para activar la pulsación
      const newPulsing: Record<string, boolean> = {};
      let updatedPulsing = false;
      emergenciasConUbicacion.forEach((e: any) => {
        const prevCount = prevTestigosRef.current[e.id];
        if (prevCount !== undefined && e.testigos > prevCount) {
          newPulsing[e.id] = true;
          updatedPulsing = true;
        }
        prevTestigosRef.current[e.id] = e.testigos;
      });
      if (updatedPulsing) {
        setPulsingEmergencies(prev => ({ ...prev, ...newPulsing }));
      }

      registrarNuevasEmergencias(emergenciasConUbicacion);

      if (seleccionada) {
        const actualizada = emergenciasConUbicacion.find((e: any) => e.id === seleccionada.id);
        if (actualizada) setSeleccionada(actualizada);
      }

      return emergenciasConUbicacion;

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar emergencias');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [usuario, seleccionada, registrarNuevasEmergencias]);

  useEffect(() => {
    const session = localStorage.getItem('dashboard_session');
    if (!session) { router.push('/'); return; }

    const sessionData = JSON.parse(session);
    if (sessionData.expira < Date.now()) {
      localStorage.removeItem('dashboard_session');
      router.push('/');
      return;
    }

    setUsuario(sessionData);
    cargarEmergencias(sessionData);

    if (sessionData.compania_id) {
      cargarCompania(sessionData.compania_id);
    }
  }, [router]);

  useEffect(() => {
    if (!usuario) return;

    const channel = supabase
      .channel('realtime-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergencias' }, () => {
        cargarEmergencias();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'companias_bomberos' }, (payload) => {
        if (payload.new.id === usuario?.compania_id) {
          setCompania(payload.new);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [usuario, cargarEmergencias]);

  useEffect(() => {
    if (!usuario) return;

    const interval = window.setInterval(() => {
      cargarEmergencias();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [usuario, cargarEmergencias]);

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    setActualizando(true);
    const toastId = toast.loading(
      <span style={{ fontWeight: 500, fontSize: '13.5px' }}>Actualizando estado...</span>,
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
      const { data: emergenciaActual } = await supabase
        .from('emergencias')
        .select('estado, compania_asignada_id')
        .eq('id', id)
        .single();

      if (!emergenciaActual) {
        toast.dismiss(toastId);
        return;
      }

      const estadoAnterior = emergenciaActual.estado;
      const companiaId = emergenciaActual.compania_asignada_id;

      let unidadesActuales = 0;
      if (companiaId) {
        const { data: compData } = await supabase
          .from('companias_bomberos')
          .select('unidades_disponibles, unidades_totales')
          .eq('id', companiaId)
          .single();
        if (compData) unidadesActuales = compData.unidades_disponibles;
      }

      if (estadoAnterior === 'pendiente' && nuevoEstado === 'en_proceso') {
        if (unidadesActuales <= 0) {
          toast.error(
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: ui.text }}>Operación denegada</span>
              <span style={{ fontSize: '12.5px', color: ui.mutedText }}>
                No hay unidades disponibles en la compañía.
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
          setActualizando(false);
          return;
        }
      }

      console.log('🔍 Debug:', { estadoAnterior, nuevoEstado, companiaId, unidadesActuales });

      let deltaUnidades = 0;
      if (estadoAnterior === 'pendiente' && nuevoEstado === 'en_proceso') {
        deltaUnidades = -1;
      } else if (estadoAnterior === 'en_proceso' &&
        (nuevoEstado === 'culminado' || nuevoEstado === 'falsa_alarma')) {
        deltaUnidades = +1;
      }

      if (deltaUnidades !== 0 && companiaId) {
        const { data: compTotal } = await supabase
          .from('companias_bomberos')
          .select('unidades_disponibles, unidades_totales')
          .eq('id', companiaId)
          .single();

        const maxUnidades = compTotal?.unidades_totales ?? 3;
        const nuevasUnidades = Math.min(
          Math.max(unidadesActuales + deltaUnidades, 0),
          maxUnidades
        );

        const { error: updateError } = await supabase
          .from('companias_bomberos')
          .update({ unidades_disponibles: nuevasUnidades })
          .eq('id', companiaId);

        console.log('🔄 Update unidades:', {
          companiaId, unidadesActuales, deltaUnidades, nuevasUnidades, error: updateError
        });
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/actualizar-estado`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emergencia_id: id,
            nuevo_estado: nuevoEstado,
            bombero_id: usuario?.id || 'dashboard',
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: ui.text }}>Estado Actualizado</span>
            <span style={{ fontSize: '12.5px', color: ui.mutedText }}>
              Incidente cambiado a: <strong>{nuevoEstado.replace('_', ' ').toUpperCase()}</strong>
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
            duration: 2500,
          }
        );
        await cargarEmergencias();
        if (companiaId) await cargarCompania(companiaId);
      } else {
        toast.error(
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 600, fontSize: '14px', color: ui.text }}>Error</span>
            <span style={{ fontSize: '12.5px', color: ui.mutedText }}>
              No se pudo actualizar el estado de la emergencia.
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
      }
    } catch (error) {
      toast.error(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: ui.text }}>Error de conexión</span>
          <span style={{ fontSize: '12.5px', color: ui.mutedText }}>
            Hubo un problema de red al intentar actualizar.
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
      setActualizando(false);
    }
  };

  const verTestigos = async (emergencia: any) => {
    setModalTestigos(emergencia);
    setCargandoTestigos(true);
    setTestigos([]);

    try {
      const { data: creador } = await supabase
        .from('emergencias')
        .select(`creado_en, usuarios (dni, nombres, apellidos)`)
        .eq('id', emergencia.id)
        .single();

      const { data: testigosData } = await supabase
        .from('testigos_emergencia')
        .select(`creado_en, usuarios (dni, nombres, apellidos)`)
        .eq('emergencia_id', emergencia.id)
        .order('creado_en', { ascending: true });

      const lista = [];

      if (creador?.usuarios) {
        lista.push({
          dni: (creador.usuarios as any).dni,
          nombres: (creador.usuarios as any).nombres,
          apellidos: (creador.usuarios as any).apellidos,
          fecha: creador.creado_en,
          rol: 'Reportante',
        });
      }

      if (testigosData) {
        for (const t of testigosData) {
          if (t.usuarios) {
            lista.push({
              dni: (t.usuarios as any).dni,
              nombres: (t.usuarios as any).nombres,
              apellidos: (t.usuarios as any).apellidos,
              fecha: t.creado_en,
              rol: 'Testigo',
            });
          }
        }
      }

      setTestigos(lista);
    } catch (e) {
      toast.error('Error al cargar testigos');
    } finally {
      setCargandoTestigos(false);
    }
  };

  const formatFecha = (fecha: string) => {
    const dt = new Date(fecha);
    const diff = Math.floor((Date.now() - dt.getTime()) / 60000);
    if (diff < 60) return `Hace ${diff} min`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} h`;
    return dt.toLocaleDateString('es-PE');
  };

  const emergenciasFiltradas = emergencias
    .filter(e => e.estado === filtro)
    .sort((a, b) => {
      const aPulsing = pulsingEmergencies[a.id] ? 1 : 0;
      const bPulsing = pulsingEmergencies[b.id] ? 1 : 0;
      if (aPulsing !== bPulsing) {
        return bPulsing - aPulsing;
      }
      return new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime();
    });

  const contadores = {
    pendiente: emergencias.filter(e => e.estado === 'pendiente').length,
    en_proceso: emergencias.filter(e => e.estado === 'en_proceso').length,
    culminado: emergencias.filter(e => e.estado === 'culminado').length,
  };

  const unidadesDisponibles = compania?.unidades_disponibles ?? null;
  const unidadesTotales = compania?.unidades_totales ?? 3;
  const sinUnidades = unidadesDisponibles !== null && unidadesDisponibles <= 0;
  const estadoActualSeleccionado = (seleccionada?.estado || '').toLowerCase() as EstadoEmergencia;
  const accionesPermitidas = getAccionesPermitidas(estadoActualSeleccionado);

  if (!mounted || !usuario) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#FFFFFF' }}>Cargando...</div>
  );

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundImage: ui.appBackground,
      backgroundColor: modoClaro ? '#EDF3FA' : '#0D0D0D',
      color: ui.text,
    }}>
      <Toaster position="top-right" />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <NuevaEmergenciaPopup
        emergencia={nuevaEmergenciaAsignada}
        tema={tema}
        onClose={() => setNuevaEmergenciaAsignada(null)}
        onVerDetalle={() => {
          if (nuevaEmergenciaAsignada) {
            setSeleccionada(nuevaEmergenciaAsignada);
          }
          setNuevaEmergenciaAsignada(null);
        }}
      />

      {/* ── MODAL DETALLES (Ciudadano + IA) ── */}
      {modalDetalles && (
        <div
          onClick={() => setModalDetalles(null)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 99999, backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: ui.sidebar,
              borderRadius: '20px',
              padding: '28px',
              width: '520px',
              maxWidth: '90vw',
              position: 'relative',
              zIndex: 100000,
              border: `1px solid ${ui.border}`,
            }}
          >
            {/* Header modal detalles */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '24px',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: ui.text }}>
                  Detalles de la Emergencia
                </h2>
                <p style={{ margin: '4px 0 0', color: ui.mutedText, fontSize: '13px' }}>
                  {iconoTipo[modalDetalles.tipo]} {modalDetalles.tipo}
                </p>
              </div>
              <button
                onClick={() => setModalDetalles(null)}
                style={{
                  background: ui.neutralButton, border: 'none',
                  borderRadius: '8px', color: ui.neutralButtonText,
                  width: '32px', height: '32px',
                  cursor: 'pointer', fontSize: '16px',
                }}
              >✕</button>
            </div>

            {/* Ciudadano reportante */}
            <div style={{
              backgroundColor: ui.cardSoft,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '16px',
              border: `1px solid ${ui.border}`,
            }}>
              <h3 style={{ color: ui.mutedText, fontSize: '12px', marginBottom: '12px', margin: '0 0 12px' }}>
                👤 CIUDADANO REPORTANTE
              </h3>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: ui.text }}>
                {modalDetalles.usuarios?.nombres} {modalDetalles.usuarios?.apellidos}
              </div>
              <div style={{ color: ui.mutedText, fontSize: '14px', marginTop: '6px' }}>
                DNI: {modalDetalles.usuarios?.dni}
              </div>
            </div>

            {/* Análisis IA */}
            <div style={{
              backgroundColor: ui.cardSoft,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${ui.border}`,
            }}>
              <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 12px' }}>
                🤖 ANÁLISIS IA
              </h3>
              <div style={{
                fontSize: '40px', fontWeight: 'bold',
                color: colorEtiquetaIA[modalDetalles.etiqueta_ia],
              }}>
                {modalDetalles.nivel_confianza_ia}%
              </div>
              <div style={{
                color: colorEtiquetaIA[modalDetalles.etiqueta_ia],
                fontSize: '15px', marginTop: '6px', fontWeight: 'bold',
              }}>
                {modalDetalles.etiqueta_ia === 'aprobado' ? '✅ Aprobado automáticamente' :
                  modalDetalles.etiqueta_ia === 'revision_manual' ? '⚠️ Requiere revisión manual' :
                    '❌ Rechazado por IA'}
              </div>
            </div>

            {/* Footer modal */}
            <div style={{
              marginTop: '20px',
              display: 'flex', justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setModalDetalles(null)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: ui.neutralButton,
                  border: 'none', borderRadius: '10px',
                  color: ui.neutralButtonText, cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        width: '350px',
        minWidth: '350px',
        height: '100%',
        backgroundColor: ui.sidebar,
        borderRight: `1px solid ${ui.border}`,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: modoClaro ? '0 16px 40px rgba(16, 35, 61, 0.04)' : 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>

        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: `1px solid ${ui.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(230, 57, 70, 0.09)',
            color: '#E63946',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: ui.text, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              OmniGuard
              <span style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#2DC653',
                borderRadius: '50%',
                display: 'inline-block',
                boxShadow: '0 0 8px #2DC653',
              }} title="Conectado en tiempo real" />
            </div>
            <div style={{ color: ui.mutedText, fontSize: '11px', fontWeight: 500 }}>
              {usuario.rol === 'admin' ? 'Administrador' : `${usuario.nombre}`}
            </div>
          </div>
        </div>

        {/* Contador unidades */}
        {usuario.rol !== 'admin' && unidadesDisponibles !== null && (
          <div style={{
            margin: '16px 16px 8px 16px',
            padding: '16px',
            backgroundColor: modoClaro ? 'rgba(45, 198, 83, 0.05)' : 'rgba(45, 198, 83, 0.12)',
            borderRadius: '12px',
            border: `1px solid ${sinUnidades ? 'rgba(230, 57, 70, 0.2)' : 'rgba(45, 198, 83, 0.2)'}`,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: sinUnidades ? '#E63946' : '#2DC653', letterSpacing: '0.05em' }}>
              UNIDADES DISPONIBLES
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 800,
              color: sinUnidades ? '#E63946' : '#2DC653',
              lineHeight: 1.1,
            }}>
              {unidadesDisponibles} <span style={{ fontSize: '14px', fontWeight: 500, color: ui.mutedText }}>/ {unidadesTotales}</span>
            </div>
            {sinUnidades && (
              <div style={{
                marginTop: '4px',
                fontSize: '11px',
                color: '#E63946',
                fontWeight: 600,
              }}>
                ⚠️ Sin unidades disponibles
              </div>
            )}
          </div>
        )}

        {/* Contadores */}
        <div style={{
          margin: '12px 16px',
          padding: '4px',
          borderRadius: '12px',
          backgroundColor: modoClaro ? '#F4F7FC' : '#141414',
          border: `1px solid ${ui.border}`,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '4px',
        }}>
          {[
            { label: 'Pendientes', count: contadores.pendiente, color: '#FFC300' },
            { label: 'En Proceso', count: contadores.en_proceso, color: '#4361EE' },
            { label: 'Culminados', count: contadores.culminado, color: '#2DC653' },
          ].map(item => (
            <div key={item.label} style={{ padding: '10px 4px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: item.color }}>{item.count}</div>
              <div style={{ fontSize: '10px', color: ui.mutedText, fontWeight: 600 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{
          padding: '8px 16px',
          display: 'flex',
          gap: '6px',
          borderBottom: `1px solid ${ui.border}`,
          overflowX: 'auto',
        }}>
          {FILTROS.map(f => {
            const selected = filtro === f;
            const isHovered = hoveredFilter === f;
            return (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                onMouseEnter={() => setHoveredFilter(f)}
                onMouseLeave={() => setHoveredFilter(null)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11.5px',
                  fontWeight: selected ? 700 : 500,
                  backgroundColor: selected
                    ? 'rgba(230, 57, 70, 0.08)'
                    : (isHovered ? (modoClaro ? 'rgba(16, 35, 61, 0.03)' : 'rgba(255, 255, 255, 0.03)') : 'transparent'),
                  color: selected ? '#E63946' : ui.mutedText,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease-in-out',
                }}
              >
                {f === 'pendiente' ? 'Pendientes' :
                  f === 'en_proceso' ? 'En Proceso' :
                    f === 'culminado' ? 'Culminados' : 'Falsas'}
              </button>
            );
          })}
        </div>

        {/* ── MODAL TESTIGOS ── */}
        {modalTestigos && (
          <div
            onClick={() => setModalTestigos(null)}
            style={{
              position: 'fixed', inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 99999, backdropFilter: 'blur(4px)',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: ui.sidebar,
                borderRadius: '20px',
                padding: '28px',
                width: '620px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                position: 'relative',
                zIndex: 100000,
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${ui.border}`,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '20px',
              }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                    Testigos de la Emergencia
                  </h2>
                  <p style={{ margin: '4px 0 0', color: ui.mutedText, fontSize: '13px' }}>
                    {iconoTipo[modalTestigos.tipo]} {modalTestigos.tipo} — {testigos.length} persona(s)
                  </p>
                </div>
                <button
                  onClick={() => setModalTestigos(null)}
                  style={{
                    background: ui.neutralButton, border: 'none',
                    borderRadius: '8px', color: 'white',
                    width: '32px', height: '32px',
                    cursor: 'pointer', fontSize: '16px',
                  }}
                >✕</button>
              </div>

              <div style={{ overflowY: 'auto', flex: 1 }}>
                {cargandoTestigos ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: ui.mutedText }}>
                    Cargando testigos...
                  </div>
                ) : testigos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: ui.mutedText }}>
                    Sin datos de testigos
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: ui.surface }}>
                        {['ROL', 'DNI', 'NOMBRE COMPLETO', 'FECHA', 'HORA'].map(col => (
                          <th key={col} style={{
                            padding: '10px 12px', textAlign: 'left',
                            fontSize: '11px', color: ui.mutedText,
                            fontWeight: 'bold', letterSpacing: '0.5px',
                            borderBottom: `1px solid ${ui.border}`,
                          }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {testigos.map((t, i) => {
                        const dt = new Date(t.fecha);
                        const fecha = dt.toLocaleDateString('es-PE');
                        const hora = dt.toLocaleTimeString('es-PE', {
                          hour: '2-digit', minute: '2-digit'
                        });
                        return (
                          <tr key={i} style={{
                            borderBottom: `1px solid ${ui.border}`,
                            backgroundColor: i % 2 === 0 ? 'transparent' : (modoClaro ? '#F7FAFD' : '#0D0D0D11'),
                          }}>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: t.rol === 'Reportante' ? '#E6394622' : '#4361EE22',
                                color: t.rol === 'Reportante' ? '#E63946' : '#4361EE',
                                whiteSpace: 'nowrap',
                              }}>
                                {t.rol === 'Reportante' ? '🚨 Reportante' : '👁️ Testigo'}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '13px' }}>
                              {t.dni}
                            </td>
                            <td style={{ padding: '12px', fontWeight: '500' }}>
                              {t.nombres} {t.apellidos}
                            </td>
                            <td style={{ padding: '12px', color: ui.mutedText, fontSize: '13px' }}>
                              {fecha}
                            </td>
                            <td style={{
                              padding: '12px',
                              color: ui.mutedText,
                              fontSize: '13px',
                              whiteSpace: 'nowrap',
                            }}>
                              {formatFecha(t.fecha)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{
                marginTop: '16px', paddingTop: '16px',
                borderTop: `1px solid ${ui.border}`,
                display: 'flex', justifyContent: 'flex-end',
              }}>
                <button
                  onClick={() => setModalTestigos(null)}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: ui.neutralButton,
                    border: 'none', borderRadius: '10px',
                    color: ui.neutralButtonText, cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista emergencias */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText, fontSize: '13px' }}>
              Cargando emergencias...
            </div>
          ) : emergenciasFiltradas.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText, fontSize: '13px' }}>
              Sin emergencias en esta categoría
            </div>
          ) : emergenciasFiltradas.map(e => {
            const isSelected = seleccionada?.id === e.id;
            const isHovered = hoveredEmergencyId === e.id;
            return (
              <div
                key={e.id}
                onClick={() => {
                  setSeleccionada(e);
                  setVistaActiva('detalle');
                  if (pulsingEmergencies[e.id]) {
                    setPulsingEmergencies(prev => {
                      const copy = { ...prev };
                      delete copy[e.id];
                      return copy;
                    });
                  }
                }}
                onMouseEnter={() => setHoveredEmergencyId(e.id)}
                onMouseLeave={() => setHoveredEmergencyId(null)}
                className={pulsingEmergencies[e.id] ? 'emergency-pulse-active' : ''}
                style={{
                  padding: '14px 16px',
                  borderBottom: `1px solid ${ui.border}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? (modoClaro ? 'rgba(230, 57, 70, 0.04)' : 'rgba(230, 57, 70, 0.1)')
                    : (isHovered ? (modoClaro ? 'rgba(16, 35, 61, 0.02)' : 'rgba(255, 255, 255, 0.02)') : 'transparent'),
                  borderLeft: `3px solid ${isSelected ? '#E63946' : 'transparent'}`,
                  transition: 'all 0.18s ease-in-out',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
                      {iconoTipo[e.tipo] || '🚨'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: ui.text }}>{e.tipo}</div>
                      <div style={{ color: ui.mutedText, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span>👥</span> {e.testigos} testigo(s)
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      backgroundColor: colorEstado[e.estado] + '18',
                      color: colorEstado[e.estado],
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {e.estado.replace('_', ' ')}
                    </div>
                    <div style={{ color: ui.softerText, fontSize: '10.5px' }}>
                      {formatFecha(e.creado_en)}
                    </div>
                  </div>
                </div>
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10.5px',
                  color: ui.softerText,
                }}>
                  <span>IA:</span>
                  <span style={{
                    color: colorEtiquetaIA[e.etiqueta_ia] || '#666',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}>
                    {e.etiqueta_ia === 'aprobado' ? 'Aprobado' :
                      e.etiqueta_ia === 'revision_manual' ? 'Revisión' : 'Rechazado'}
                  </span>
                  {e.nivel_confianza_ia !== undefined && (
                    <span>({e.nivel_confianza_ia}%)</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${ui.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ color: ui.softerText, fontSize: '11px', fontWeight: 500 }}>
            {emergenciasFiltradas.length} emergencias
          </span>
          <div style={{ display: 'flex', gap: '6px', width: '220px', alignItems: 'center' }}>

            {/* NUEVO BOTON MAPA DE CALOR */}
            <button
              onClick={() => {
                setSeleccionada(null); // Deselecciona emergencia
                setVistaActiva('mapaCalor');
              }}
              title="Ver Mapa de Calor Histórico"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 10px',
                height: '30px',
                backgroundColor: vistaActiva === 'mapaCalor'
                  ? (modoClaro ? 'rgba(230, 57, 70, 0.08)' : 'rgba(230, 57, 70, 0.15)')
                  : 'transparent',
                border: vistaActiva === 'mapaCalor'
                  ? '1px solid rgba(230, 57, 70, 0.4)'
                  : `1px solid ${ui.border}`,
                borderRadius: '6px',
                color: vistaActiva === 'mapaCalor' ? '#E63946' : ui.mutedText,
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                transition: 'all 0.15s ease-in-out',
                whiteSpace: 'nowrap',
              }}
            >
              Mapa de calor
            </button>

            {/* BOTÓN DE CAMBIO DE TEMA */}
            <button
              onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}
              onMouseEnter={() => setHoveredFooterButton('theme')}
              onMouseLeave={() => setHoveredFooterButton(null)}
              title={modoClaro ? 'Activar modo oscuro' : 'Activar modo claro'}
              style={{
                width: '32px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: hoveredFooterButton === 'theme'
                  ? (modoClaro ? 'rgba(16, 35, 61, 0.04)' : 'rgba(255, 255, 255, 0.05)')
                  : 'transparent',
                border: `1px solid ${ui.border}`,
                borderRadius: '6px',
                color: ui.text,
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              {modoClaro ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" />
                </svg>
              )}
            </button>

            {/* BOTÓN DE CERRAR SESIÓN */}
            <button
              onClick={() => {
                localStorage.removeItem('dashboard_session');
                router.push('/');
              }}
              onMouseEnter={() => setHoveredFooterButton('logout')}
              onMouseLeave={() => setHoveredFooterButton(null)}
              title="Cerrar sesión"
              style={{
                width: '32px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: hoveredFooterButton === 'logout'
                  ? 'rgba(230, 57, 70, 0.08)'
                  : 'transparent',
                border: hoveredFooterButton === 'logout'
                  ? '1px solid rgba(230, 57, 70, 0.2)'
                  : `1px solid ${ui.border}`,
                borderRadius: '6px',
                color: hoveredFooterButton === 'logout' ? '#E63946' : ui.mutedText,
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>

          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {vistaActiva === 'mapaCalor' && (
          <PanelMapaCalor ui={ui} tema={tema} />
        )}

        {vistaActiva === 'detalle' && seleccionada && (
          <PanelDetalleEmergencia
            seleccionada={seleccionada}
            ui={ui}
            tema={tema}
            accionesPermitidas={accionesPermitidas}
            estadoActualSeleccionado={estadoActualSeleccionado}
            sinUnidades={sinUnidades}
            actualizando={actualizando}
            actualizarEstado={actualizarEstado}
            ACCIONES_EMERGENCIA={ACCIONES_EMERGENCIA}
            formatFecha={formatFecha}
            verTestigos={verTestigos}
          />
        )}

        {vistaActiva === 'vacio' && (
          <VistaVacia ui={ui} />
        )}

      </div>
    </div>
  );
}