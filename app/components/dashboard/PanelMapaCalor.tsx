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

    const modoClaro = tema === 'light';

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

    // 1. Fetch histórico independiente
    useEffect(() => {
        const cargarHistorico = async () => {
            setCargando(true);
            try {
                // Usamos tu RPC existente para no crear nada nuevo en BDD
                const { data: ubicaciones } = await supabase.rpc('get_todas_ubicaciones');

                if (ubicaciones) {
                    const coords = ubicaciones.map((u: any) => {
                        const match = u.ubicacion_texto.match(/POINT\(([^ ]+) ([^)]+)\)/);
                        if (match) {
                            return [parseFloat(match[2]), parseFloat(match[1]), 1]; // [lat, lng, intensidad]
                        }
                        return null;
                    }).filter((c: any) => c !== null);

                    // Simulando filtro por mes (Para un filtro real por fecha, necesitaríamos
                    // que get_todas_ubicaciones devuelva el 'creado_en', o hacer el fetch a 'emergencias'
                    // directamente. Aquí asumiremos que filtras el array si tienes la fecha, o haces un fetch directo)
                    setCoordenadasHist(coords);
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
        if (!mapRef.current || !LRef.current || !coordenadasHist.length) return;

        if (heatLayerRef.current) {
            mapRef.current.removeLayer(heatLayerRef.current);
        }

        heatLayerRef.current = (LRef.current as any).heatLayer(coordenadasHist, {
            radius: 25,
            blur: 15,
            maxZoom: 15,
            gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
        }).addTo(mapRef.current);

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

                    <select
                        value={mesSeleccionado}
                        onChange={(e) => setMesSeleccionado(e.target.value)}
                        style={{
                            padding: '10px 16px', borderRadius: '8px',
                            backgroundColor: ui.surface, color: ui.text, border: `1px solid ${ui.border}`,
                            outline: 'none', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        {meses.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
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