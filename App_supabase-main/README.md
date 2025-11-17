# Aplicación de Chat con Ionic y Supabase

Aplicación de chat en tiempo real desarrollada con Ionic, Angular y Supabase. Permite a los usuarios registrarse, iniciar sesión y enviar mensajes en un chat grupal.

## Características

- Autenticación de usuarios (registro e inicio de sesión)
- Chat en tiempo real
- Visualización de mensajes con nombre de autor y marca de tiempo
- Interfaz responsiva
- Despliegue en Firebase Hosting

## Tecnologías utilizadas

- **Frontend**:
  - Ionic 7
  - Angular 16+
  - TypeScript
  - HTML5
  - SCSS

- **Backend (BaaS)**:
  - Supabase (Autenticación y Base de datos)

- **Despliegue**:
  - Firebase Hosting

## Requisitos previos

- Node.js 16+ y npm 8+
- Ionic CLI: `npm install -g @ionic/cli`
- Firebase CLI: `npm install -g firebase-tools`
- Cuenta en [Supabase](https://supabase.com/)
- Cuenta en [Firebase](https://firebase.google.com/)

## Configuración del proyecto

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd misupalogin
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. Configura la base de datos en Supabase:
   - Crea una tabla `messages` con las siguientes columnas:
     - `id` (uuid, primary key)
     - `content` (text)
     - `autor` (text)
     - `created_at` (timestamp with time zone, default: now())
   - Habilita RLS (Row Level Security) según sea necesario

## Ejecución local

1. Inicia el servidor de desarrollo:
   ```bash
   ionic serve
   ```

2. La aplicación estará disponible en: `http://localhost:8100`

## Construir para producción

```bash
# Construir la aplicación
ionic build --prod

# Verificar la carpeta de salida (por defecto: www/)
```

## Despliegue en Firebase Hosting

1. Inicia sesión en Firebase:
   ```bash
   firebase login
   ```

2. Inicializa Firebase (si no lo has hecho):
   ```bash
   firebase init
   ```
   - Selecciona **Hosting**
   - Usa un proyecto existente
   - Directorio público: `www`
   - Configura como SPA: **Sí**
   - Sobrescribir index.html: **No**

3. Despliega la aplicación:
   ```bash
   firebase deploy --only hosting
   ```

4. La aplicación estará disponible en la URL proporcionada por Firebase (generalmente `https://[nombre-del-proyecto].web.app`)

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   └── supabase.service.ts  # Servicio para interactuar con Supabase
│   ├── pages/
│   │   ├── home/               # Página principal del chat
│   │   └── login/              # Página de inicio de sesión/registro
│   ├── app.component.ts        # Componente raíz
│   └── app.routes.ts           # Configuración de rutas
├── environments/               # Variables de entorno
└── assets/                     # Recursos estáticos
```

## Configuración de Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/)
2. Habilita la autenticación por correo/contraseña
3. Crea la tabla `messages` con las columnas mencionadas anteriormente
4. Configura las políticas de RLS según sea necesario

## Solución de problemas

- **Error de CORS**: Asegúrate de que los dominios permitidos en Supabase incluyan tu URL de desarrollo (`http://localhost:8100`) y producción.
- **Problemas de autenticación**: Verifica que las credenciales de Supabase sean correctas y que la autenticación esté habilitada.
- **Errores de compilación**: Asegúrate de tener instaladas todas las dependencias con `npm install`.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más información.

## Desarrollado por

[Nombre del desarrollador] - [Correo electrónico]

---

¡Gracias por usar esta aplicación de chat! Si tienes preguntas o sugerencias, no dudes en abrir un issue en el repositorio.
