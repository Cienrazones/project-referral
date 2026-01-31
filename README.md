[![Netlify Status](https://api.netlify.com/api/v1/badges/tu-badge-id/deploy-status)](https://app.netlify.com/sites/verificacodigos/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

**Stack:** Netlify + Supabase + JavaScript Vanilla

---

## Características

- Verificación comunitaria (upvotes/downvotes)
- Sistema gamificación (Flujo, niveles, badges)
- Row Level Security (RLS)
- Serverless architecture

---

## Quick Start

**Prerequisitos:** Node.js 18+, Netlify CLI, cuentas Supabase + Netlify

# 1. Clonar

git clone https://github.com/tu-usuario/verificacodigos.git
cd verificacodigos

# 2. Instalar

npm install

# 3. Configurar .env

cp .env.example .env

# Editar con tus keys de Supabase

# 4. Setup DB

# Ejecutar database/schema.sql en Supabase SQL Editor

# 5. Correr local

netlify dev

Abre [http://localhost:8888](http://localhost:8888)

---

## Documentación

| Doc                                      | Contenido                  |
| ---------------------------------------- | -------------------------- |
| [INDICE-MAESTRO](docs/INDICE-MAESTRO.md) | Navegación completa        |
| [arquitectura](docs/arquitectura.md)     | Stack técnico y estructura |
| [DATABASE](docs/DATABASE.md)             | Schema, RLS, triggers      |
| [API](docs/API.md)                       | Endpoints REST             |
| [GAMIFICATION](docs/GAMIFICATION.md)     | Sistema Flujo              |
| [SEO](docs/SEO.md)                       | Estrategia SEO             |

---

## Estructura

verificacodigos/
├── docs/ # Documentación técnica
├── public/ # Frontend (HTML/CSS/JS)
├── netlify/ # Serverless functions
├── database/ # Schema SQL + seeds
└── .gitignore

---

## Seguridad

- Variables en `.env` (local) y Netlify dashboard (prod)
- RLS activo en todas las tablas Supabase
- Secrets NUNCA en código
- Validación inputs servidor

---

## Deploy

# Conectar repo a Netlify dashboard

# Añadir environment variables:

# - SUPABASE_URL

# - SUPABASE_ANON_KEY

# Deploy automático en push a main

# O manual:

netlify deploy --prod

---

## Roadmap

**MVP (Mes 1-2):** Homepage, login, subir códigos, votos  
**Gamificación (Mes 3-4):** Sistema Flujo completo  
**SEO (Mes 5-6):** Posicionamiento Google  
**Monetización (Mes 7-12):** Afiliados, AdSense

Ver [INTERNAL-roadmap.md](docs/INTERNAL-roadmap.md)

---

## Contribuciones

**Estado:** Proyecto personal, no acepta contribuciones externas por ahora.  
**Futuro:** Posiblemente Mes 6+ (pendiente decisión).

---

## Licencia

MIT License

---

**Creado:** 31 Enero 2026
