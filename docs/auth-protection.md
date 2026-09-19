# Protección de autenticación

## Política

| Ruta | Clave | Máximo | Ventana |
|---|---|---|---|
| POST /api/auth/login | IP | 30 solicitudes | 15 minutos |
| POST /api/auth/login | Correo normalizado | 10 solicitudes | 15 minutos |
| POST /api/auth/register | IP | 10 solicitudes | 1 hora |

Se cuentan solicitudes correctas e incorrectas. El límite por IP se aplica antes del de cuenta y ambos antes de ejecutar el controlador. El correo se normaliza con trim y minúsculas, igual que en autenticación. Los correos inválidos no crean contadores de cuenta, pero consumen el límite por IP. No se consulta si una cuenta existe para decidir el bloqueo. GET /api/auth/me conserva su autenticación habitual y no consume estos contadores.

Al superar un límite se responde HTTP 429 con `{success:false,message:"Demasiados intentos. Inténtalo de nuevo más tarde."}`, cabecera `Retry-After` en segundos y cabeceras estándar `RateLimit` y `RateLimit-Policy`. El cliente muestra el mensaje de error de la API. Al caducar la ventana vuelve a permitirse el acceso. Un tercero puede agotar temporalmente el límite de una cuenta conocida; esta política no debe interpretarse como un bloqueo permanente de usuario.

## Contraseñas

El registro exige al menos 8 caracteres (longitud JavaScript) y como máximo 72 bytes UTF-8, el límite de entrada de bcrypt. El login del servidor admite contraseñas no vacías hasta 72 bytes para conservar compatibilidad con cuentas anteriores. Los formularios conservan su mínimo existente de 8 caracteres y comprueban el máximo mediante TextEncoder. No se recortan espacios ni se trunca la contraseña. Una entrada demasiado larga devuelve HTTP 400 antes de consultar usuarios o ejecutar bcrypt.

Los hashes históricos no indican la longitud original de la contraseña. Estas validaciones no reparan las cuentas que se hubieran creado con más de 72 bytes: se rechaza el texto completo y un prefijo equivalente puede seguir coincidiendo con el hash antiguo. Antes del despliegue debe evaluarse si hay cuentas afectadas y preparar una recuperación controlada. No se modifica ni elimina ninguna cuenta con este cambio.

## Condiciones de despliegue

- Los contadores usan MemoryStore y pertenecen a un único proceso. Se reinician al reiniciar el servidor. Varias instancias requieren un almacén compartido antes del despliegue; no se ha añadido Redis ni otra dependencia para ello.
- Las claves de cuenta son HMAC SHA-256 con un secreto aleatorio generado al crear los limitadores. No se guardan correos en los contadores ni se registran contraseñas, claves o secretos.
- La expiración limita la duración de los contadores, no el número de claves. Un ataque distribuido puede aumentar el consumo de memoria; supervisar recursos y complementar con protección de infraestructura cuando se despliegue.
- Se conserva `trust proxy=false`: cabeceras reenviadas por el cliente no determinan su IP. Antes de desplegar detrás de un proxy, configurar únicamente los proxies o saltos realmente confiables. De lo contrario, todas las solicitudes pueden compartir la IP del proxy y agotar el mismo cupo. No activar confianza global sin conocer la topología.
- El generador de IP predeterminado de express-rate-limit agrupa IPv6 por subred /56. Usuarios detrás de una misma IP pública comparten cupo.

## Verificación

Ejecutar `npm test` y `npm run build` en server, y `npm run lint` y `npm run build` en client. Las pruebas de contraseñas cubren límites ASCII, acentos y emojis, conservación de espacios y rechazo antes de BD/bcrypt. Las pruebas de límites ejercitan HTTP, cuotas, normalización, aislamiento, cabeceras y recuperación tras la ventana. No requieren credenciales ni una base de datos de producción.
