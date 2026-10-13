# StudyNow - Lecturas & Guardado

Next.js 14 + TypeScript + Tailwind + Framer Motion + react-pdf + MongoDB Atlas (Mongoose) + NextAuth.

Plataforma de uso personal para concentracion de estudio de libros, cursos en pdf y mas.


## Configuración local
1. `npm install`
   - `MONGODB_URI`: Atlas → Connect → Drivers. En *Network Access* permite tu IP (o 0.0.0.0/0 para Vercel).
   - `NEXTAUTH_URL`: `http://localhost:3000`
   - `ADMIN_EMAIL`: quien se registre con este correo será administrador.
3. `npm run dev` → http://localhost:3000. Regístrate con `ADMIN_EMAIL` para obtener rol admin.

## Detalles de su funcionamiento

- `npm run build` sin errores.
- Registro/login, crear/editar/eliminar colección, guardar PDF, visor (zoom, páginas, claro/oscuro, pantalla completa).
- Con límite 1: el segundo PDF debe rechazarse; en /admin pulsa + y vuelve a guardar.
- Un usuario normal no debe poder abrir /admin ni llamar /api/admin/users (403).

## Uso recomendado 

- Se recomienda usar navegadores de bloqueo de anuncios como lo son brave para la ejecucion de musica en youtube o souncloud.
- Musica en spotify por restricciones solo se puede bajar el volumen desde el administrador de sonido del sistema.
