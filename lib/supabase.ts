import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de datos
export type Emergencia = {
  id: string
  tipo: string
  estado: string
  etiqueta_ia: string
  testigos: number
  direccion_aproximada: string | null
  nivel_confianza_ia: number
  ubicacion: string
  creado_en: string
  actualizado_en: string
  companias_bomberos: {
    nombre: string
    telefono: string
  } | null
  usuarios: {
    dni: string
    nombres: string
    apellidos: string
  } | null
}

export type CompaniaBomberos = {
  id: string
  nombre: string
  direccion: string
  telefono: string
  activa: boolean
}