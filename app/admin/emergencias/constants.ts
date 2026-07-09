export const colorEstado: Record<string, string> = {
    pendiente: '#FFC300',
    en_proceso: '#4361EE',
    culminado: '#2DC653',
    falsa_alarma: '#666666',
};

export const iconoTipo: Record<string, string> = {
    'Incendio': '🔥',
    'Accidente Vehicular': '🚗',
    'Fuga de Gas': '💨',
    'Rescate': '🆘',
    'Derrumbe': '🏚️',
    'Inundación': '🌊',
    'Explosión': '💥',
    'Otro': '🚨',
};

export const colorEtiquetaIA: Record<string, string> = {
    aprobado: '#2DC653',
    revision_manual: '#FFC300',
    rechazado: '#E63946',
    pendiente: '#666666',
};

// NUEVO
export const FILTROS_ESTADO = ['pendiente', 'en_proceso', 'culminado', 'falsa_alarma'] as const;

export const labelFiltro: Record<string, string> = {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    culminado: 'Culminado',
    falsa_alarma: 'Falsa Alarma',
};