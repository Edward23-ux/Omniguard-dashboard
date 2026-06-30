// app/dashboard/dashboard.styles.ts

export const FILTROS = ['pendiente', 'en_proceso', 'culminado', 'falsa_alarma'];

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

export const THEME_STORAGE_KEY = 'omniguard-dashboard-theme';

export function getUiStyles(modoClaro: boolean) {
  return {
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
}