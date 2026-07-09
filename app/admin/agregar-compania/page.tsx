'use client';

import { useAdminContext } from '../AdminContext';
import { useNuevaCompania } from './useNuevaCompania';
import { MapPickerCanvas } from '../components/MapPickerCanvas';

export default function AgregarCompaniaPage() {
    const { ui, modoClaro, tema } = useAdminContext();
    const {
        isSavingCompania,
        nuevaCompania,
        formErrors,
        serverError,
        isMapPickerOpen,
        mapDraftCoords,
        actualizarCampoCompania,
        abrirMapPicker,
        cerrarMapPicker,
        seleccionarCoordenadasEnMapa,
        confirmarCoordenadasMapa,
        guardarNuevaCompania,
    } = useNuevaCompania();

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ color: '#E63946', fontSize: '28px', marginBottom: '6px' }}>Agregar compañía</h1>
                <p style={{ color: ui.mutedText, margin: 0 }}>Registra una nueva compañía de bomberos en el sistema.</p>
            </div>

            <div style={{
                width: '100%',
                borderRadius: '24px',
                background: ui.modalPanel,
                border: `1px solid ${ui.modalBorder}`,
                boxShadow: modoClaro ? '0 28px 80px rgba(16, 35, 61, 0.12)' : '0 28px 80px rgba(0, 0, 0, 0.4)',
                overflow: 'hidden',
            }}>
                <div style={{ padding: '24px' }}>
                    {serverError && (
                        <div style={{ marginBottom: '12px', color: ui.dangerText, fontWeight: 700 }}>
                            {serverError}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
                        {/* Nombre de compañía */}
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>Nombre de compañía</span>
                            <input
                                type="text"
                                value={nuevaCompania.nombre}
                                onChange={(event) => actualizarCampoCompania('nombre', event.target.value)}
                                placeholder="Compañía 101"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '14px',
                                    border: `1px solid ${formErrors.nombre ? ui.dangerText : ui.fieldBorder}`,
                                    backgroundColor: ui.fieldBackground,
                                    color: ui.text,
                                    outline: 'none',
                                    fontSize: '14px',
                                }}
                            />
                            {formErrors.nombre && (
                                <span style={{ color: ui.dangerText, fontSize: '12px' }}>
                                    {formErrors.nombre}
                                </span>
                            )}
                        </label>

                        {/* Teléfono */}
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>Teléfono</span>
                            {(() => {
                                const value = nuevaCompania.telefono;
                                let borderColor = formErrors.telefono ? ui.dangerText : ui.fieldBorder;
                                let helper = formErrors.telefono || '';

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

                                const isSuccessHelper = helper === 'Teléfono válido';

                                return (
                                    <>
                                        <input
                                            type="text"
                                            value={nuevaCompania.telefono}
                                            onChange={(event) => actualizarCampoCompania('telefono', event.target.value)}
                                            placeholder="987 654 321"
                                            style={{
                                                width: '100%',
                                                padding: '14px 16px',
                                                borderRadius: '14px',
                                                border: `1px solid ${borderColor}`,
                                                backgroundColor: ui.fieldBackground,
                                                color: ui.text,
                                                outline: 'none',
                                                fontSize: '14px',
                                            }}
                                        />
                                        {helper && (
                                            <span style={{ color: isSuccessHelper ? ui.fieldBorderValid : ui.dangerText, fontSize: '12px', marginTop: '2px' }}>
                                                {helper}
                                            </span>
                                        )}
                                    </>
                                );
                            })()}
                        </label>

                        {/* Unidades Totales */}
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>Unidades totales</span>
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
                                }}
                            />
                            {formErrors.unidadesTotales && (
                                <span style={{ color: ui.dangerText, fontSize: '12px' }}>
                                    {formErrors.unidadesTotales}
                                </span>
                            )}
                        </label>

                        {/* Dirección (Ocupa 2 columnas) */}
                        <label style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>Dirección</span>
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
                                }}
                            />
                            {formErrors.direccion && (
                                <span style={{ color: ui.dangerText, fontSize: '12px' }}>{formErrors.direccion}</span>
                            )}
                        </label>

                        {/* Estado */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: ui.text }}>Estado</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '48px' }}>
                                <button
                                    type="button"
                                    onClick={() => actualizarCampoCompania('activa', !nuevaCompania.activa)}
                                    style={{
                                        minWidth: '120px',
                                        padding: '10px 16px',
                                        borderRadius: '999px',
                                        border: `1px solid ${nuevaCompania.activa ? 'rgba(45, 198, 83, 0.35)' : ui.border}`,
                                        backgroundColor: nuevaCompania.activa ? 'rgba(45, 198, 83, 0.08)' : ui.neutralButton,
                                        color: nuevaCompania.activa ? '#2DC653' : ui.neutralButtonText,
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: nuevaCompania.activa ? '0 2px 10px rgba(45, 198, 83, 0.12)' : 'none',
                                        outline: 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = nuevaCompania.activa
                                            ? '0 4px 12px rgba(45, 198, 83, 0.22)'
                                            : '0 4px 12px rgba(0, 0, 0, 0.06)';
                                        if (nuevaCompania.activa) {
                                            e.currentTarget.style.backgroundColor = 'rgba(45, 198, 83, 0.14)';
                                        } else {
                                            e.currentTarget.style.filter = 'brightness(0.95)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = nuevaCompania.activa ? '0 2px 10px rgba(45, 198, 83, 0.12)' : 'none';
                                        e.currentTarget.style.backgroundColor = nuevaCompania.activa ? 'rgba(45, 198, 83, 0.08)' : ui.neutralButton;
                                        e.currentTarget.style.filter = 'none';
                                    }}
                                >
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: nuevaCompania.activa ? '#2DC653' : ui.mutedText,
                                        transition: 'all 0.25s ease',
                                        transform: nuevaCompania.activa ? 'scale(1.2)' : 'scale(1)',
                                        boxShadow: nuevaCompania.activa ? '0 0 8px #2DC653' : 'none',
                                    }} />
                                    {nuevaCompania.activa ? 'Activa' : 'Inactiva'}
                                </button>
                                <span style={{ color: ui.mutedText, fontSize: '12px' }}>
                                    Define si la compañía queda activa al registrarla.
                                </span>
                            </div>
                        </div>

                        {/* Ubicación Geográfica (Ancho completo) */}
                        <div style={{
                            gridColumn: '1 / -1',
                            border: `1px solid ${ui.border}`,
                            borderRadius: '16px',
                            padding: '14px',
                            backgroundColor: ui.surface,
                            display: 'grid',
                            gap: '12px',
                        }}>
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
                                    }}
                                >
                                    Seleccionar en el mapa
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                                <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: ui.text }}>Latitud</span>
                                    <input
                                        type="text"
                                        value={nuevaCompania.latitud}
                                        readOnly
                                        placeholder="Se completa automáticamente"
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
                                        placeholder="Se completa automáticamente"
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
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                        <style>{`
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `}</style>
                        <button
                            onClick={guardarNuevaCompania}
                            disabled={isSavingCompania}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: ui.primaryButton,
                                color: 'white',
                                cursor: isSavingCompania ? 'not-allowed' : 'pointer',
                                fontWeight: 800,
                                minWidth: '180px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isSavingCompania ? 'none' : '0 4px 14px rgba(67, 97, 238, 0.25)',
                                opacity: isSavingCompania ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (!isSavingCompania) {
                                    e.currentTarget.style.transform = 'translateY(-1.5px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(67, 97, 238, 0.35)';
                                    e.currentTarget.style.filter = 'brightness(1.05)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = isSavingCompania ? 'none' : '0 4px 14px rgba(67, 97, 238, 0.25)';
                                e.currentTarget.style.filter = 'none';
                            }}
                            onMouseDown={(e) => {
                                if (!isSavingCompania) {
                                    e.currentTarget.style.transform = 'translateY(0.5px)';
                                }
                            }}
                            onMouseUp={(e) => {
                                if (!isSavingCompania) {
                                    e.currentTarget.style.transform = 'translateY(-1.5px)';
                                }
                            }}
                        >
                            {isSavingCompania ? (
                                <>
                                    <svg
                                        style={{
                                            animation: 'spin 1s linear infinite',
                                            width: '18px',
                                            height: '18px',
                                            color: 'currentColor',
                                        }}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            style={{ opacity: 0.25 }}
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            style={{ opacity: 0.85 }}
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span>Guardando...</span>
                                </>
                            ) : (
                                'Guardar compañía'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isMapPickerOpen && mapDraftCoords && (
                <div
                    onClick={cerrarMapPicker}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 5200,
                        backgroundColor: ui.modalBackdrop, backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                    }}
                >
                    <div
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: 'min(900px, 100%)', height: 'min(620px, 88vh)',
                            background: ui.mapPickerPanel, border: `1px solid ${ui.modalBorder}`,
                            borderRadius: '22px', overflow: 'hidden',
                            display: 'grid', gridTemplateRows: 'auto 1fr auto',
                        }}
                    >
                        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${ui.border}` }}>
                            <div style={{ color: ui.text, fontSize: '18px', fontWeight: 800 }}>📍 Seleccionar ubicación de la compañía</div>
                            <div style={{ color: ui.mutedText, fontSize: '12px', marginTop: '4px' }}>
                                Haz clic en el mapa o arrastra el pin para ajustar las coordenadas.
                            </div>
                        </div>

                        <div style={{ padding: '16px', minHeight: 0 }}>
                            <MapPickerCanvas tema={tema} coords={mapDraftCoords} onChange={seleccionarCoordenadasEnMapa} />
                        </div>

                        <div style={{ padding: '14px 16px', borderTop: `1px solid ${ui.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div style={{ color: ui.text, fontSize: '13px' }}>
                                Lat: <strong>{mapDraftCoords.lat.toFixed(6)}</strong> | Lng: <strong>{mapDraftCoords.lng.toFixed(6)}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={cerrarMapPicker} style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${ui.border}`, backgroundColor: ui.neutralButton, color: ui.neutralButtonText, cursor: 'pointer', fontWeight: 700 }}>
                                    Cancelar
                                </button>
                                <button type="button" onClick={confirmarCoordenadasMapa} style={{ padding: '10px 14px', borderRadius: '10px', border: `1px solid ${ui.successButtonBorder}`, backgroundColor: ui.successButton, color: 'white', cursor: 'pointer', fontWeight: 800 }}>
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