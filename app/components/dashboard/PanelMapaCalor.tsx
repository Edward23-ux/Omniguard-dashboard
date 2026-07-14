'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface PanelMapaCalorProps {
    ui: any;
    tema: 'light' | 'dark';
}

export default function PanelMapaCalor({ ui, tema }: PanelMapaCalorProps) {
    const [mesSeleccionado, setMesSeleccionado] = useState<string>('todos');
    const [coordenadasHist, setCoordenadasHist] = useState<any[]>([]);
    const [cargando, setCargando] = useState(false);
    const mapRef = useRef<any>(null);
    const heatLayerRef = useRef<any>(null);
    const LRef = useRef<any>(null); // Guardar referencia a Leaflet
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const modoClaro = tema === 'light';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Opciones de meses para el filtro
    const meses = [
        { value: 'todos', label: 'Todo el Histórico' },
        { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' }, { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' }
    ];

    // 1. Fetch histórico independiente con filtro real por fecha
    useEffect(() => {
        const cargarHistorico = async () => {
            setCargando(true);
            try {
                // Obtener fecha de creación de cada emergencia
                const { data: emergenciasData } = await supabase
                    .from('emergencias')
                    .select('id, creado_en');

                // Obtener ubicaciones desde la función RPC
                const { data: ubicaciones } = await supabase.rpc('get_todas_ubicaciones');

                if (ubicaciones && emergenciasData) {
                    // Mapear id a creado_en para cruzar los datos
                    const mapaFechas = new Map<string, string>(
                        emergenciasData.map((e: any) => [e.id, e.creado_en])
                    );

                    const coords = ubicaciones.map((u: any) => {
                        const match = u.ubicacion_texto.match(/POINT\(([^ ]+) ([^)]+)\)/);
                        if (match) {
                            const creadoEn = mapaFechas.get(u.id);
                            return {
                                lat: parseFloat(match[2]),
                                lng: parseFloat(match[1]),
                                creadoEn: creadoEn || null
                            };
                        }
                        return null;
                    }).filter((c: any) => c !== null);

                    // Filtrar por el mes seleccionado
                    const filtradas = coords.filter((c: any) => {
                        if (mesSeleccionado === 'todos') return true;
                        if (!c.creadoEn) return false;

                        // creadoEn tiene formato YYYY-MM-DD...
                        const mes = c.creadoEn.substring(5, 7);
                        return mes === mesSeleccionado;
                    });

                    // Convertir al formato requerido por leaflet.heat: [lat, lng, intensidad]
                    const heatCoords = filtradas.map((c: any) => [c.lat, c.lng, 1]);

                    setCoordenadasHist(heatCoords);
                }
            } catch (error) {
                console.error('Error cargando histórico:', error);
            } finally {
                setCargando(false);
            }
        };
        cargarHistorico();
    }, [mesSeleccionado]);

    // 2. Inicialización del Mapa Nativo de Leaflet para el Heatmap
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initMap = async () => {
            await import('leaflet/dist/leaflet.css');
            const L = (await import('leaflet')).default;
            await import('leaflet.heat'); // Importar el plugin
            LRef.current = L;

            if (!mapRef.current) {
                mapRef.current = L.map('heatmap-container').setView([-6.7714, -79.8449], 13); // Centro por defecto

                L.tileLayer(
                    modoClaro
                        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                    { attribution: '© OpenStreetMap' }
                ).addTo(mapRef.current);
            }
        };

        initMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [modoClaro]);

    // 3. Actualizar la capa de calor cuando cambia la data
    useEffect(() => {
        if (!mapRef.current || !LRef.current) return;

        if (heatLayerRef.current) {
            mapRef.current.removeLayer(heatLayerRef.current);
            heatLayerRef.current = null;
        }

        if (coordenadasHist.length > 0) {
            heatLayerRef.current = (LRef.current as any).heatLayer(coordenadasHist, {
                radius: 25,
                blur: 15,
                maxZoom: 15,
                gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
            }).addTo(mapRef.current);
        }

    }, [coordenadasHist]);

    return (
        <div style={{ height: '100%', padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                backgroundColor: ui.panel, borderRadius: '16px', border: `1px solid ${ui.border}`,
                padding: '20px', display: 'flex', flexDirection: 'column', height: '100%'
            }}>
                {/* Header y Filtro */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ color: ui.text, fontSize: '24px', margin: '0 0 4px 0' }}>Mapa de Calor Histórico</h2>
                        <p style={{ color: ui.mutedText, margin: 0, fontSize: '13px' }}>
                            Zonas de mayor concentración de emergencias en la ciudad.
                        </p>
                    </div>

                    <div ref={containerRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                backgroundColor: ui.surface,
                                color: ui.text,
                                border: `1px solid ${ui.border}`,
                                outline: 'none',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '13.5px',
                                boxShadow: modoClaro ? '0 4px 12px rgba(16, 35, 61, 0.03)' : 'none',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            <span>{meses.find(m => m.value === mesSeleccionado)?.label}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                    color: ui.mutedText
                                }}
                            >
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>

                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                width: '280px',
                                backgroundColor: ui.panel,
                                border: `1px solid ${ui.border}`,
                                borderRadius: '16px',
                                padding: '12px',
                                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.15)',
                                zIndex: 9999,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                animation: 'fadeInUp 0.18s ease-out'
                            }}>
                                <button
                                    onClick={() => {
                                        setMesSeleccionado('todos');
                                        setDropdownOpen(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: mesSeleccionado === 'todos' ? '#E63946' : 'transparent',
                                        color: mesSeleccionado === 'todos' ? '#FFFFFF' : ui.text,
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    Todo el Histórico
                                </button>

                                <div style={{
                                    height: '1px',
                                    backgroundColor: ui.border,
                                    margin: '4px 0'
                                }} />

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '6px'
                                }}>
                                    {meses.slice(1).map(m => {
                                        const activo = mesSeleccionado === m.value;
                                        return (
                                            <button
                                                key={m.value}
                                                onClick={() => {
                                                    setMesSeleccionado(m.value);
                                                    setDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '8px 4px',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    backgroundColor: activo ? '#E63946' : (modoClaro ? 'rgba(16, 35, 61, 0.03)' : 'rgba(255, 255, 255, 0.04)'),
                                                    color: activo ? '#FFFFFF' : ui.text,
                                                    fontWeight: 500,
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    fontSize: '12.5px',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {m.label.substring(0, 3)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenedor del Mapa */}
                <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                    {cargando && (
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 1000,
                            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }}>Cargando histórico...</div>
                    )}
                    <div id="heatmap-container" style={{ width: '100%', height: '100%', zIndex: 1 }}></div>
                </div>
            </div>
        </div>
    );
}