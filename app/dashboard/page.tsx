'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import MapaEmergencia from '@/app/components/MapaEmergencia';
import NuevaEmergenciaPopup from '@/app/components/NuevaEmergenciaPopup';

const FILTROS = ['pendiente', 'en_proceso', 'culminado', 'falsa_alarma'];

const colorEstado: Record<string, string> = {
  pendiente: '#FFC300',
  en_proceso: '#4361EE',
  culminado: '#2DC653',
  falsa_alarma: '#666666',
};

const iconoTipo: Record<string, string> = {
  'Incendio': '🔥',
  'Accidente Vehicular': '🚗',
  'Fuga de Gas': '💨',
  'Rescate': '🆘',
  'Derrumbe': '🏚️',
  'Inundación': '🌊',
  'Explosión': '💥',
  'Otro': '🚨',
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
};

const ACCIONES_EMERGENCIA: AccionEmergencia[] = [
  { estado: 'pendiente', label: '⏳ Pendiente', color: '#B38A2D' },
  { estado: 'en_proceso', label: '🚒 Atender', color: '#3B82F6' },
  { estado: 'culminado', label: '✅ Culminar', color: '#22C55E' },
  { estado: 'falsa_alarma', label: '❌ Falsa Alarma', color: '#E63946' },
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
  const [emergencias, setEmergencias] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('pendiente');
  const [tema, setTema] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const temaGuardado = localStorage.getItem(THEME_STORAGE_KEY);
    if (temaGuardado === 'dark' || temaGuardado === 'light') {
      setTema(temaGuardado);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
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
          direccion_aproximada, nivel_confianza_ia,
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
    try {
      const { data: emergenciaActual } = await supabase
        .from('emergencias')
        .select('estado, compania_asignada_id')
        .eq('id', id)
        .single();

      if (!emergenciaActual) return;

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
          toast.error('🚨 Sin unidades disponibles. No se puede atender.');
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
        toast.success(`✅ ${nuevoEstado.replace('_', ' ').toUpperCase()}`);
        await cargarEmergencias();
        if (companiaId) await cargarCompania(companiaId);
      } else {
        toast.error('Error al actualizar estado');
      }
    } catch (error) {
      toast.error('Error de conexión');
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

  const emergenciasFiltradas = emergencias.filter(e => e.estado === filtro);

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
      <NuevaEmergenciaPopup
        emergencia={nuevaEmergenciaAsignada}
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
        width: '380px', backgroundColor: ui.sidebar,
        borderRight: `1px solid ${ui.border}`, display: 'flex', flexDirection: 'column',
        boxShadow: modoClaro ? '0 16px 40px rgba(16, 35, 61, 0.08)' : 'none',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px', borderBottom: `1px solid ${ui.border}`,
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', backgroundColor: '#E63946',
            borderRadius: '10px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '20px',
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', color: ui.text }}>OmniGuard</div>
            <div style={{ color: ui.mutedText, fontSize: '12px' }}>
              {usuario.rol === 'admin' ? 'Administrador' : `${usuario.nombre}`}
            </div>
          </div>
          <div style={{
            marginLeft: 'auto', width: '10px', height: '10px',
            backgroundColor: '#2DC653', borderRadius: '50%',
          }} title="Conectado en tiempo real" />
        </div>

        {/* Contador unidades */}
        {usuario.rol !== 'admin' && unidadesDisponibles !== null && (
          <div style={{
            margin: '12px',
            padding: '16px',
            backgroundColor: ui.cardSoft,
            borderRadius: '12px',
            border: `1px solid ${sinUnidades ? '#E63946' : '#2DC653'}`,
            textAlign: 'center',
            boxShadow: modoClaro ? '0 10px 24px rgba(16, 35, 61, 0.06)' : 'none',
          }}>
            <div style={{ fontSize: '11px', color: ui.mutedText, marginBottom: '4px' }}>
              🚒 UNIDADES DISPONIBLES
            </div>
            <div style={{
              fontSize: '40px', fontWeight: 'bold',
              color: sinUnidades ? '#E63946' : '#2DC653',
            }}>
              {unidadesDisponibles}
            </div>
            <div style={{ fontSize: '11px', color: ui.softerText }}>
              de {unidadesTotales} totales
            </div>
            {sinUnidades && (
              <div style={{
                marginTop: '8px', fontSize: '11px',
                color: '#E63946', fontWeight: 'bold',
              }}>
                ⚠️ Sin unidades — no se puede atender
              </div>
            )}
          </div>
        )}

        {/* Contadores */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '1px', backgroundColor: ui.border, borderBottom: `1px solid ${ui.border}`,
        }}>
          {[
            { label: 'Pendientes', count: contadores.pendiente, color: '#FFC300' },
            { label: 'En Proceso', count: contadores.en_proceso, color: '#4361EE' },
            { label: 'Culminados', count: contadores.culminado, color: '#2DC653' },
          ].map(item => (
            <div key={item.label} style={{ backgroundColor: ui.card, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: item.color }}>{item.count}</div>
              <div style={{ fontSize: '11px', color: ui.mutedText }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${ui.border}`,
          display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '8px',
        }}>
          {FILTROS.map(f => (
            <button key={f} onClick={() => setFiltro(f)} style={{
              width: '100%', padding: '4px 12px', borderRadius: '20px', border: 'none',
              cursor: 'pointer', fontSize: '12px',
              fontWeight: filtro === f ? 'bold' : 'normal',
              backgroundColor: filtro === f ? '#E63946' : ui.chip,
              color: filtro === f ? 'white' : '#AAAAAA',
              whiteSpace: 'nowrap',
            }}>
              {f === 'pendiente' ? 'Pendiente' :
                f === 'en_proceso' ? 'EnProceso' :
                  f === 'culminado' ? 'Culminado' : 'Falsas'}
            </button>
          ))}
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
                    👥 Testigos de la Emergencia
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
                              {hora}
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
            <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText }}>
              Cargando emergencias...
            </div>
          ) : emergenciasFiltradas.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText }}>
              ✅ Sin emergencias en esta categoría
            </div>
          ) : emergenciasFiltradas.map(e => (
            <div key={e.id} onClick={() => setSeleccionada(e)} style={{
              padding: '16px', borderBottom: `1px solid ${ui.border}`,
              cursor: 'pointer',
              backgroundColor: seleccionada?.id === e.id ? (modoClaro ? '#EAF1FA' : '#2A2A2A') : 'transparent',
              borderLeft: seleccionada?.id === e.id ? '3px solid #E63946' : '3px solid transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px' }}>{iconoTipo[e.tipo] || '🚨'}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: ui.text }}>{e.tipo}</div>
                    <div style={{ color: ui.mutedText, fontSize: '12px' }}>👥 {e.testigos} testigo(s)</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                    backgroundColor: colorEstado[e.estado] + '22',
                    color: colorEstado[e.estado], fontWeight: 'bold',
                  }}>
                    {e.estado.toUpperCase().replace('_', ' ')}
                  </div>
                  <div style={{ color: ui.softerText, fontSize: '11px', marginTop: '4px' }}>
                    {formatFecha(e.creado_en)}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: ui.softerText }}>IA:</span>
                <span style={{
                  fontSize: '11px',
                  color: colorEtiquetaIA[e.etiqueta_ia] || '#666',
                  fontWeight: 'bold',
                }}>
                  {e.etiqueta_ia === 'aprobado' ? '✅ Aprobado' :
                    e.etiqueta_ia === 'revision_manual' ? '⚠️ Revisión Manual' :
                      e.etiqueta_ia === 'rechazado' ? '❌ Rechazado' : '⏳ Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px', borderTop: `1px solid ${ui.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: ui.softerText, fontSize: '12px' }}>
            {emergenciasFiltradas.length} emergencia(s)
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')} style={{
              padding: '6px 12px',
              backgroundColor: ui.neutralButton,
              border: 'none',
              borderRadius: '8px',
              color: ui.neutralButtonText,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              {modoClaro ? '🌙 Oscuro' : '☀️ Claro'}
            </button>
            <button onClick={() => {
              localStorage.removeItem('dashboard_session');
              router.push('/');
            }} style={{
              padding: '6px 12px', backgroundColor: '#E63946',
              border: 'none', borderRadius: '8px',
              color: 'white', cursor: 'pointer', fontSize: '12px',
            }}>Cerrar Sesión</button>
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {seleccionada ? (
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
                {ACCIONES_EMERGENCIA.map((accion) => {
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

                  const title = esEstadoActual
                    ? 'Ya es el estado actual'
                    : bloqueadoPorUnidades
                      ? 'Sin unidades disponibles'
                      : !esAccionPermitida
                        ? 'No disponible para el estado actual'
                        : '';

                  return (
                    <button
                      key={accion.estado}
                      onClick={() => actualizarEstado(seleccionada.id, accion.estado)}
                      disabled={deshabilitado}
                      title={title}
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
                        transition: 'background-color 180ms ease, color 180ms ease, border-color 180ms ease, opacity 180ms ease, box-shadow 180ms ease, transform 180ms ease',
                      }}
                    >
                      {accion.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── SECCIÓN DE DETALLE DE DOS COLUMNAS ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-[16px] mb-[16px] items-stretch">

              {/* Columna Izquierda: Tarjetas apiladas verticalmente */}
              <div className="flex flex-col gap-[16px]">

                {/* 📍 Dirección aproximada */}
                <div style={{
                  backgroundColor: ui.panel, borderRadius: '16px',
                  padding: '14px 16px', border: `1px solid ${ui.border}`,
                }}>
                  <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 6px' }}>
                    📍 DIRECCIÓN APROXIMADA
                  </h3>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', wordBreak: 'break-word', color: ui.text }}>
                    {seleccionada.direccion_aproximada || 'No disponible'}
                  </div>
                  <div style={{ color: ui.mutedText, fontSize: '13px', marginTop: '4px' }}>
                    {seleccionada.creado_en ? formatFecha(seleccionada.creado_en) : '-'}
                  </div>
                </div>

                {/* 👥 Testigos */}
                <div style={{
                  backgroundColor: ui.panel, borderRadius: '16px',
                  padding: '14px 16px', border: `1px solid ${ui.border}`,
                }}>
                  <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 6px' }}>
                    👥 TESTIGOS
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#E63946', lineHeight: 1 }}>
                        {seleccionada.testigos}
                      </div>
                      <div style={{ color: ui.mutedText, fontSize: '13px', marginTop: '4px' }}>
                        usuario(s) reportando
                      </div>
                    </div>
                    <button
                      onClick={() => verTestigos(seleccionada)}
                      title="Ver lista de testigos"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        backgroundColor: '#4361EE22',
                        border: '1px solid #4361EE44',
                        borderRadius: '10px',
                        color: '#4361EE',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4361EE44')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4361EE22')}
                    >
                      👁️ Ver
                    </button>
                  </div>
                </div>

                {/* 🔍 Ver Detalles (Ciudadano + IA) */}
                <div style={{
                  backgroundColor: ui.panel, borderRadius: '16px',
                  padding: '14px 16px', border: `1px solid ${ui.border}`,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                }}>
                  <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 6px' }}>
                    🔍 DETALLES
                  </h3>

                  {/* Preview rápido */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: ui.text, marginBottom: '4px' }}>
                      {seleccionada.usuarios?.nombres} {seleccionada.usuarios?.apellidos}
                    </div>
                    <div style={{ fontSize: '12px', color: ui.mutedText, marginBottom: '8px' }}>
                      DNI: {seleccionada.usuarios?.dni}
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 'bold',
                      color: colorEtiquetaIA[seleccionada.etiqueta_ia],
                    }}>
                      {seleccionada.etiqueta_ia === 'aprobado' ? '✅' :
                        seleccionada.etiqueta_ia === 'revision_manual' ? '⚠️' : '❌'}
                      {' '}{seleccionada.nivel_confianza_ia}% confianza IA
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => console.log('Ver evidencia clickeado')}
                      title="Ver evidencia de la emergencia"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        backgroundColor: '#4361EE22',
                        border: '1px solid #4361EE44',
                        borderRadius: '10px',
                        color: '#4361EE',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#4361EE44')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#4361EE22')}
                    >
                      👁️ Ver evidencia
                    </button>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Mapa de ubicación */}
              <div style={{
                backgroundColor: ui.panel, borderRadius: '16px',
                padding: '20px',
                border: `1px solid ${ui.border}`,
                display: 'flex',
                flexDirection: 'column',
              }} className="h-[350px] lg:h-auto">
                <h3 style={{ color: ui.mutedText, fontSize: '12px', margin: '0 0 12px' }}>
                  🗺️ UBICACIÓN DE LA EMERGENCIA
                </h3>
                <div style={{ flex: 1, minHeight: '280px', borderRadius: '12px', overflow: 'hidden' }}>
                  <MapaEmergencia ubicacion={seleccionada.ubicacion} tema={tema} />
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: ui.mutedText,
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛡️</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: ui.text }}>
              OmniGuard Dashboard
            </div>
            <div style={{ marginTop: '8px', fontSize: '14px' }}>
              Selecciona una emergencia para ver los detalles
            </div>
          </div>
        )}
      </div>
    </div>
  );
}