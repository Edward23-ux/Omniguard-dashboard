'use client';

import { useEffect, useState } from 'react';

interface MapaEmergenciaProps {
  ubicacion: string;
  tema?: 'dark' | 'light';
}

export default function MapaEmergencia({ ubicacion, tema = 'dark' }: MapaEmergenciaProps) {
  const [Mapa, setMapa] = useState<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [key, setKey] = useState(0); // ← Para forzar actualización
  const modoClaro = tema === 'light';

  useEffect(() => {
    // Extraer coordenadas cuando cambia la ubicación
    const match = ubicacion.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (match) {
      setCoords({
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2]),
      });
      console.log('📍 Nueva ubicación:', { lng: parseFloat(match[1]), lat: parseFloat(match[2]) });
    } else {
      setCoords({ lat: -6.7714, lng: -79.8449 });
    }

    // Forzar recreación del mapa
    setKey(prev => prev + 1);
  }, [ubicacion]); // ← Se ejecuta cada vez que cambia la ubicación

  useEffect(() => {
    // Cargar Leaflet dinámicamente SOLO en el cliente
    const loadLeaflet = async () => {
      // Importar CSS
      await import('leaflet/dist/leaflet.css');

      // Importar L y react-leaflet
      const L = (await import('leaflet')).default;
      const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');

      // Fix para los íconos
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      setMapa({ MapContainer, TileLayer, Marker, Popup });
    };

    loadLeaflet();
  }, []); // Solo se carga una vez

  if (!Mapa || !coords) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: modoClaro ? '#EEF4FB' : '#2A2A2A',
        borderRadius: '12px',
        color: modoClaro ? '#5F6B7A' : '#666',
      }}>
        🗺️ Cargando mapa...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = Mapa;

  return (
    <MapContainer
      key={key} // ← Forzar recreación del mapa cuando cambia la key
      center={[coords.lat, coords.lng]}
      zoom={15}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        url={modoClaro
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={[coords.lat, coords.lng]}>
        <Popup>
          <strong>Emergencia reportada aquí</strong>
          <br />
          Coordenadas:<br />
          Latitud: {coords.lat.toFixed(6)}<br />
          Longitud: {coords.lng.toFixed(6)}
        </Popup>
      </Marker>
    </MapContainer>
  );
}