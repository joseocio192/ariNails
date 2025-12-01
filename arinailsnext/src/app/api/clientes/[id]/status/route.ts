import { NextRequest, NextResponse } from 'next/server';

/**
 * PATCH /api/clientes/[id]/status
 * Habilita o deshabilita la cuenta del cliente
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Obtener token del header de autorización
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // Hacer petición directa al backend de NestJS
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
    const response = await fetch(`${backendUrl}/clientes/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error toggling cliente status:', error);
    return NextResponse.json(
      { data: null, message: error.message || 'Error al cambiar estado del cliente', isValid: false },
      { status: 500 }
    );
  }
}
