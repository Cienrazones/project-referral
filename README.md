# 🔍 VerificaCódigos

> **Plataforma comunitaria de verificación de códigos descuento** (En desarrollo)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Planning-orange)](https://github.com/tu-usuario/verificacodigos)

---

## 📋 Estado Actual

**Versión:** 0.1.0-alpha (Documentación)  
**Fase:** Planificación y diseño técnico  
**Inicio desarrollo:** 3 Febrero 2026

⚠️ **Proyecto en fase de documentación inicial. No hay código funcional todavía.**

---

## 🎯 ¿Qué es VerificaCódigos?

Plataforma web donde usuarios pueden:
- Compartir códigos descuento
- Verificar si funcionan (votos)
- Descubrir códigos reales y actualizados
- Reportar códigos falsos/expirados

**Objetivo:** Combatir códigos descuento falsos y ayudar a usuarios a ahorrar dinero.

---

## 🛠️ Stack Tecnológico Planeado

| Capa | Tecnología | Razón |
|------|-----------|-------|
| **Frontend** | React 18 + TypeScript | Componentes reutilizables, type safety |
| **Backend** | Node.js 18 + Express | API REST, ecosystem maduro |
| **Database** | PostgreSQL 15 (Supabase) | RLS, triggers, CRON jobs |
| **Auth** | JWT + bcryptjs | Stateless, seguro |
| **Deploy** | Netlify | Serverless functions, CDN gratis |
| **Styles** | Tailwind CSS | Utility-first, rápido |

---

## 📂 Estructura Planeada

```
verificacodigos/
├── backend/              # API REST (Node + Express)
├── frontend/             # React app (admin panel)
├── database/             # SQL schemas
├── docs/                 # Documentación técnica
│   ├── INTERNAL_CONCEPTUAL_DOCS.md
│   ├── INTERNAL_DATABASE_DOCS.md
│   ├── INTERNAL_MANTENIMIENTO.md
│   ├── INTERNAL_ADMIN_MVP.md
│   └── ROADMAP_GLOBAL_SEO.md
├── .env.example
└── README.md
```

---

## 📚 Documentación Disponible

**Documentación técnica interna (5 documentos):**

| Documento | Descripción | Status |
|-----------|-------------|--------|
| `INTERNAL_CONCEPTUAL_DOCS.md` | Arquitectura, ERD, flujos, security | ✅ Completado |
| `INTERNAL_DATABASE_DOCS.md` | Manual instalación BD: 22 tablas, RLS, triggers | ✅ Completado |
| `INTERNAL_MANTENIMIENTO.md` | Guía mantenimiento: dependencias, CVE response | ✅ Completado |
| `INTERNAL_ADMIN_MVP.md` | MVP Admin (4 semanas): React + JWT + Dashboard | ✅ Completado |
| `ROADMAP_GLOBAL_SEO.md` | Roadmap 12 semanas: BD, SEO, Frontend, Launch | ✅ Completado |

**Total documentación:** ~27,000 líneas

---

## 🗺️ Roadmap de Desarrollo

### ✅ Fase 0: Documentación (31 ENE - 2 FEB 2026) - COMPLETADA
- ✅ Diseño arquitectura completa
- ✅ Schema base de datos (22 tablas)
- ✅ Documentación técnica (5 docs)
- ✅ Plan de seguridad (24 vulnerabilidades identificadas)
- ✅ Roadmap 16 semanas

### 🟡 Fase 1: MVP Admin Panel (3 FEB - 2 MAR 2026) - 4 SEMANAS

**Semana 1 (3-9 FEB):** Setup React + Auth JWT + Dashboard básico  
**Semana 2 (10-16 FEB):** CRUD Códigos + Reportes  
**Semana 3 (17-23 FEB):** Dashboard avanzado + Analytics  
**Semana 4 (24 FEB - 2 MAR):** Testing + Deploy staging

### ⏳ Fase 2: Backend Core (3 MAR - 23 MAR 2026) - 3 SEMANAS
- Database setup completo
- API REST endpoints
- RLS policies
- Triggers y funciones

### ⏳ Fase 3: Frontend Público (24 MAR - 27 ABR 2026) - 5 SEMANAS
- Landing page
- Sistema login usuarios
- Búsqueda y filtrado
- Sistema votos

### ⏳ Fase 4: SEO & Launch (28 ABR - 25 MAY 2026) - 4 SEMANAS
- Optimización SEO
- Performance tuning
- Testing completo
- Deploy producción

**Total:** 16 semanas (~4 meses)

---

## 🚀 Instalación (Cuando esté disponible)

⚠️ **Actualmente no hay código para instalar. Documentación solamente.**

**Cuando el código esté disponible:**

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/verificacodigos.git
cd verificacodigos

# 2. Instalar dependencias
npm install
cd frontend && npm install && cd ..

# 3. Configurar .env
cp .env.example .env
# Editar .env con tus credenciales Supabase

# 4. Setup database
# Ejecutar database/schema.sql en Supabase

# 5. Correr local
npm run dev        # Backend (puerto 5000)
cd frontend && npm start  # Frontend (puerto 3000)
```

---

## 🔐 Seguridad

**Vulnerabilidades identificadas y planeadas:** 24

| Categoría | Cantidad | Prioridad |
|-----------|----------|-----------|
| SQL Injection | 6 | 🔴 Crítica |
| XSS | 4 | 🔴 Crítica |
| Auth/Session | 5 | 🔴 Crítica |
| CSRF | 2 | 🟡 Alta |
| RLS Bypass | 3 | 🔴 Crítica |
| Rate Limiting | 2 | 🟡 Alta |

**Medidas de seguridad planeadas:**
- Row Level Security (RLS) en todas las tablas
- JWT con expiración 8h
- bcryptjs password hashing
- Prepared statements (SQL injection prevention)
- Input validation (backend + frontend)
- Rate limiting por IP
- Audit logging

---

## 📊 Base de Datos (Planeada)

**22 tablas diseñadas:**

| Grupo | Tablas |
|-------|--------|
| **Usuarios** | usuarios, moderadores, usuarios_anonimos |
| **Códigos** | codigos, categorias, tiendas, etiquetas |
| **Verificación** | verificaciones_codigos, reportes |
| **Gamificación** | gamificacion_usuarios, gamificacion_transacciones, gamificacion_badges |
| **SEO** | seo_metadata, seo_keywords, sitemap_urls |
| **Monitoring** | health_checks, admin_actions, verificaciones_cron |

**Features:**
- 28 RLS policies
- 8 triggers automáticos
- 8 funciones PostgreSQL
- 13 CRON jobs

---

## 🤝 Contribuciones

**Estado:** Proyecto personal en desarrollo inicial.

No se aceptan contribuciones externas por ahora (fase de documentación).

---

## 📄 Licencia

MIT License

---

## 📅 Changelog

### v0.1.0-alpha (2 Febrero 2026)
- ✅ Fase de documentación completada
- ✅ 5 documentos técnicos internos (~27,000 líneas)
- ✅ Schema base de datos diseñado (22 tablas)
- ✅ 24 vulnerabilidades identificadas
- ✅ Roadmap 16 semanas definido

### v0.2.0-alpha (TBD - 9 Febrero 2026)
- ⏳ Setup proyecto React + TypeScript
- ⏳ Sistema login JWT
- ⏳ Dashboard básico

---

## 📞 Info

**Última actualización:** 2 Febrero 2026, 01:44 WET  
**Versión:** 0.1.0-alpha  
**Fase:** Documentación completada, desarrollo inicia 3 Feb 2026

---

**Nota:** Este proyecto está en fase muy inicial. El código funcional estará disponible progresivamente a partir de Febrero 2026.