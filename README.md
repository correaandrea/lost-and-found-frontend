# Lost & Found Uni — Frontend

Aplicación web de **Lost & Found Uni**, un sistema centralizado para reportar, buscar y recuperar objetos perdidos y encontrados en la Universidad de Antioquia (UdeA).

> Proyecto desarrollado por **Emanuel Munera Pérez** y **Andrea Correa Arango** para el curso *Proyecto Integrador II* (Ingeniería de Sistemas, Universidad de Antioquia).

La API vive en el repositorio hermano [`lost-and-found-backend`](../lost-and-found-backend); sin ella corriendo, esta aplicación no carga datos.

## Qué se puede hacer

**Cualquier visitante**
- Explorar los reportes en una cuadrícula paginada.
- Buscar por texto y filtrar por sede, ubicación, categoría, estado y fecha (con atajos "Hoy", "Últimos 3 días" y "Última semana").
- Abrir el detalle de un objeto y ver sus posibles coincidencias con un porcentaje de similitud.

**Usuarios con cuenta `@udea.edu.co`** (inicio de sesión con Google)
- Publicar un objeto perdido o encontrado, con foto y, en los encontrados, un *detalle privado de verificación* que solo ve su autor.
- **Contactar** a quien publicó un reporte: se abre Gmail con un correo ya dirigido a esa persona.
- En **Mi Perfil**, marcar sus reportes como entregados o encontrados, reabrirlos o eliminarlos.

**Administradores**
- Pestaña **Administración**: moderar todos los reportes (marcar, reabrir, eliminar) y consultar la bitácora de auditoría.

## Stack

React 19 · TypeScript · Vite 8 · CSS plano · Oxlint

## Puesta en marcha

Requisitos: Node.js 22 o superior y el backend corriendo en `http://localhost:3000`.

```bash
npm install
npm run dev
```

Abre **`http://localhost:5173`**. Usa `localhost` y no `127.0.0.1`: el backend redirige a `localhost` después del login con Google y el token se guarda por origen.

### Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Verifica tipos y genera la versión de producción en `dist/` |
| `npm run preview` | Sirve la versión compilada |
| `npm run lint` | Análisis estático con Oxlint |

### Configuración

La URL del backend está fija en dos lugares, ambos para uso local:

- `API_URL` en [`src/types.ts`](src/types.ts).
- La dirección del botón "Ingresar con Google" en [`src/App.tsx`](src/App.tsx).

Cambia ambos si el backend corre en otra dirección. El backend, a su vez, redirige a `http://localhost:5173` tras el login.

## Estructura

```
src/
├── App.tsx                      Navegación, sesión y pestañas
├── auth.ts                      Token, sesión y cliente de la API
├── types.ts                     Tipos, URL de la API y utilidades de estado y fechas
├── contact.ts                   Redacción del correo y enlace de Gmail
├── useApi.ts                    Hook para consultas GET
├── components/
│   ├── LostItemsCarousel.tsx    Búsqueda, filtros y cuadrícula
│   ├── ItemDetailModal.tsx      Detalle, botón Contactar y coincidencias
│   ├── ReportItemForm.tsx       Formulario de publicación
│   ├── UserProfile.tsx          Mi Perfil: resolver, reabrir y eliminar
│   ├── AdminPanel.tsx           Panel de administración y auditoría
│   └── ConfirmDialog.tsx        Diálogo de confirmación reutilizable
└── styles/                      Hojas de estilo por componente
```

## Notas

- Cómo funcionan los filtros: cada cambio se traduce en una consulta a la API, que filtra y pagina en el servidor; la app solo recibe la página visible.
- Los diálogos de confirmación son propios de la aplicación; no se usan `alert` ni `prompt` del navegador.
- Esta aplicación no tiene pruebas automatizadas. Las del backend cubren la lógica de negocio.
- `npm run lint` reporta una advertencia de estilo conocida en `src/App.tsx` (actualización de estado dentro de un efecto).

## Créditos

Proyecto académico de **Emanuel Munera Pérez** y **Andrea Correa Arango**, Universidad de Antioquia — Proyecto Integrador II.
