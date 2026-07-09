import React from 'react';

export const FILTROS = ['pendiente', 'en_proceso', 'culminado', 'falsa_alarma'];

export const colorEstado: Record<string, string> = {
  pendiente: '#FFC300',
  en_proceso: '#4361EE',
  culminado: '#2DC653',
  falsa_alarma: '#666666',
};

export const iconoTipo: Record<string, React.ReactNode> = {
  'Incendio': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#E63946', verticalAlign: 'middle' }}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  'Accidente Vehicular': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4361EE', verticalAlign: 'middle' }}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
      <path d="M9 17h6"/>
    </svg>
  ),
  'Fuga de Gas': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#06D6A0', verticalAlign: 'middle' }}>
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  'Rescate': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FF006E', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10"/>
      <path d="m4.93 4.93 4.24 4.24"/>
      <path d="m14.83 9.17 4.24-4.24"/>
      <path d="m14.83 14.83 4.24 4.24"/>
      <path d="m9.17 14.83-4.24 4.24"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  ),
  'Derrumbe': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FB8500', verticalAlign: 'middle' }}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <path d="M9 22V12h6v10"/>
      <path d="m11 5 2 5-4 2 2 3"/>
    </svg>
  ),
  'Inundación': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#00B4D8', verticalAlign: 'middle' }}>
      <path d="M2 6c.6 0 1.2-.2 1.6-.6L5 4l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L11 4l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L17 4l1.4 1.4c.4.4 1 .6 1.6.6"/>
      <path d="M2 12c.6 0 1.2-.2 1.6-.6L5 10l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L11 10l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L17 10l1.4 1.4c.4.4 1 .6 1.6.6"/>
      <path d="M2 18c.6 0 1.2-.2 1.6-.6L5 16l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L11 16l1.4 1.4c.4.4 1 .6 1.6.6s1.2-.2 1.6-.6L17 16l1.4 1.4c.4.4 1 .6 1.6.6"/>
    </svg>
  ),
  'Explosión': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#D62828', verticalAlign: 'middle' }}>
      <path d="m12 3-1.912 5.886L4.2 8.878l4.757 4.107-1.818 6.015L12 15.275l4.86 3.725-1.817-6.015 4.756-4.107-5.888-.008z"/>
    </svg>
  ),
  'Otro': (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8338EC', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
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
