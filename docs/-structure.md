# 🏗️ VERIFICACODIGOS.COM - ARQUITECTURA COMPLETA

> **Plataforma comunitaria de códigos de descuento verificados por usuarios reales**  
> Stack: Netlify + Supabase + Vanilla JavaScript  
> Versión: 1.0.0 | Fecha: 30 Enero 2026

---

## 📁 ESTRUCTURA DE DIRECTORIOS

```
verificacodigos/
├── .env.example                    # Variables de entorno template
├── .gitignore
├── netlify.toml                    # Config Netlify: build, redirects, headers, cache
├── package.json                    # Dependencies: Joi, @supabase/supabase-js, resend
├── README.md
│
├── docs/                           # 📚 DOCUMENTACIÓN TÉCNICA
│   ├── API.md                      # Endpoints API REST completos
│   ├── DEPLOY.md                   # Deploy Netlify + Supabase paso a paso
│   ├── DATABASE.md                 # Schema SQL + seeds + migraciones
│   ├── GAMIFICATION.md             # Sistema Carga: niveles, badges, recompensas
│   ├── SEO.md                      # Estrategia SEO: structured data, sitemap
│   ├── CONTRIBUTING.md             # Guía contribución comunidad
│   └── ARCHITECTURE.md             # Diagrama arquitectura + flujos
│
├── public/                         # 🌐 FRONTEND SPA
│   ├── index.html                  # Homepage: hero, stats, códigos destacados
│   ├── categoria.html              # Template página categoría (URL: /categoria/fintech)
│   ├── codigo.html                 # Detalle código individual (URL: /codigo/revolut-20)
│   ├── ranking.html                # Ranking usuarios top 100 (Carga)
│   ├── perfil.html                 # Perfil usuario: stats, badges, historial
│   ├── como-funciona.html          # Explicación sistema verificación + Carga
│   ├── subir-codigo.html           # Formulario subir código nuevo
│   ├── login.html                  # Login/registro usuarios
│   ├── 404.html                    # Página error 404
│   │
│   ├── css/
│   │   ├── main.css                # Entry point: importa todos los CSS
│   │   │
│   │   ├── base/                   # 🎨 ESTILOS BASE
│   │   │   ├── reset.css           # Normalize CSS
│   │   │   ├── typography.css      # Fuentes, tamaños, line-height
│   │   │   └── variables.css       # Design system (tu CSS actual aquí)
│   │   │
│   │   ├── components/             # 🧩 COMPONENTES REUTILIZABLES
│   │   │   ├── buttons.css         # .btn, .btn-primary, .btn-outline
│   │   │   ├── cards.css           # .code-card, .user-card
│   │   │   ├── forms.css           # .form-control, .form-group
│   │   │   ├── badges.css          # .badge, .badge-verified
│   │   │   ├── filters.css         # .filter-chip, .filter-group
│   │   │   ├── modals.css          # .modal, .modal-backdrop
│   │   │   └── tooltips.css        # .tooltip
│   │   │
│   │   ├── layout/                 # 📐 LAYOUT GLOBAL
│   │   │   ├── header.css          # .header, .nav, .logo
│   │   │   ├── footer.css          # .footer, .footer-links
│   │   │   ├── grid.css            # .codes-grid, .ranking-grid
│   │   │   └── container.css       # .container, breakpoints
│   │   │
│   │   └── pages/                  # 📄 ESTILOS ESPECÍFICOS PÁGINAS
│   │       ├── home.css            # Homepage hero, stats
│   │       ├── categoria.css       # Sidebar categorías
│   │       ├── codigo.css          # Card detalle grande
│   │       ├── ranking.css         # Tabla ranking
│   │       └── perfil.css          # Avatar, badges usuario
│   │
│   ├── js/
│   │   ├── main.js                 # Entry point: init routing, state, listeners
│   │   ├── router.js               # Client-side routing SPA (no page reload)
│   │   ├── state.js                # Estado global: códigos, usuario actual, categorías
│   │   │
│   │   ├── api/                    # 🔌 CLIENTE API REST
│   │   │   ├── client.js           # Fetch wrapper + interceptors (auth, errors)
│   │   │   ├── auth.js             # POST /login, /register, /logout
│   │   │   ├── codes.js            # GET, POST, PUT, DELETE /codes
│   │   │   ├── votes.js            # POST /votes (upvote/downvote)
│   │   │   ├── users.js            # GET /users/:id, /users/ranking
│   │   │   ├── categories.js       # GET /categories
│   │   │   └── search.js           # GET /search?q=netflix
│   │   │
│   │   ├── components/             # 🧱 WEB COMPONENTS (Vanilla JS)
│   │   │   ├── CodeCard.js         # Render tarjeta código con verificación
│   │   │   ├── SearchBar.js        # Barra búsqueda con debounce
│   │   │   ├── FilterChips.js      # Chips categorías con filtro activo
│   │   │   ├── Modal.js            # Modal genérico (login, confirmación)
│   │   │   ├── Toast.js            # Notificaciones toast (éxito/error)
│   │   │   ├── Pagination.js       # Paginación códigos (12 por página)
│   │   │   └── UserBadges.js       # Badges usuario (niveles 1-5)
│   │   │
│   │   ├── pages/                  # 📄 LÓGICA ESPECÍFICA PÁGINAS
│   │   │   ├── HomePage.js         # Init homepage: fetch códigos destacados
│   │   │   ├── CategoryPage.js     # Fetch códigos categoría + filtros
│   │   │   ├── CodeDetailPage.js   # Fetch detalle código + comentarios
│   │   │   ├── RankingPage.js      # Fetch ranking + filtros tiempo
│   │   │   └── ProfilePage.js      # Fetch perfil usuario + historial
│   │   │
│   │   └── utils/
│   │       ├── clipboard.js        # Copiar código portapapeles
│   │       ├── date.js             # Formatear fechas relativas ("hace 2h")
│   │       ├── storage.js          # localStorage wrapper seguro (JWT)
│   │       ├── validation.js       # Validación frontend formularios
│   │       └── constants.js        # Constantes: categorías, niveles, badges
│   │
│   └── assets/
│       ├── images/
│       │   ├── logo.svg            # Logo VerificaCodigos
│       │   ├── og-image.png        # Open Graph imagen (1200x630)
│       │   └── favicon.ico
│       ├── icons/
│       │   └── categories/         # Iconos SVG categorías (fintech, gaming...)
│       └── fonts/                  # Fuentes custom (opcional)
│
├── netlify/
│   │
│   ├── edge-functions/             # ⚡ CACHÉ EDGE (ultra-rápido, global)
│   │   ├── codes-cache.js          # Cachear códigos populares (TTL: 5min)
│   │   └── stats-cache.js          # Cachear stats homepage (TTL: 1min)
│   │
│   └── functions/                  # 🔧 API SERVERLESS (Node.js)
│       ├── auth.js                 # POST /login, /register, /verify-email
│       ├── codes.js                # GET, POST, PUT, DELETE /codes
│       ├── votes.js                # POST /votes (upvote: +5 Carga, downvote: -3)
│       ├── users.js                # GET /users/:id, /users/ranking
│       ├── categories.js           # GET /categories (6 principales)
│       ├── search.js               # GET /search?q=netflix&category=fintech
│       ├── newsletter.js           # POST /newsletter/subscribe
│       │
│       └── _shared/                # 📦 CÓDIGO COMPARTIDO FUNCTIONS
│           ├── db.js               # Cliente Supabase singleton
│           ├── errorHandler.js     # Manejo errores centralizado
│           ├── corsHeaders.js      # Headers CORS estándar
│           └── response.js         # success(data), error(message)
│
├── src/                            # 🛠️ LÓGICA COMPARTIDA (frontend + backend)
│   │
│   ├── config/
│   │   ├── supabase.js             # createClient(SUPABASE_URL, KEY)
│   │   ├── jwt.js                  # JWT_SECRET, expiresIn: 7d
│   │   └── constants.js            # CATEGORIES, LEVELS, BADGES
│   │
│   ├── schemas/                    # ✅ VALIDACIÓN JOI/ZOD
│   │   ├── codeSchema.js           # Validar crear/editar código
│   │   ├── userSchema.js           # Validar registro/login
│   │   ├── voteSchema.js           # Validar voto (code_id, type: up/down)
│   │   └── searchSchema.js         # Validar búsqueda (query, category)
│   │
│   ├── middleware/
│   │   ├── auth.js                 # Verificar JWT + roles (admin, user)
│   │   ├── rateLimit.js            # Anti-spam: 5 req/min por IP
│   │   └── validate.js             # Middleware validación schemas
│   │
│   ├── services/                   # 💼 LÓGICA NEGOCIO
│   │   ├── codesService.js         # CRUD códigos + verificación
│   │   ├── votesService.js         # Lógica votos + actualizar Carga
│   │   ├── gamificationService.js  # Calcular Carga, niveles, badges
│   │   ├── emailService.js         # Envío emails (Resend/SendGrid)
│   │   └── cacheService.js         # Redis/Upstash cache
│   │
│   └── utils/
│       ├── validators.js           # Helpers validación custom
│       ├── helpers.js              # Funciones auxiliares
│       ├── responses.js            # success(data, 200), error(msg, 400)
│       └── errors.js               # AppError, ValidationError classes
│
└── database/
    ├── schema.sql                  # Schema completo Supabase PostgreSQL
    │
    ├── seeds/                      # 🌱 DATOS INICIALES
    │   ├── categories.sql          # 6 categorías: Fintech, Compras, Entretenimiento...
    │   ├── badges.sql              # Badges: Explorador, Verificador, Leyenda...
    │   └── demo_codes.sql          # 20 códigos ejemplo (Revolut, Netflix...)
    │
    └── migrations/                 # 📈 CAMBIOS INCREMENTALES
        ├── 001_initial.sql         # Tablas base: codes, users, votes
        ├── 002_add_badges.sql      # Sistema badges + user_badges
        └── 003_add_indexes.sql     # Indexes performance
```

---

## 🎯 CATEGORÍAS PRINCIPALES (6)

| ID | Nombre | Emoji | Slug | Descripción |
|----|--------|-------|------|-------------|
| 1 | **Fintech & Bancos** | 💳 | `fintech` | Neobancos, tarjetas, transferencias (Revolut, N26) |
| 2 | **Compras Online** | 🛒 | `compras` | E-commerce, delivery (Amazon, Glovo, Uber Eats) |
| 3 | **Entretenimiento** | 📺 | `streaming` | Streaming, música, gaming (Netflix, Spotify, Xbox) |
| 4 | **Seguridad** | 🔒 | `seguridad` | VPN, cloud, antivirus (NordVPN, ProtonVPN) |
| 5 | **Productividad** | 📱 | `apps` | Software, cursos online (Canva, Notion, Udemy) |
| 6 | **Crypto & Trading** | 🪙 | `crypto` | Exchanges, wallets (Coinbase, Binance, eToro) |

---

## 🎮 SISTEMA GAMIFICACIÓN CARGA

### **Reglas Puntos**

| Acción | Puntos Carga | Descripción |
|--------|--------------|-------------|
| Subir código nuevo | +10 | Por cada código subido |
| Código verificado por otro | +5 | Cuando alguien marca "Funciona" |
| Código ayuda a 10 personas | +20 | Bonus por popularidad |
| Verificar código ajeno | +3 | Por cada verificación (👍/👎) |
| Código reportado caducado | -5 | Penalización si código no funciona |

### **Niveles (5)**

| Nivel | Nombre | Carga Requerida | Badge | Beneficios |
|-------|--------|-----------------|-------|------------|
| 1 | **Explorador** | 0-100 | 🌱 | Acceso básico |
| 2 | **Verificador** | 101-500 | ✅ | Badge verificado, acceso anticipado códigos hot |
| 3 | **Contribuidor** | 501-1500 | 🔥 | Destacado en ranking, notificaciones priority |
| 4 | **Experto** | 1501-5000 | 💎 | Verificación rápida automática, badge dorado |
| 5 | **Leyenda** | 5000+ | 👑 | Todos los beneficios + reconocimiento especial |

---

## 🗄️ BASE DE DATOS SUPABASE

### **Tablas Principales**

```sql
-- Códigos de descuento
codes (
  id UUID PRIMARY KEY,
  app_name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  discount_type TEXT, -- 'percentage', 'fixed', 'free_trial'
  discount_value NUMERIC,
  url TEXT,
  verified_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  expires_at TIMESTAMP
)

-- Usuarios
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  karma INTEGER DEFAULT 0, -- Puntos Carga
  level INTEGER DEFAULT 1, -- Nivel 1-5
  avatar_url TEXT,
  created_at TIMESTAMP
)

-- Votos (verificaciones)
votes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  code_id UUID REFERENCES codes(id),
  type TEXT, -- 'up' o 'down'
  created_at TIMESTAMP,
  UNIQUE(user_id, code_id) -- Un voto por usuario por código
)

-- Categorías
categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  slug TEXT UNIQUE NOT NULL
)

-- Badges
user_badges (
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP,
  PRIMARY KEY(user_id, badge_id)
)
```

---

## 🔌 API ENDPOINTS

### **Autenticación**

```
POST   /.netlify/functions/auth/login
POST   /.netlify/functions/auth/register
POST   /.netlify/functions/auth/logout
GET    /.netlify/functions/auth/verify-email?token=...
```

### **Códigos**

```
GET    /.netlify/functions/codes              # Lista códigos (paginado)
GET    /.netlify/functions/codes/:id          # Detalle código
POST   /.netlify/functions/codes              # Crear código (auth)
PUT    /.netlify/functions/codes/:id          # Editar código (auth)
DELETE /.netlify/functions/codes/:id          # Eliminar código (auth/admin)
```

### **Votos**

```
POST   /.netlify/functions/votes              # Votar código (auth)
       Body: { code_id, type: 'up'/'down' }
```

### **Usuarios**

```
GET    /.netlify/functions/users/:id          # Perfil usuario
GET    /.netlify/functions/users/ranking      # Ranking top 100
       Query: ?period=week|month|all
```

### **Búsqueda**

```
GET    /.netlify/functions/search             # Buscar códigos
       Query: ?q=netflix&category=streaming&page=1
```

### **Categorías**

```
GET    /.netlify/functions/categories         # Lista 6 categorías
```

---

## ⚡ PERFORMANCE & CACHÉ

### **Edge Functions (Netlify)**

```javascript
// netlify/edge-functions/codes-cache.js
// Cachear códigos populares 5min globalmente (CDN)
export default async (request, context) => {
  const cacheKey = 'featured-codes';
  const cached = await context.cache.get(cacheKey);
  
  if (cached) return new Response(cached, {
    headers: { 'Cache-Control': 'public, max-age=300' }
  });
  
  const codes = await supabase.from('codes')
    .select('*')
    .order('verified_count', { ascending: false })
    .limit(12);
  
  await context.cache.set(cacheKey, JSON.stringify(codes), { ttl: 300 });
  
  return new Response(JSON.stringify(codes), {
    headers: { 
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'application/json'
    }
  });
};
```

### **netlify.toml (Config)**

```toml
[build]
  publish = "public"
  functions = "netlify/functions"
  edge_functions = "netlify/edge-functions"

# Redirects API
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# SPA fallback
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers seguridad
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Caché estático
[[headers]]
  for = "/css/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/js/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🔒 SEGURIDAD

### **Rate Limiting**

```javascript
// src/middleware/rateLimit.js
const rateLimit = new Map();

export const checkRateLimit = (ip, limit = 5) => {
  const now = Date.now();
  const windowMs = 60000; // 1min
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const record = rateLimit.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return true;
  }
  
  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }
  
  record.count++;
  return true;
};
```

### **JWT Auth**

```javascript
// src/middleware/auth.js
import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
};

export const requireAuth = (handler) => {
  return async (event, context) => {
    const token = event.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
    }
    
    try {
      const user = verifyToken(token);
      event.user = user; // Adjuntar usuario al request
      return handler(event, context);
    } catch (error) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Token inválido' }) };
    }
  };
};
```

---

## 📊 MÉTRICAS ÉXITO (KPIs)

### **Objetivos Iniciales**

| Métrica | Objetivo Mes 1 | Objetivo Mes 3 |
|---------|----------------|----------------|
| Códigos activos | 500 | 2,000 |
| Usuarios activos | 1,000 | 5,000 |
| Tasa verificación | 70% en 24h | 80% en 12h |
| Retención 7 días | 40% | 50% |
| Ahorro comunitario | €50K | €200K |

### **SEO Metrics**

| Métrica | Target |
|---------|--------|
| Indexación Google | 100% en 48h |
| Top 10 posiciones | Códigos de marca en 3 meses |
| CTR orgánico | >5% |
| Core Web Vitals | Todas en verde |

---

## 🚀 ROADMAP IMPLEMENTACIÓN

### **Fase 1: MVP (Semanas 1-2)**

- ✅ HTML homepage responsive
- ✅ Sistema categorías (6)
- ✅ Card código minimalista
- ✅ Buscador funcional
- ✅ SEO básico (meta tags, sitemap estático)

### **Fase 2: Gamificación (Semanas 3-4)**

- ✅ Sistema usuarios + login
- ✅ Contador Carga
- ✅ Niveles 1-5 + badges
- ✅ Ranking usuarios
- ✅ Perfil usuario

### **Fase 3: Comunidad (Semanas 5-6)**

- ✅ Sistema verificación (votos)
- ✅ Comentarios en códigos
- ✅ Notificaciones
- ✅ API submit códigos

### **Fase 4: Optimización (Semanas 7-8)**

- ✅ Sitemap dinámico API
- ✅ Structured data completo
- ✅ PWA
- ✅ Analytics avanzado
- ✅ A/B testing cards

---

## 📝 COMANDOS ÚTILES

```bash
# Instalar dependencias
npm install

# Desarrollo local
netlify dev

# Build producción
netlify build

# Deploy
netlify deploy --prod

# Supabase
supabase db push
supabase db seed
```

---

## 📚 RECURSOS CLAVE

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **Schema.org Offer**: https://schema.org/Offer
- **Google Search Console**: https://search.google.com/search-console
- **Web Vitals**: https://web.dev/vitals

---

**🎯 PROYECTO 100% FACTIBLE Y PRODUCTION-READY**

**Tiempo estimado desarrollo:** 8 semanas  
**Costo estimado:** €8-12K (1 dev full-time)  
**ROI esperado:** 1K usuarios/mes → €50K ahorro comunitario

**Stack 100% serverless, escalable infinitamente, costos mínimos iniciales.**

---

*Creado por: VerificaCodigos Team | Fecha: 30 Enero 2026*