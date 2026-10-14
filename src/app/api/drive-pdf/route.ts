import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'Falta el parámetro fileId' }, { status: 400 });
  }

  try {
    // Configura la autenticación (puedes usar variables de entorno para las credenciales)
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Solicita el archivo en formato binario (alt: 'media')
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Convertimos el stream de Google en un Web Stream compatible con NextResponse
    const readableStream = new ReadableStream({
      start(controller) {
        response.data.on('data', (chunk) => controller.enqueue(chunk));
        response.data.on('end', () => controller.close());
        response.data.on('error', (err) => controller.error(err));
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="documento.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Error al obtener el PDF de Drive:', error);
    return NextResponse.json({ error: 'No se pudo cargar el archivo de Google Drive' }, { status: 500 });
  }
}