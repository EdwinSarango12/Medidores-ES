# Aplicación de Medidores de Agua - Distrito Metropolitano de Quito

Aplicación móvil desarrollada en Ionic para el registro y validación de lecturas de medidores de agua.

## 🚀 Características Principales

### 🔐 Autenticación Segura
- **Inicio de Sesión (Login)**
  - Autenticación segura con Supabase
  - Validación de credenciales
  - Recuperación de contraseña
  - Redirección según rol de usuario

- **Registro de Usuarios**
  - Formulario de registro con validaciones
  - Creación de perfiles de usuario
  - Asignación de roles (Administrador/Medidor)
  - Almacenamiento seguro en Supabase

### 📱 Interfaz por Pestañas
La aplicación utiliza un diseño de pestañas para una navegación intuitiva:

1. **Tab 1: Inicio/Lista de Lecturas**
   - Visualización de lecturas existentes
   - Filtrado por fechas y usuarios
   - Acceso rápido a detalles

2. **Tab 2: Nueva Lectura**
   - Formulario para registro de lecturas
   - Captura de fotos del medidor y fachada
   - Registro de ubicación GPS
   - Campos para observaciones

3. **Tab 3: Perfil**
   - Información del usuario
   - Configuración de cuenta
   - Cerrar sesión

### 📊 Funcionalidades Adicionales
- Registro de lecturas con:
  - 📸 Fotografía del medidor
  - 🏠 Fotografía de la fachada
  - 📍 Ubicación GPS (latitud y longitud)
  - 🔢 Valor del medidor
  - 📝 Observaciones adicionales
- Visualización de lecturas con enlaces a Google Maps
- Permisos diferenciados por rol:
  - 👑 **Administrador**: Acceso completo a todas las lecturas
  - 👷 **Medidor**: Solo puede ver y gestionar sus propias lecturas

## Requisitos Previos

- Node.js v18 o superior
- npm v9 o superior
- Ionic CLI instalado globalmente
- Cuenta de Supabase

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar Supabase:
   - Crea un proyecto en [Supabase](https://supabase.com)
   - Ejecuta el script SQL en el editor SQL de Supabase (archivo `supabase-schema.sql`)
   - Obtén tu URL y clave anónima del proyecto
   - Actualiza `src/environments/environment.ts` con tus credenciales:
   ```typescript
   export const environment = {
     production: false,
     supabase: {
       url: 'TU_URL_DE_SUPABASE',
       anonKey: 'TU_CLAVE_ANONIMA'
     }
   };
   ```

3. Sincronizar plugins de Capacitor:
```bash
npx cap sync
```

## Configuración de Supabase

### 1. Crear las tablas

Ejecuta el script SQL proporcionado en `supabase-schema.sql` en el editor SQL de Supabase.

### 2. Configurar Storage

El script SQL crea automáticamente el bucket `lecturas` para almacenar las imágenes. Asegúrate de que las políticas de almacenamiento estén configuradas correctamente.

### 3. Configurar Autenticación

En la configuración de Supabase:
- Habilita el proveedor de email/password
- Configura las URLs de redirección según tu entorno

## Desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
ionic serve
```

## Build

Para generar el build de producción:

```bash
ionic build
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── services/
│   │   ├── supabase.service.ts      # Servicio de Supabase
│   │   ├── auth.service.ts          # Servicio de autenticación
│   │   └── lecturas.service.ts      # Servicio de lecturas
│   ├── login/                        # Página de login
│   ├── register/                     # Página de registro
│   ├── nueva-lectura/                # Página para registrar lecturas
│   ├── lista-lecturas/               # Página para ver lecturas
│   ├── tabs/                         # Navegación principal
│   └── auth-guard.ts                 # Guard de autenticación
├── environments/
│   └── environment.ts                # Configuración de entorno
└── assets/                           # Recursos estáticos
```

## Uso

### Registro de Usuario

1. Abre la aplicación
2. Haz clic en "Regístrate"
3. Completa el formulario:
   - Nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Tipo de usuario (Medidor o Administrador)
4. Haz clic en "Registrarse"

### Iniciar Sesión

1. Ingresa tu email y contraseña
2. Haz clic en "Iniciar Sesión"

### Registrar una Lectura

1. Desde el tab "Nueva Lectura":
   - Ingresa el valor del medidor
   - Agrega observaciones (opcional)
   - Toma una foto del medidor
   - Toma una foto de la fachada
   - La ubicación GPS se obtiene automáticamente
2. Haz clic en "Guardar Lectura"

### Ver Lecturas

- **Medidor**: Verás solo tus propias lecturas
- **Administrador**: Verás todas las lecturas de todos los usuarios

Cada lectura muestra:
- Valor del medidor
- Fecha y hora de registro
- Fotos del medidor y fachada
- Coordenadas GPS
- Enlace para abrir en Google Maps
- Información del usuario que registró (solo para administradores)

## Permisos de la Aplicación

Asegúrate de que la aplicación tenga permisos para:
- Cámara (para tomar fotos)
- Ubicación/GPS (para obtener coordenadas)

## Tecnologías Utilizadas

- **Ionic 8**: Framework para aplicaciones móviles
- **Angular 20**: Framework web
- **Supabase**: Backend como servicio (BaaS)
- **Capacitor**: Puente entre web y nativo
- **TypeScript**: Lenguaje de programación

## Notas Importantes

- Las imágenes se almacenan en Supabase Storage
- Las coordenadas GPS se obtienen automáticamente al abrir la página de nueva lectura
- Los enlaces de Google Maps se generan automáticamente con las coordenadas
- El sistema utiliza Row Level Security (RLS) de Supabase para garantizar la seguridad de los datos

## Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.

