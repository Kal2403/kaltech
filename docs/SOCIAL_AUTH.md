# Guía de Configuración: Autenticación Social (Google & Facebook) en KalTech

Esta guía describe los pasos necesarios para habilitar el registro e inicio de sesión con **Google (Gmail)** y **Facebook** en KalTech, tanto en entornos de desarrollo local como en producción.

---

## 1. Google Identity Services (Google OAuth 2.0)

### Paso A: Crear o seleccionar un proyecto en Google Cloud
1. Ingresa a la [Consola de Google Cloud](https://console.cloud.google.com/).
2. Crea un proyecto nuevo (por ejemplo: `kaltech-ecommerce`) o selecciona uno existente.

### Paso B: Configurar la Pantalla de Consentimiento OAuth
1. En el menú lateral, dirígete a **APIs y servicios** > **Pantalla de consentimiento de OAuth**.
2. Selecciona **Externo** y haz clic en **Crear**.
3. Completa los datos obligatorios:
   - **Nombre de la aplicación**: `KalTech`
   - **Correo de asistencia del usuario**: Tu correo de contacto.
   - **Logotipo de la aplicación**: (Opcional en desarrollo).
   - **Datos de contacto del desarrollador**: Tu correo.
4. En **Permisos (Scopes)**, asegúrate de tener seleccionados los permisos básicos:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Si el estado es "En pruebas", añade los correos de prueba que usarás durante el desarrollo.

### Paso C: Crear Credenciales de Cliente OAuth
1. Ve a **APIs y servicios** > **Credenciales**.
2. Haz clic en **+ Crear credenciales** > **ID de cliente de OAuth**.
3. Tipo de aplicación: **Aplicación web**.
4. Nombre: `KalTech Web Client`.
5. **Orígenes autorizados de JavaScript**:
   - En desarrollo:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
   - En producción:
     - `https://tudominio.com`
     - `https://www.tudominio.com`
6. Haz clic en **Crear**.
7. Copia el **ID de cliente** generado (por ejemplo: `1234567890-abcdef.apps.googleusercontent.com`).

---

## 2. Meta for Developers (Facebook Login)

### Paso A: Crear una App en Meta for Developers
1. Ingresa a [Meta for Developers](https://developers.facebook.com/).
2. Inicia sesión y ve a **Mis apps** > **Crear app**.
3. Selecciona el caso de uso **Autenticar y solicitar datos a usuarios con Facebook Login**.
4. Selecciona la plataforma **Web**.
5. Asigna el nombre de la app (ej. `KalTech`).

### Paso B: Configurar Facebook Login
1. En el panel de la app, accede a **Facebook Login** > **Configuración**.
2. Asegúrate de tener activado:
   - **Inicio de sesión con SDK de JavaScript**: Sí.
   - **Dominios permitidos para el SDK de JavaScript**:
     - `http://localhost:5173` (para pruebas locales).
     - `https://tudominio.com` (producción).
3. En **Configuración básica de la app**:
   - Copia el **Identificador de la app (App ID)**.
   - Copia la **Clave secreta de la app (App Secret)**.

---

## 3. Configuración de Variables de Entorno

Una vez obtenidas las credenciales, agrégalas a tus archivos de entorno:

### En el Servidor (`server/.env`):
```env
# Google OAuth
GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com

# Facebook OAuth
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abcdef0123456789abcdef0123456789
```

### En el Cliente Web (`client/.env`):
```env
# Google OAuth (público)
VITE_GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com

# Facebook OAuth (público)
VITE_FACEBOOK_APP_ID=123456789012345
```

---

## 4. Comportamiento y Seguridad en KalTech

### Vinculación de Cuentas Inteligente
- Si un usuario ya tiene una cuenta creada con contraseña e inicia sesión con el mismo correo mediante Google o Facebook:
  - El sistema **vincula automáticamente** su proveedor social (`googleId` o `facebookId`) a la cuenta existente.
  - Se preservan intactos su historial de pedidos, direcciones de envío y carrito de compras.
  - El usuario puede iniciar sesión en adelante indistintamente con su contraseña o mediante el botón social.

### Cuentas Nuevas creadas por Redes Sociales
- Los usuarios que se registran por primera vez con Google o Facebook:
  - Reciben el rol `"customer"` con cuenta activa (`isActive: true`).
  - Su foto de perfil (avatar) se sincroniza automáticamente desde Google o Facebook.
  - Se despacha en segundo plano el correo de bienvenida.
  - No requieren contraseña para ingresar. Si en el futuro desean establecer una contraseña tradicional, pueden utilizar la opción *"¿Olvidaste tu contraseña?"* en la pantalla de inicio de sesión.
