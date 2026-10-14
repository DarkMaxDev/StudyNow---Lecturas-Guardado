import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let rawUrl = searchParams.get('url') || searchParams.get('fileId');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Falta el enlace o ID del archivo' }, { status: 400 });
  }

  // Extraer limpiamente el ID de cualquier formato de enlace de Google Drive
  const match = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = match ? match[1] : rawUrl.trim();

  try {
    // Usamos el endpoint de visualización/exportación directa que no pide confirmación de virus
    const driveUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    const response = await fetch(driveUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive respondió con estado ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    // Si Google devuelve HTML, significa que el archivo no es público o pide confirmación
    if (contentType.includes('text/html')) {
      throw new Error('El archivo de Google Drive no es público o requiere permisos. Asegúrate de configurarlo como "Cualquier persona con el enlace".');
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="documento.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error detallado en drive-proxy:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}