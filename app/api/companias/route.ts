import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Service route: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
}

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceRole || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic server-side validation/sanitization
    const nombre = (body.nombre || '').toString().trim();
    const direccion = (body.direccion || '').toString().trim();
    const telefono = (body.telefono || '').toString().replace(/\D/g, '').slice(0, 9);
    const latitud = Number.parseFloat((body.latitud ?? '').toString());
    const longitud = Number.parseFloat((body.longitud ?? '').toString());
    const unidades_totales = Number.parseInt(body.unidades_totales, 10) || 0;
    const activa = !!body.activa;

    if (!nombre || !direccion || !telefono) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (Number.isNaN(latitud) || latitud < -90 || latitud > 90) {
      return NextResponse.json({ error: 'Latitud inválida. Debe estar entre -90 y 90' }, { status: 400 });
    }

    if (Number.isNaN(longitud) || longitud < -180 || longitud > 180) {
      return NextResponse.json({ error: 'Longitud inválida. Debe estar entre -180 y 180' }, { status: 400 });
    }

    const ubicacion = `SRID=4326;POINT(${longitud} ${latitud})`;

    const insertPayload = {
      nombre,
      direccion,
      telefono,
      ubicacion,
      unidades_totales,
      unidades_disponibles: activa ? unidades_totales : 0,
      activa,
    };

    const { data, error } = await supabaseAdmin
      .from('companias_bomberos')
      .insert(insertPayload)
      .select();

    if (error) {
      console.error('API /api/companias - insert error details:', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      });
      return NextResponse.json({ error: error.message, details: (error as any).details }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('API /api/companias - unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { emergenciaId, companiaId } = body;

    if (!emergenciaId) {
      return NextResponse.json({ error: 'ID de emergencia es requerido' }, { status: 400 });
    }

    // Actualizamos en Supabase usando el cliente admin (service role)
    const { data, error } = await supabaseAdmin
      .from('emergencias')
      .update({ compania_asignada_id: companiaId || null })
      .eq('id', emergenciaId)
      .select();

    if (error) {
      console.error('API /api/companias (PATCH) - error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('API /api/companias (PATCH) - unexpected error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

