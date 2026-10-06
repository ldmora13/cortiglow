# CortiGlow 🌟

Plataforma moderna de comercio electrónico para Iluminación y Cortinas, construida con una arquitectura escalable de alto rendimiento.

## 🏗️ Arquitectura del Proyecto

Este proyecto está dividido en 3 carpetas principales que funcionan de manera independiente pero dentro del mismo repositorio:

| Carpeta | Tecnología | Descripción | Puerto |
|---------|------------|------------|---------|
| `/web` | **Astro + React** | Catálogo público ultra-rápido (SSR/Static). Optimizado para SEO y carga de imágenes. | `:4321` |
| `/admin` | **React + Vite** | Panel de administración privado para gestionar productos, categorías y usuarios. | `:5173` |
| `/api` | **Express + Prisma** | API REST Backend centralizada. Maneja lógica de negocio y caché. | `:3000` |

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js v22+
- PostgreSQL (Docker)

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/--/cortiglow.git
   cd cortiglow
   ```

2. **Configurar Variables de Entorno:**
   Crea los archivos `.env` en cada carpeta basándote en los ejemplos (`.env.example`). 

3. **Instalar Dependencias:**
   Entra en cada carpeta e instala los paquetes:
   ```bash
   cd api && npm install
   cd ../admin && npm install
   cd ../web && npm install
   ```

4. **Levantar el Entorno:**
   Debes abrir 3 terminales (una para cada proyecto) y ejecutar el servidor de desarrollo en cada uno:

   **Terminal 1 (API):**
   ```bash
   cd api
   npm run dev
   ```
   🔵 API: `http://localhost:3000`

   **Terminal 2 (Admin):**
   ```bash
   cd admin
   npm run dev
   ```
   🟣 Admin: `http://localhost:5173`

   **Terminal 3 (Web):**
   ```bash
   cd web
   npm run dev
   ```
   🔷 Web: `http://localhost:4321`

### 🔥 Hot Reload Automático

Los cambios en el código se reflejan automáticamente sin necesidad de reiniciar los servidores:

- **Frontend (Admin/Web):** Recarga instantánea (HMR)
- **Backend (API):** Recarga automática en 1-2 segundos

## 📚 Documentación Adicional

Para ver la guía completa de configuración de base de datos, scripts SQL y despliegue, consulta:

👉 **[VER INSTRUCCIONES DE INSTALACIÓN](./INSTRUCCIONES.md)**

## 🎨 Mejoras Propuestas

- **UI/UX**: Mejorar la interacción con efectos de iluminación y 3D usando GSAP
- **Animaciones**: Integrar GSAP para transiciones fluidas entre pantallas
- **Iluminación**: Añadir efectos de luz dinámicos en el catálogo de productos
- **Scroll**: Implementar efectos de scroll paralizante y deslizamiento suave

## 📁 Estructura de Archivos

```
cortiglow/
├── web/           # Frontend Astro (catálogo público)
│   ├── src/
│   │   ├── pages/       # Rutas de la aplicación
│   │   ├── components/  # Componentes reutilizables
│   │   └── astro.config.mjs
│   ├── public/         # Assets estáticos (imágenes, iconos)
│   └── package.json
├── admin/           # Panel de administración (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── controllers/
│   │   └── layout.astro
│   ├── package.json
│   └── eslint.config.js
└── api/             # Backend REST (Express + Prisma)
    ├── src/
    │   ├── controllers/
    │   ├── repositories/
    │   ├── routes/
    │   ├── prisma/
    │   └── index.ts
    ├── package.json
    └── prisma/
        └── schema.prisma
```

## 💡 Contexto del Equipo

- **Frontend**: Astro + React para un sitio ultra-rápido y optimizado para SEO
- **Backend**: Express + Prisma para lógica de negocio robusta
- **Administración**: React + Vite para un panel de control intuitivo

¡Bienvenido al equipo! Esta plataforma combina tecnología de vanguardia con un enfoque centrado en el usuario para ofrecer una experiencia de compra de iluminación y cortinas de alta calidad.
