// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAdmin } from './useAdmin';
import { getUiStyles } from './admin.styles';

type Coordenadas = {
  lat: number;
  lng: number;
};

type LeafletBundle = {
  MapContainer: any;
  TileLayer: any;
  Marker: any;
  Popup: any;
  useMapEvents: any;
};

function MapPickerCanvas({
  tema,
  coords,
  onChange,
}: {
  tema: 'dark' | 'light';
  coords: Coordenadas;
  onChange: (coords: Coordenadas) => void;
}) {
  const [leafletBundle, setLeafletBundle] = useState<LeafletBundle | null>(null);

  useEffect(() => {
    const load = async () => {
      await import('leaflet/dist/leaflet.css');
      const L = (await import('leaflet')).default;
      const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = await import('react-leaflet');

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      setLeafletBundle({ MapContainer, TileLayer, Marker, Popup, useMapEvents });
    };

    load();
  }, []);

  if (!leafletBundle) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          backgroundColor: tema === 'light' ? '#EEF4FB' : '#242424',
          color: tema === 'light' ? '#5F6B7A' : '#9DA8B8',
        }}
      >
        🗺️ Cargando mapa interactivo...
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = leafletBundle;

  function ClickSelector() {
    useMapEvents({
      click: (event: any) => {
        onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
      },
    });

    return null;
  }

  return (
    <MapContainer
      center={[coords.lat, coords.lng]}
      zoom={15}
      style={{ height: '100%', width: '100%', borderRadius: '16px' }}
    >
      <TileLayer
        url={tema === 'light'
          ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <ClickSelector />
      <Marker
        position={[coords.lat, coords.lng]}
        draggable
        eventHandlers={{
          dragend: (event: any) => {
            const marker = event.target;
            const next = marker.getLatLng();
            onChange({ lat: next.lat, lng: next.lng });
          },
        }}
      >
        <Popup>
          📍 Ubicación seleccionada<br />
          Lat: {coords.lat.toFixed(6)}<br />
          Lng: {coords.lng.toFixed(6)}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default function AdminPage() {
  const {
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
    router
  } = useAdmin();

  const modoClaro = tema === 'light';
  const ui = getUiStyles(modoClaro);

  if (!usuario) {
    return <div style={{ padding: '40px', textAlign: 'center', color: ui.text }}>Cargando...</div>;
  }

  return (
    <div style={{
      padding: '40px',
      color: ui.text,
      backgroundImage: ui.appBackground,
      backgroundColor: modoClaro ? '#EDF3FA' : '#0D0D0D',
      minHeight: '100vh',
    }}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ color: '#E63946', fontSize: '28px', marginBottom: '6px' }}>Panel de Administrador</h1>
          <p style={{ color: ui.mutedText, margin: 0 }}>Bienvenido: <strong>{usuario.nombre}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setTema(tema === 'dark' ? 'light' : 'dark')}
            style={{
              padding: '10px 16px',
              backgroundColor: ui.neutralButton,
              border: 'none',
              borderRadius: '8px',
              color: ui.neutralButtonText,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {modoClaro ? '🌙 Oscuro' : '☀️ Claro'}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('dashboard_session');
              router.push('/');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#E63946',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            🔒 Cerrar sesión
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <div style={{ backgroundColor: ui.panel, padding: '20px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${ui.border}`, boxShadow: modoClaro ? '0 10px 24px rgba(16, 35, 61, 0.06)' : 'none' }}>
          <div style={{ fontSize: '32px' }}>🚒</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#E63946' }}>{companias.length}</div>
          <div style={{ color: ui.mutedText, fontSize: '12px' }}>Compañías</div>
        </div>
        <div style={{ backgroundColor: ui.panel, padding: '20px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${ui.border}`, boxShadow: modoClaro ? '0 10px 24px rgba(16, 35, 61, 0.06)' : 'none' }}>
          <div style={{ fontSize: '32px' }}>🛡️</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#E63946' }}>
            {companias.reduce((sum, c) => sum + c.unidades_totales, 0)}
          </div>
          <div style={{ color: ui.mutedText, fontSize: '12px' }}>Unidades totales</div>
        </div>
        <div style={{ backgroundColor: ui.panel, padding: '20px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${ui.border}`, boxShadow: modoClaro ? '0 10px 24px rgba(16, 35, 61, 0.06)' : 'none' }}>
          <div style={{ fontSize: '32px' }}>✅</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2DC653' }}>
            {companias.filter(c => c.activa).length}
          </div>
          <div style={{ color: ui.mutedText, fontSize: '12px' }}>Activas</div>
        </div>
        <div style={{ backgroundColor: ui.panel, padding: '20px', borderRadius: '16px', textAlign: 'center', border: `1px solid ${ui.border}`, boxShadow: modoClaro ? '0 10px 24px rgba(16, 35, 61, 0.06)' : 'none' }}>
          <div style={{ fontSize: '32px' }}>⏸️</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFC300' }}>
            {companias.filter(c => !c.activa).length}
          </div>
          <div style={{ color: ui.mutedText, fontSize: '12px' }}>Inactivas</div>
        </div>
      </div>

      {/* Lista de compañías */}
      <div style={{ backgroundColor: ui.panel, borderRadius: '16px', overflow: 'hidden', border: `1px solid ${ui.border}`, boxShadow: modoClaro ? '0 14px 36px rgba(16, 35, 61, 0.06)' : 'none' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 80px',
          padding: '16px',
          backgroundColor: ui.surface,
          borderBottom: `1px solid ${ui.border}`,
          fontWeight: 'bold',
          fontSize: '12px',
          color: ui.mutedText,
        }}>
          <div>NOMBRE</div>
          <div>DIRECCIÓN</div>
          <div>TELÉFONO</div>
          <div>UNIDADES</div>
          <div>ESTADO</div>
          <div>ACCIONES</div>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: ui.mutedText }}>Cargando...</div>
        ) : (
          companias.map(compania => (
            <div key={compania.id} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 80px',
              padding: '16px',
              borderBottom: `1px solid ${ui.border}`,
              alignItems: 'center',
              fontSize: '14px',
            }}>
              <div style={{ fontWeight: 'bold', color: ui.text }}>{compania.nombre}</div>
              <div style={{ color: ui.mutedText, fontSize: '12px' }}>{compania.direccion}</div>
              <div style={{ color: ui.mutedText, fontSize: '12px' }}>{compania.telefono}</div>
              <div>
                {editando === compania.id ? (
                  <input
                    type="number"
                    defaultValue={compania.unidades_totales}
                    min="0"
                    max="10"
                    onBlur={(e) => actualizarUnidades(compania.id, parseInt(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        actualizarUnidades(compania.id, parseInt((e.target as HTMLInputElement).value));
                      }
                    }}
                    style={{
                      width: '60px',
                      padding: '6px',
                      backgroundColor: ui.surface,
                      border: '1px solid #E63946',
                      borderRadius: '8px',
                      color: ui.text,
                      textAlign: 'center',
                    }}
                    autoFocus
                  />
                ) : (
                  <span style={{ fontWeight: 'bold', color: '#E63946' }}>{compania.unidades_totales}</span>
                )}
              </div>
              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  backgroundColor: compania.activa ? '#2DC65322' : '#66666622',
                  color: compania.activa ? '#2DC653' : '#666666',
                }}>
                  {compania.activa ? 'ACTIVA' : 'INACTIVA'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editando === compania.id ? (
                  <button
                    onClick={() => setEditando(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                  >
                    ❌
                  </button>
                ) : (
                  <button
                    onClick={() => setEditando(compania.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    title="Editar unidades"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => toggleActiva(compania.id, compania.activa)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                  title={compania.activa ? 'Desactivar' : 'Activar'}
                >
                  {compania.activa ? '🔴' : '🟢'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón para ver dashboard de emergencias */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#E63946',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            minWidth: '260px',
            transition: 'transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease',
            boxShadow: modoClaro ? '0 12px 26px rgba(230, 57, 70, 0.22)' : '0 12px 26px rgba(230, 57, 70, 0.18)',
          }}
        >
          🚒 Ver Dashboard de Emergencias
        </button>
        <button
          onClick={abrirModalCompania}
          style={{
            padding: '12px 24px',
            backgroundColor: ui.successButton,
            border: '1px solid ' + ui.successButtonBorder,
            borderRadius: '12px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            minWidth: '260px',
            transition: 'transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease, background-color 180ms ease',
            boxShadow: modoClaro ? '0 12px 26px rgba(45, 198, 83, 0.22)' : '0 12px 26px rgba(45, 198, 83, 0.18)',
          }}
        >
          ➕ Agregar compañía
        </button>
        </div>
      </div>

      {isModalAgregarOpen && (
        <div
          onClick={cerrarModalCompania}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            backgroundColor: ui.modalBackdrop,
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(640px, 100%)',
              borderRadius: '24px',
              background: ui.modalPanel,
              border: `1px solid ${ui.modalBorder}`,
              boxShadow: modoClaro ? '0 28px 80px rgba(16, 35, 61, 0.18)' : '0 28px 80px rgba(0, 0, 0, 0.55)',
              overflow: 'hidden',
              transform: 'translateY(0)',
              transition: 'transform 220ms ease, opacity 220ms ease',
            }}
          >
            <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${ui.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ color: ui.text, fontSize: '22px', fontWeight: 800 }}>
                    ➕ Agregar compañía
                  </div>
                  <div style={{ color: ui.mutedText, fontSize: '13px', marginTop: '4px' }}>
                    Registra una nueva compañía de bomberos en el sistema.
                  </div>
                </div>
                <button
                  onClick={cerrarModalCompania}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '12px',
                    border: `1px solid ${ui.border}`,
                    backgroundColor: ui.neutralButton,
                    color: ui.neutralButtonText,
                    cursor: 'pointer',
                    fontSize: '16px',
                    transition: 'transform 180ms ease, opacity 180ms ease',
                  }}
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              {serverError && (
                <div style={{ marginBottom: '12px', color: ui.dangerText, fontWeight: 700 }}>
                  {serverError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                {[
                  {
                    key: 'nombre' as const,
                    label: 'Nombre de compañía',
                    placeholder: 'Compañía 101',
                  },
                  {
                    key: 'telefono' as const,
                    label: 'Teléfono',
                    placeholder: '987 654 321',
                  },
                ].map((field) => (
                  <label
                    key={field.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>
                      {field.label}
                    </span>
                    {(() => {
                      const value = nuevaCompania[field.key] as string;
                      let borderColor = formErrors[field.key] ? ui.dangerText : ui.fieldBorder;
                      let helper = formErrors[field.key] || '';

                      if (field.key === 'telefono') {
                        const tel = (value || '').replace(/\D/g, '');
                        if (tel.length > 0) {
                          if (tel.length === 9) {
                            borderColor = ui.fieldBorderValid;
                            helper = 'Teléfono válido';
                          } else {
                            borderColor = ui.dangerText;
                            helper = 'El teléfono debe tener 9 dígitos';
                          }
                        }
                      }

                      const isSuccessHelper = helper === 'Teléfono válido';

                      return (
                        <>
                          <input
                            type="text"
                            value={nuevaCompania[field.key] as string}
                            onChange={(event) => actualizarCampoCompania(field.key, event.target.value)}
                            placeholder={field.placeholder}
                            style={{
                              width: '100%',
                              padding: '14px 16px',
                              borderRadius: '14px',
                              border: `1px solid ${borderColor}`,
                              backgroundColor: ui.fieldBackground,
                              color: ui.text,
                              outline: 'none',
                              fontSize: '14px',
                              transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
                            }}
                          />
                          {helper && (
                            <span style={{ color: isSuccessHelper ? ui.fieldBorderValid : ui.dangerText, fontSize: '12px' }}>
                              {helper}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </label>
                ))}

                <div
                  style={{
                    gridColumn: '1 / -1',
                    display: 'flex',
                    gap: ui.formInlineFieldsGap,
                    flexWrap: 'wrap',
                  }}
                >
                  <label
                    style={{
                      flex: ui.formInlineDireccionFlex,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>
                      Dirección
                    </span>
                    <input
                      type="text"
                      value={nuevaCompania.direccion}
                      onChange={(event) => actualizarCampoCompania('direccion', event.target.value)}
                      placeholder="Av. Principal 123"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: `1px solid ${formErrors.direccion ? ui.dangerText : ui.fieldBorder}`,
                        backgroundColor: ui.fieldBackground,
                        color: ui.text,
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
                      }}
                    />
                    {formErrors.direccion && (
                      <span style={{ color: ui.dangerText, fontSize: '12px' }}>
                        {formErrors.direccion}
                      </span>
                    )}
                  </label>

                  <label
                    style={{
                      flex: ui.formInlineUnidadesFlex,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>
                      Unidades totales
                    </span>
                    <input
                      type="number"
                      value={nuevaCompania.unidadesTotales}
                      min={0}
                      onChange={(event) => actualizarCampoCompania('unidadesTotales', event.target.value)}
                      placeholder="3"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: '14px',
                        border: `1px solid ${formErrors.unidadesTotales ? ui.dangerText : ui.fieldBorder}`,
                        backgroundColor: ui.fieldBackground,
                        color: ui.text,
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease',
                      }}
                    />
                    {formErrors.unidadesTotales && (
                      <span style={{ color: ui.dangerText, fontSize: '12px' }}>
                        {formErrors.unidadesTotales}
                      </span>
                    )}
                  </label>
                </div>

                <div
                  style={{
                    gridColumn: '1 / -1',
                    border: `1px solid ${ui.border}`,
                    borderRadius: '16px',
                    padding: '14px',
                    backgroundColor: ui.surface,
                    display: 'grid',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>Ubicación geográfica</div>
                      <div style={{ fontSize: '12px', color: ui.mutedText, marginTop: '4px' }}>
                        Selecciona en el mapa para evitar errores de coordenadas.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={abrirMapPicker}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: `1px solid ${ui.successButtonBorder}`,
                        backgroundColor: ui.mapPickerButtonBackground,
                        color: ui.mapPickerButtonText,
                        cursor: 'pointer',
                        fontWeight: 800,
                        transition: 'transform 180ms ease, opacity 180ms ease',
                      }}
                    >
                      📍 Seleccionar en el mapa
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: ui.text }}>Latitud</span>
                      <input
                        type="text"
                        value={nuevaCompania.latitud}
                        readOnly
                        placeholder="Seleccionar en mapa"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: `1px solid ${formErrors.latitud ? ui.dangerText : nuevaCompania.latitud ? ui.fieldBorderValid : ui.fieldBorder}`,
                          backgroundColor: ui.fieldBackground,
                          color: ui.text,
                          fontSize: '13px',
                        }}
                      />
                      {formErrors.latitud && <span style={{ color: ui.dangerText, fontSize: '12px' }}>{formErrors.latitud}</span>}
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: ui.text }}>Longitud</span>
                      <input
                        type="text"
                        value={nuevaCompania.longitud}
                        readOnly
                        placeholder="Seleccionar en mapa"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          border: `1px solid ${formErrors.longitud ? ui.dangerText : nuevaCompania.longitud ? ui.fieldBorderValid : ui.fieldBorder}`,
                          backgroundColor: ui.fieldBackground,
                          color: ui.text,
                          fontSize: '13px',
                        }}
                      />
                      {formErrors.longitud && <span style={{ color: ui.dangerText, fontSize: '12px' }}>{formErrors.longitud}</span>}
                    </label>
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '4px 0 0' }}>
                  <div>
                    <div style={{ color: ui.text, fontSize: '13px', fontWeight: 700 }}>Estado</div>
                    <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '4px' }}>
                      Define si la compañía queda activa al registrarla.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => actualizarCampoCompania('activa', !nuevaCompania.activa)}
                    style={{
                      minWidth: '140px',
                      padding: '12px 16px',
                      borderRadius: '999px',
                      border: `1px solid ${nuevaCompania.activa ? 'rgba(45, 198, 83, 0.28)' : ui.border}`,
                      backgroundColor: nuevaCompania.activa ? 'rgba(45, 198, 83, 0.14)' : ui.neutralButton,
                      color: nuevaCompania.activa ? '#2DC653' : ui.neutralButtonText,
                      cursor: 'pointer',
                      fontWeight: 800,
                      transition: 'all 180ms ease',
                    }}
                  >
                    {nuevaCompania.activa ? 'Activa' : 'Inactiva'}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={cerrarModalCompania}
                  disabled={isSavingCompania}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: `1px solid ${ui.border}`,
                    backgroundColor: ui.neutralButton,
                    color: ui.neutralButtonText,
                    cursor: isSavingCompania ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    minWidth: '140px',
                    opacity: isSavingCompania ? 0.7 : 1,
                    transition: 'opacity 180ms ease, transform 180ms ease',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarNuevaCompania}
                  disabled={isSavingCompania}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: ui.primaryButton,
                    color: 'white',
                    cursor: isSavingCompania ? 'not-allowed' : 'pointer',
                    fontWeight: 800,
                    minWidth: '180px',
                    opacity: isSavingCompania ? 0.8 : 1,
                    boxShadow: modoClaro ? '0 14px 30px rgba(67, 97, 238, 0.22)' : '0 14px 30px rgba(79, 107, 255, 0.18)',
                    transition: 'opacity 180ms ease, transform 180ms ease, box-shadow 180ms ease',
                  }}
                >
                  {isSavingCompania ? 'Guardando...' : 'Guardar compañía'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMapPickerOpen && mapDraftCoords && (
        <div
          onClick={cerrarMapPicker}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5200,
            backgroundColor: ui.modalBackdrop,
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(900px, 100%)',
              height: 'min(620px, 88vh)',
              background: ui.mapPickerPanel,
              border: `1px solid ${ui.modalBorder}`,
              borderRadius: '22px',
              boxShadow: modoClaro ? '0 26px 70px rgba(16, 35, 61, 0.16)' : '0 26px 70px rgba(0, 0, 0, 0.46)',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto',
            }}
          >
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${ui.border}` }}>
              <div style={{ color: ui.text, fontSize: '18px', fontWeight: 800 }}>📍 Seleccionar ubicación de la compañía</div>
              <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '4px' }}>
                Haz clic en el mapa o arrastra el pin para ajustar las coordenadas.
              </div>
            </div>

            <div style={{ padding: '16px', minHeight: 0 }}>
              <MapPickerCanvas
                tema={tema}
                coords={mapDraftCoords}
                onChange={seleccionarCoordenadasEnMapa}
              />
            </div>

            <div style={{ padding: '14px 16px', borderTop: `1px solid ${ui.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ color: ui.text, fontSize: '13px' }}>
                Lat: <strong>{mapDraftCoords.lat.toFixed(6)}</strong> | Lng: <strong>{mapDraftCoords.lng.toFixed(6)}</strong>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={cerrarMapPicker}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${ui.border}`,
                    backgroundColor: ui.neutralButton,
                    color: ui.neutralButtonText,
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarCoordenadasMapa}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${ui.successButtonBorder}`,
                    backgroundColor: ui.successButton,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  Confirmar ubicación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}