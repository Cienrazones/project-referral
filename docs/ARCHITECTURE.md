# 🏗️ Arquitectura Pública - VerificaCodigos.com

> Plataforma comunitaria de códigos de descuento verificados por usuarios reales  
> Stack: Netlify + Supabase + Vanilla JavaScript  
> Versión: 1.0.0 | Fecha: 31 Enero 2026

---

## Stack Técnico

**Arquitectura Serverless 100%:**

- **Frontend:** SPA (Single Page Application) con JavaScript vanilla y Progressive Enhancement
- **Backend:** Netlify Functions (AWS Lambda) + Edge Functions (Deno Deploy)
- **Base de datos:** Supabase (PostgreSQL gestionado con Row Level Security)
- **Autenticación:** Supabase Auth (JWT-based)
- **CDN Global:** Netlify Edge Network (50+ ubicaciones)

**Paradigma:** Serverless-first, Event-driven, Progressive Enhancement

El sistema se organiza alrededor de un **flujo de verificación de códigos**: los usuarios suben códigos de descuento/referidos, otros usuarios los verifican mediante votos, y la base de datos mantiene contadores en tiempo real (`verified_count`, `downvote_count`, `status`).

---

## 📁 Estructura de Directorios

verificacodigos/
├── .gitignore
├── package.json
├── README.md
│
├── docs/
│ ├── API.md
│ ├── DEPLOY.md
│ ├── DATABASE.md
│ ├── GAMIFICATION.md
│ ├── SEO.md
│ ├── CONTRIBUTING.md
│ └── ARCHITECTURE-public.md
│
├── public/
│ ├── index.html
│ ├── categoria.html
│ ├── codigo.html
│ ├── ranking.html
│ ├── perfil.html
│ ├── como-funciona.html
│ ├── subir-codigo.html
│ ├── login.html
│ ├── 404.html
│ ├── css/
│ ├── js/
│ └── assets/
│
├── netlify/
│ ├── edge-functions/
│ └── functions/
│
├── src/
│ ├── config/
│ ├── schemas/
│ ├── middleware/
│ ├── services/
│ └── utils/
│
└── database/
├── schema.sql
├── seeds/
└── migrations/

---

## 🎯 Categorías Principales

| ID  | Nombre               | Emoji | Slug        | Descripción breve                                   |
| --- | -------------------- | ----- | ----------- | --------------------------------------------------- |
| 1   | **Fintech & Bancos** | 💳    | `fintech`   | Neobancos, tarjetas, transferencias (Revolut, N26)  |
| 2   | **Compras Online**   | 🛒    | `compras`   | E‑commerce y delivery (Amazon, Glovo, Uber Eats)    |
| 3   | **Entretenimiento**  | 📺    | `streaming` | Streaming, música y gaming (Netflix, Spotify, Xbox) |
| 4   | **Seguridad**        | 🔒    | `seguridad` | VPN, cloud, antivirus (NordVPN, ProtonVPN, etc.)    |
| 5   | **Productividad**    | 📱    | `apps`      | Apps y cursos (Canva, Notion, Udemy, Coursera)      |
| 6   | **Crypto & Trading** | 🪙    | `crypto`    | Exchanges, wallets (Coinbase, Binance, eToro, etc.) |

---

## 🎮 Sistema de Gamificación (Resumen Público)

### Reglas de Puntos

| Acción                     | Puntos | Descripción                           |
| -------------------------- | ------ | ------------------------------------- |
| Subir código nuevo         | +10    | Por cada código subido                |
| Código verificado por otro | +5     | Cuando alguien marca "Funciona"       |
| Código ayuda a 10 personas | +20    | Bonus por popularidad                 |
| Verificar código ajeno     | +3     | Por cada verificación (👍/👎)         |
| Código reportado caducado  | -5     | Penalización si el código no funciona |

### Niveles (1–5)

| Nivel | Nombre       | Karma requerido | Badge | Beneficios principales                      |
| ----- | ------------ | --------------- | ----- | ------------------------------------------- |
| 1     | Explorador   | 0–100           | 🌱    | Acceso básico                               |
| 2     | Verificador  | 101–500         | ✅    | Badge verificado, acceso anticipado "hot"   |
| 3     | Contribuidor | 501–1500        | 🔥    | Destacado en ranking, notificaciones extra  |
| 4     | Experto      | 1501–5000       | 💎    | Verificación rápida, badge especial         |
| 5     | Leyenda      | 5000+           | 👑    | Todos los beneficios + reconocimiento extra |

---

## 🗄️ Base de Datos (Visión Pública)

### Tablas Principales

- `codes`: códigos de descuento, app, descripción, categoría, usuario, contadores, fechas.
- `users`: email, username, puntos (karma), nivel, avatar, created_at.
- `votes`: votos por usuario y código, tipo up/down.
- `categories`: nombre, emoji, slug.
- `badges` y `user_badges`: sistema de logros.

**Esquema simplificado:**

codes (
id UUID PRIMARY KEY,
app_name TEXT NOT NULL,
code TEXT NOT NULL,
description TEXT,
category_id UUID REFERENCES categories(id),
discount_type TEXT,
discount_value NUMERIC,
url TEXT,
verified_count INTEGER DEFAULT 0,
user_id UUID REFERENCES users(id),
created_at TIMESTAMP,
expires_at TIMESTAMP
);

users (
id UUID PRIMARY KEY,
email TEXT UNIQUE NOT NULL,
username TEXT UNIQUE NOT NULL,
karma INTEGER DEFAULT 0,
level INTEGER DEFAULT 1,
avatar_url TEXT,
created_at TIMESTAMP
);

---

## 🔌 API (Superficie Pública)

### Autenticación

POST /auth/login
POST /auth/register
POST /auth/logout
GET /auth/verify-email?token=...

### Códigos

GET /codes
GET /codes/:id
POST /codes
PUT /codes/:id
DELETE /codes/:id

### Votos

POST /votes
Body: { code_id, type: "up" | "down" }

### Usuarios

GET /users/:id
GET /users/ranking?period=week|month|all

### Búsqueda y Categorías

GET /search?q=netflix&category=streaming&page=1
GET /categories

---

## ⚡ Performance & Caché

### Edge Functions (Netlify)

- Códigos destacados: caché 5 minutos
- Stats de homepage: caché 1 minuto

### CDN Estática

- `css/`, `js/`, `assets/` cacheados 1 año con `immutable`

### SPA Fallback

- Todas las rutas de frontend → `/index.html`

**Configuración Netlify (`netlify.toml`):**

[build]
publish = "public"
functions = "netlify/functions"
edge_functions = "netlify/edge-functions"

[[redirects]]
from = "/api/\*"
to = "/.netlify/functions/:splat"
status = 200

[[redirects]]
from = "/\*"
to = "/index.html"
status = 200

[[headers]]
for = "/css/\*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "/js/\*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

---

## 📊 KPIs Públicos (Resumen)

| Métrica            | Objetivo inicial |
| ------------------ | ---------------- |
| Códigos activos    | 500 (mes 1)      |
| Usuarios activos   | 1.000 (mes 1)    |
| Tasa verificación  | 70% en 24h       |
| Retención 7 días   | 40%              |
| Ahorro comunitario | €50K             |

---

## 🚀 Roadmap (Alto Nivel)

### Fase 1 – MVP (Semanas 1–2)

Homepage, categorías, códigos, buscador, SEO básico.

### Fase 2 – Gamificación (Semanas 3–4)

Usuarios, login, puntos, niveles, ranking, perfil.

### Fase 3 – Comunidad (Semanas 5–6)

Votos, comentarios, notificaciones, API submit.

### Fase 4 – Optimización (Semanas 7–8)

SEO avanzado, sitemap dinámico, structured data, performance tuning.

### Fase 5 – Monetización (Mes 3+)

Links afiliados, Google AdSense, plan Premium.
