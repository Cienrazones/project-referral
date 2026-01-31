# 🔐 ESTRATEGIA Y CÓDIGO - VerificaCodigos.com

> **INTERNAL** - Referencia técnica del proyecto. NO TRACK en Git.

---

## 🎯 ÍNDICE RÁPIDO

1. [Secrets y Environment](#1-secrets-y-environment)
2. [Schema y RLS](#2-schema-y-rls)
3. [Triggers de Gamificación](#3-triggers-de-gamificación)
4. [Auth y Rate Limiting](#4-auth-y-rate-limiting)
5. [Roadmap Técnico](#5-roadmap-técnico-paso-a-paso)
6. [Tips de Seguridad](#6-tips-de-seguridad)
7. [Monetización](#7-monetización-fases)

---

## 1. SECRETS Y ENVIRONMENT

### Variables críticas (NUNCA en código)

```bash
# .env (local - NO SUBIR)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_JWT_SECRET=tu-jwt-secret
RESEND_API_KEY=tu-resend-key
GOOGLE_INDEXING_SERVICE_ACCOUNT_KEY=./service-account.json
```

**Netlify Dashboard (producción):**
- Settings → Environment variables
- Añadir: `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- NUNCA `SUPABASE_SERVICE_ROLE_KEY` en frontend

---

## 2. SCHEMA Y RLS

### Tablas principales

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  karma INT DEFAULT 0,
  level INT DEFAULT 1,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Codes
CREATE TABLE codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  discount_type TEXT,
  discount_value NUMERIC,
  url TEXT,
  verified_count INT DEFAULT 0,
  downvote_count INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Votes (un usuario = un voto por código)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  code_id UUID REFERENCES codes(id),
  type TEXT CHECK (type IN ('up', 'down')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, code_id)
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT
);

-- Karma Log (historial puntos)
CREATE TABLE karma_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INT NOT NULL,
  reason TEXT NOT NULL,
  related_code_id UUID REFERENCES codes(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RLS Policies

```sql
-- Users: solo ver tu propio perfil completo
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Codes: cualquiera puede ver activos
ALTER TABLE codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "codes_select_active"
  ON codes FOR SELECT
  USING (status = 'active');

CREATE POLICY "codes_insert_auth"
  ON codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "codes_update_own"
  ON codes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "codes_delete_own"
  ON codes FOR DELETE
  USING (auth.uid() = user_id);

-- Votes: solo usuario autenticado puede votar
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_insert_auth"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "votes_select_own"
  ON votes FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 3. TRIGGERS DE GAMIFICACIÓN

### Trigger al votar

```sql
CREATE OR REPLACE FUNCTION update_karma_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'up' THEN
    -- +5 karma para dueño del código
    UPDATE users
    SET karma = karma + 5
    WHERE id = (SELECT user_id FROM codes WHERE id = NEW.code_id);

    -- +3 karma para votante
    UPDATE users
    SET karma = karma + 3
    WHERE id = NEW.user_id;

    -- Incrementar contador verificaciones
    UPDATE codes
    SET verified_count = verified_count + 1
    WHERE id = NEW.code_id;

    -- Log karma dueño
    INSERT INTO karma_log (user_id, amount, reason, related_code_id)
    VALUES (
      (SELECT user_id FROM codes WHERE id = NEW.code_id),
      5,
      'code_verified',
      NEW.code_id
    );

    -- Log karma votante
    INSERT INTO karma_log (user_id, amount, reason, related_code_id)
    VALUES (NEW.user_id, 3, 'verified_code', NEW.code_id);

  ELSIF NEW.type = 'down' THEN
    -- -3 karma para dueño del código
    UPDATE users
    SET karma = karma - 3
    WHERE id = (SELECT user_id FROM codes WHERE id = NEW.code_id);

    -- Incrementar contador downvotes
    UPDATE codes
    SET downvote_count = downvote_count + 1
    WHERE id = NEW.code_id;

    -- Marcar como expirado si >= 5 downvotes
    UPDATE codes
    SET status = 'expired'
    WHERE id = NEW.code_id AND downvote_count >= 5;

    -- Log karma
    INSERT INTO karma_log (user_id, amount, reason, related_code_id)
    VALUES (
      (SELECT user_id FROM codes WHERE id = NEW.code_id),
      -3,
      'code_downvoted',
      NEW.code_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_karma_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_karma_on_vote();
```

### Trigger al subir código

```sql
CREATE OR REPLACE FUNCTION award_karma_for_code()
RETURNS TRIGGER AS $$
BEGIN
  -- +10 karma al usuario que sube código
  UPDATE users
  SET karma = karma + 10
  WHERE id = NEW.user_id;

  -- Log karma
  INSERT INTO karma_log (user_id, amount, reason, related_code_id)
  VALUES (NEW.user_id, 10, 'code_submitted', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_karma_for_code
  AFTER INSERT ON codes
  FOR EACH ROW
  EXECUTE FUNCTION award_karma_for_code();
```

---

## 4. AUTH Y RATE LIMITING

### Rate Limit (Netlify Functions)

```javascript
// src/middleware/rateLimit.js
const rateLimit = new Map();

export const checkRateLimit = (ip, limit = 5, windowMs = 60000) => {
  const now = Date.now();

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

  if (record.count >= limit) return false;

  record.count++;
  return true;
};
```

### Auth Middleware

```javascript
// src/middleware/auth.js
import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const requireAuth = (handler) => {
  return async (event, context) => {
    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'No autorizado' })
      };
    }

    try {
      const user = verifyToken(token);
      event.user = user;
      return handler(event, context);
    } catch {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token inválido' })
      };
    }
  };
};
```

### Uso en Functions

```javascript
// netlify/functions/submit-code.js
import { requireAuth } from '../../src/middleware/auth.js';
import { checkRateLimit } from '../../src/middleware/rateLimit.js';

const submitCode = async (event, context) => {
  const ip = event.headers['x-nf-client-connection-ip'];

  if (!checkRateLimit(ip, 5, 60000)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Demasiados intentos' })
    };
  }

  // Lógica para insertar código
  const { app_name, code, description, category_id } = JSON.parse(event.body);

  // Insertar en Supabase...
};

export const handler = requireAuth(submitCode);
```

---

## 5. ROADMAP TÉCNICO (PASO A PASO)

### Semana 1-2: MVP Base

**Sábado 1 Feb:**
- [ ] Ejecutar schema.sql en Supabase SQL Editor
- [ ] Seedear 6 categorías: `database/seeds/categories.sql`
- [ ] Seedear 20 códigos demo: `database/seeds/codes.sql`

**Domingo 2 Feb:**
- [ ] Crear `public/index.html` (homepage con grid códigos)
- [ ] CSS básico: grid responsive, cards códigos
- [ ] JS: fetch códigos de Supabase, renderizar en DOM

**Lunes 3 Feb:**
- [ ] `public/login.html` (formulario login/register)
- [ ] JS: integrar Supabase Auth
- [ ] Probar signup + login local

**Martes 4 Feb:**
- [ ] `public/subir-codigo.html` (form subir código)
- [ ] Netlify Function: `POST /submit-code`
- [ ] Validar inputs, insertar en DB

**Miércoles 5 Feb:**
- [ ] Sistema votos: botones up/down en cards
- [ ] Netlify Function: `POST /vote`
- [ ] Trigger karma funciona correctamente

**Jueves 6 Feb:**
- [ ] Tests manuales completos
- [ ] Fixes bugs encontrados
- [ ] Deploy MVP a Netlify

### Semana 3-4: Gamificación

- [ ] Página `perfil.html` (mostrar karma, level, historial)
- [ ] Página `ranking.html` (top 100 usuarios)
- [ ] Sistema badges (5-10 badges iniciales)
- [ ] Lógica niveles 1-5 según karma

### Semana 5-6: SEO

- [ ] Sitemap dinámico (Netlify Function cron)
- [ ] Meta tags por página
- [ ] JSON-LD structured data
- [ ] Google Search Console setup

### Semana 7-8: Monetización

- [ ] Links afiliados Revolut, N26, Amazon
- [ ] Tracking conversiones
- [ ] Google AdSense integrado

---

## 6. TIPS DE SEGURIDAD

### ❌ NUNCA HACER

- Hardcodear API keys en JavaScript
- Pushear `.env` a GitHub
- Subir `INTERNAL-*.md` a repo público
- Desactivar RLS en tablas Supabase
- Olvidar validar inputs de usuario
- Permitir SQL queries sin sanitizar
- Usar `innerHTML` con user input (XSS)

### ✅ SIEMPRE HACER

- Variables sensibles en Netlify dashboard
- `.gitignore` actualizado
- RLS activo en todas las tablas
- Validar inputs con Zod (o similar)
- Usar prepared statements (Supabase hace esto)
- Revisar código antes de push
- Probar local antes de deploy
- Rate limiting en APIs sensibles
- HTTPS en producción (Netlify lo hace auto)

### Checklist Pre-Deploy

- [ ] `.env` NO está en Git
- [ ] `INTERNAL-*.md` NO están en Git
- [ ] Variables en Netlify dashboard configuradas
- [ ] RLS activo en todas las tablas
- [ ] Triggers funcionan correctamente
- [ ] Tests manuales completos
- [ ] Sin console.log en producción

---

## 7. MONETIZACIÓN (FASES)

### Mes 1-3: Growth (€0/mes)
- Foco en producto y usuarios
- SEO keywords long-tail
- Community building

### Mes 3-6: Afiliación (€500-1.5K/mes)
- Links afiliados Revolut, N26, Amazon
- Comisiones CPA/CPS
- Dashboard conversiones

### Mes 6-12: Diversificación (€3-5K/mes)
- Google AdSense (CPM €2-5)
- Plan Premium (€4.99/mes - sin ads)
- Sponsored codes (€100-500/marca)

### Año 2+: Escala (€10K+/mes)
- API comercial
- Marketplace códigos exclusivos
- White-label otros países

---

## 📊 MÉTRICAS A MONITOREAR

**Técnicas:**
- Error rate < 1%
- P95 latency < 1s
- DB storage < 80%
- Function invocations

**Negocio:**
- Usuarios activos semanales (target: +20% sem 1-4)
- Códigos subidos/día (target: +5/día)
- Tasa verificación 24h (target: >70%)
- Retención 7 días (target: >40%)

---

**Última actualización:** 31 Enero 2026