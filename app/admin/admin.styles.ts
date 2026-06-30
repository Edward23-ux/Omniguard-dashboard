// app/admin/admin.styles.ts

export interface Compania {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  ubicacion?: string | null;
  unidades_disponibles: number;
  unidades_totales: number;
  activa: boolean;
}

export function getUiStyles(modoClaro: boolean) {
  return {
    appBackground: modoClaro
      ? 'radial-gradient(circle at top left, rgba(70, 97, 238, 0.14), transparent 28%), radial-gradient(circle at top right, rgba(230, 57, 70, 0.10), transparent 24%), linear-gradient(180deg, #F7FAFF 0%, #EAF1FA 100%)'
      : 'radial-gradient(circle at top left, rgba(70, 97, 238, 0.16), transparent 28%), radial-gradient(circle at top right, rgba(230, 57, 70, 0.10), transparent 24%), linear-gradient(180deg, #111111 0%, #0D0D0D 100%)',
    text: modoClaro ? '#10233D' : '#FFFFFF',
    mutedText: modoClaro ? '#5F6B7A' : '#AAAAAA',
    softerText: modoClaro ? '#7D8896' : '#666666',
    panel: modoClaro ? '#FFFFFF' : '#1A1A1A',
    surface: modoClaro ? '#F7FAFD' : '#0D0D0D',
    border: modoClaro ? '#D8E2F0' : '#2A2A2A',
    chip: modoClaro ? '#E7EEF7' : '#2A2A2A',
    chipText: modoClaro ? '#20324D' : '#AAAAAA',
    neutralButton: modoClaro ? '#E7EEF7' : '#2A2A2A',
    neutralButtonText: modoClaro ? '#20324D' : '#AAAAAA',
    primaryButton: modoClaro ? '#4361EE' : '#4F6BFF',
    primaryButtonSoft: modoClaro ? 'rgba(67, 97, 238, 0.12)' : 'rgba(79, 107, 255, 0.18)',
    primaryButtonBorder: modoClaro ? 'rgba(67, 97, 238, 0.28)' : 'rgba(79, 107, 255, 0.34)',
    // Success / positive action (used for Agregar compañía)
    successButton: modoClaro ? '#2DC653' : '#2DC653',
    successButtonSoft: modoClaro ? 'rgba(45, 198, 83, 0.12)' : 'rgba(45, 198, 83, 0.12)',
    successButtonBorder: modoClaro ? 'rgba(45, 198, 83, 0.24)' : 'rgba(45, 198, 83, 0.24)',
    modalBackdrop: modoClaro ? 'rgba(10, 18, 35, 0.58)' : 'rgba(3, 8, 18, 0.72)',
    modalPanel: modoClaro
      ? 'linear-gradient(180deg, #FFFFFF 0%, #F7FAFD 100%)'
      : 'linear-gradient(180deg, #1A1A1A 0%, #131313 100%)',
    modalBorder: modoClaro ? '#D8E2F0' : '#2A2A2A',
    fieldBackground: modoClaro ? '#FFFFFF' : '#101010',
    fieldBorder: modoClaro ? '#D8E2F0' : '#333333',
    fieldBorderFocus: modoClaro ? '#4361EE' : '#4F6BFF',
    fieldBorderValid: '#2DC653',
    mapPickerButtonBackground: modoClaro ? 'rgba(45, 198, 83, 0.12)' : 'rgba(45, 198, 83, 0.16)',
    mapPickerButtonText: '#2DC653',
    mapPickerPanel: modoClaro ? '#F7FAFD' : '#101010',
    formInlineFieldsGap: '16px',
    formInlineDireccionFlex: '2 1 320px',
    formInlineUnidadesFlex: '1 1 180px',
    dangerText: '#E63946',
  };
}