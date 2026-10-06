# AGENTS.md

## Overview
CortiGlow es una plataforma moderna de comercio electrónico para Iluminación y Cortinas, construida con una arquitectura escalable de alto rendimiento.

## Arquitectura del Proyecto
El proyecto está dividido en 3 carpetas principales que funcionan de manera independiente pero dentro del mismo repositorio:

| Carpeta | Tecnología | Descripción | Puerto |
|---------|------------|------------|---------|
| `/web` | **Astro + React** | Catálogo público ultra-rápido (SSR/Static). Optimizado para SEO y carga de imágenes. | `:4321` |
| `/admin` | **React + Vite** | Panel de administración privado para gestionar productos, categorías y usuarios. | `:5173` |
| `/api` | **Express + Prisma** | API REST Backend centralizada. Maneja lógica de negocio y caché. | `:3000` |

## Entidades Principales

### 1. Frontend (/web)
- **Framework**: Astro con React
- **Características**: Rendimiento ultra-rápido, optimizado para SEO, hot reload automático
- **Rutas**: Las páginas se definen en `src/pages/` (ej. `index.astro`)
- **Servidor**: Astro dev server en `localhost:4321`
- **Estados**: Estructura minimalista con componentes en `src/components/` y assets estáticos en `public/`

### 2. Backend (/api)
- **Framework**: Express.js con Prisma ORM
- **Base de Datos**: PostgreSQL (Docker)
- **Funciones**: Lógica de negocio, gestión de productos, categorías, usuarios y pedidos
- **Servidor**: API REST en `localhost:3000`
- **Entornos**: Variables de entorno en `.env`

### 3. Administración (/admin)
- **Framework**: React + Vite
- **Características**: Panel privado para gestión de catálogo, inventario y usuarios
- **Servidor**: Vite dev server en `localhost:5173`
- **Integración**: Consume la API `/api` para operaciones CRUD

## Flujo de Trabajo

1. **Desarrollo**: Tres terminales separados para API, Admin y Web
2. **Hot Reload**: Todo cambio se refleja automáticamente sin reinicios
3. **Deploy**: Cada componente tiene su propio dominio (web: :4321, admin: :5173, api: :3000)

## Buenas Prácticas

- **Escalabilidad**: La arquitectura separa claramente frontend, backend y admin
- **Performance**: Astro optimiza cargas iniciales con SSR/Static
- **Seguridad**: Variables de entorno para credenciales sensibles
- **Consistencia**: Todos los servicios usan TailwindCSS para consistencia visual

## Recursos Clave

- **README.web**: Guía rápida del frontend Astro
- **README.admin**: Configuración y estructura del panel de admin
- **README.api**: Endpoints y lógica de la API REST
- **docker-compose.yml**: Orquestación de bases de datos (PostgreSQL) y servicios
- **.gitignore**: Exclusión de archivos temporales y sistemas

## Referencias

- [Arquitectura del Proyecto](README.md#architecture)
- [Documentación Astro](https://docs.astro.build)
- [Guía de Express + Prisma](https://www.npmjs.com/package/@prisma/client)
- [TailwindCSS](https://tailwindcss.com)
