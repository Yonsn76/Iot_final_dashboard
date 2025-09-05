# IoT Dashboard - Electron App

Esta es la versión de escritorio de tu aplicación IoT Dashboard usando Electron.

## Comandos Disponibles

### Desarrollo
```bash
# Ejecutar en modo desarrollo (React + Electron)
npm run electron-dev

# Solo ejecutar Electron (requiere que React esté corriendo)
npm run electron
```

### Construcción
```bash
# Construir la aplicación para distribución
npm run dist

# Construir y empaquetar
npm run electron-pack
```

## Estructura de Archivos

- `electron/main.js` - Archivo principal de Electron
- `dist/` - Archivos construidos de React (se genera con `npm run build`)
- `release/` - Archivos ejecutables finales (se genera con `npm run dist`)

## Características

- ✅ Ventana de aplicación nativa
- ✅ Menú personalizado
- ✅ Soporte para desarrollo y producción
- ✅ Configuración de seguridad optimizada
- ✅ Empaquetado automático para Windows (.exe)

## Notas de Seguridad

La aplicación está configurada con las mejores prácticas de seguridad:
- `nodeIntegration: false` - Deshabilita la integración de Node.js en el renderer
- `contextIsolation: true` - Aísla el contexto del renderer
- `webSecurity: true` - Habilita las políticas de seguridad web

## Distribución

Después de ejecutar `npm run dist`, encontrarás el instalador en:
- `release/` - Contiene el instalador .exe para Windows

## Personalización

Puedes modificar la configuración en:
- `package.json` - Sección "build" para opciones de empaquetado
- `electron/main.js` - Configuración de la ventana y comportamiento
