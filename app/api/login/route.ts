import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log('🔍 Intentando login con:', email);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario en la tabla usuarios_dashboard
    const { data: usuario, error } = await supabase
      .from('usuarios_dashboard')
      .select('id, email, nombre, rol, compania_id')
      .eq('email', email)
      .single();

    console.log('📦 Usuario encontrado:', usuario);

    if (error || !usuario) {
      console.log('❌ Error o usuario no encontrado:', error);
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Comparar contraseña (temporal: texto plano)
    // Las contraseñas que insertamos son 'admin123' y 'bomberos123'
    const passwordValida = (password === 'admin123' || password === 'bomberos123');
    
    console.log('🔐 Contraseña válida?', passwordValida);

    if (!passwordValida) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Login exitoso
    console.log('✅ Login exitoso para:', usuario.nombre);
    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        compania_id: usuario.compania_id,
      },
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}