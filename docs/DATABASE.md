# DATABASE.md - Schema Supabase PostgreSQL

> Base de datos completa para VerificaCodigos.com  
> PostgreSQL en Supabase con Row Level Security (RLS)  
> Versión: 1.0.0 | Fecha: 31 Enero 2026

---

## Tabla de Contenidos

1. [Schema Completo](#schema-completo)
2. [Tablas Principales](#tablas-principales)
3. [Relaciones y Constraints](#relaciones-y-constraints)
4. [Índices de Performance](#índices-de-performance)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Integración con Sistema Flujo](#integración-con-sistema-flujo)
7. [Seeds (Datos Iniciales)](#seeds-datos-iniciales)
8. [Migraciones](#migraciones)
9. [Queries Útiles](#queries-útiles)

---

## Schema Completo

### Diagrama Entidad-Relación

┌─────────────┐ ┌──────────────┐ ┌─────────────┐
│ users │◄──────│ codes │──────►│ categories │
│ │ 1 _ │ │ _ 1 │ │
│ • id │ │ • id │ │ • id │
│ • email │ │ • code │ │ • name │
│ • username │ │ • app*name │ │ • slug │
│ • karma │ │ • user_id │ │ • emoji │
│ • level │ │ • category_id│ └─────────────┘
└──────┬──────┘ └──────┬───────┘
│ │
│ 1 │ *
│ │
│ ┌──────▼───────┐
│ │ votes │
│ │ │
│ │ • id │
└──────────────►│ • user\*id │

- │ • code_id │
  │ • type │
  └──────────────┘

         ┌──────────────┐       ┌──────────────────┐
         │   badges     │◄──────│  user_badges     │
         │              │ 1   * │                  │
         │ • id         │       │ • user_id        │
         │ • name       │       │ • badge_id       │
         │ • emoji      │       │ • earned_at      │
         │ • karma_req  │       └──────────────────┘
         └──────────────┘                 │
                                          │ *
                                   ┌──────▼──────┐
                                   │    users    │
                                   └─────────────┘

---

## Tablas Principales

### 1. users (Usuarios)

CREATE TABLE users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email TEXT UNIQUE NOT NULL,
username TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
karma INTEGER DEFAULT 0 CHECK (karma >= 0),
level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
avatar_url TEXT,
bio TEXT,
email_verified BOOLEAN DEFAULT false,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_karma ON users(karma DESC);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;

$$
LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

**Campos clave:**

\begin{itemize}
\item \textbf{karma}: Puntos acumulados del sistema Flujo (campo técnico, nombre público: "Flujo")
\item \textbf{level}: Nivel actual (1=Explorador, 2=Verificador, 3=Contribuidor, 4=Experto, 5=Leyenda)
\item \textbf{email\_verified}: Control de verificación de email
\item \textbf{updated\_at}: Timestamp de última modificación (actualizado automáticamente)
\end{itemize}

**Convención técnica importante:** El campo se llama `karma` en la base de datos (estándar de industria usado por Reddit, HackerNews, Stack Overflow), pero el nombre público del sistema es **Flujo**. Esta separación permite internacionalización y cambios de UI sin migraciones costosas de base de datos.

### 2. categories (Categorías)

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

**6 Categorías principales:**

\begin{enumerate}
\item Fintech \& Bancos (💳)
\item Compras Online (🛒)
\item Entretenimiento (📺)
\item Seguridad (🔒)
\item Productividad (📱)
\item Crypto \& Trading (🪙)
\end{enumerate}

### 3. codes (Códigos de Descuento)

CREATE TABLE codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Detalles descuento
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', 'free_trial', 'other')),
  discount_value NUMERIC,
  currency TEXT DEFAULT 'EUR',

  -- URLs y metadata
  url TEXT,
  terms_conditions TEXT,
  min_purchase NUMERIC,
  max_discount NUMERIC,

  -- Contadores
  verified_count INTEGER DEFAULT 0 CHECK (verified_count >= 0),
  used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),

  -- Estado
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_exclusive BOOLEAN DEFAULT false,

  -- Fechas
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT code_not_empty CHECK (length(trim(code)) > 0),
  CONSTRAINT app_name_not_empty CHECK (length(trim(app_name)) > 0)
);

-- Índices críticos para performance
CREATE INDEX idx_codes_category_id ON codes(category_id);
CREATE INDEX idx_codes_user_id ON codes(user_id);
CREATE INDEX idx_codes_verified_count ON codes(verified_count DESC);
CREATE INDEX idx_codes_created_at ON codes(created_at DESC);
CREATE INDEX idx_codes_expires_at ON codes(expires_at);
CREATE INDEX idx_codes_is_active ON codes(is_active) WHERE is_active = true;
CREATE INDEX idx_codes_is_featured ON codes(is_featured) WHERE is_featured = true;

-- Índice compuesto para búsquedas comunes
CREATE INDEX idx_codes_active_category ON codes(is_active, category_id, created_at DESC);

-- Full-text search en app_name y description
CREATE INDEX idx_codes_search ON codes USING gin(
  to_tsvector('spanish', app_name || ' ' || COALESCE(description, ''))
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_codes_updated_at BEFORE UPDATE ON codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

**Campos clave:**

\begin{itemize}
\item \textbf{verified\_count}: Número de verificaciones positivas (👍) - vinculado al sistema Flujo
\item \textbf{is\_featured}: Código destacado en homepage
\item \textbf{is\_exclusive}: Código exclusivo de la plataforma
\item \textbf{expires\_at}: Fecha de expiración (NULL = sin expirar)
\end{itemize}

### 4. votes (Verificaciones)

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_id UUID NOT NULL REFERENCES codes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('up', 'down')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Un usuario solo puede votar una vez por código
  UNIQUE(user_id, code_id)
);

-- Índices
CREATE INDEX idx_votes_code_id ON votes(code_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_type ON votes(type);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);

**Lógica de votos integrada con sistema Flujo:**

\begin{itemize}
\item \textbf{up} (👍): Código funciona → +5 karma al autor del código, +3 karma al verificador
\item \textbf{down} (👎): Código no funciona → Si recibe 5+ downvotes, se marca como expirado y el autor pierde -5 karma
\end{itemize}

### 5. badges (Insignias)

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT,
  description TEXT,
  karma_required INTEGER DEFAULT 0,
  level_required INTEGER DEFAULT 1,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_badges_karma_required ON badges(karma_required);
CREATE INDEX idx_badges_level_required ON badges(level_required);

**5 badges principales del sistema Flujo:**

\begin{enumerate}
\item 🌱 Explorador (0-100 karma)
\item ✅ Verificador (101-500 karma)
\item 🔥 Contribuidor (501-1500 karma)
\item 💎 Experto (1501-5000 karma)
\item 👑 Leyenda (5000+ karma)
\end{enumerate}

### 6. user_badges (Relación usuarios-badges)

CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY(user_id, badge_id)
);

-- Índices
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

### 7. comments (Comentarios en códigos)

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(trim(content)) > 0),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_comments_code_id ON comments(code_id, created_at DESC);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

---

## Relaciones y Constraints

### Diagrama de Constraints

-- Cascade deletes: Si se elimina usuario, se eliminan sus códigos/votos
codes.user_id → users.id (ON DELETE CASCADE)
votes.user_id → users.id (ON DELETE CASCADE)
votes.code_id → codes.id (ON DELETE CASCADE)

-- Cascade deletes: Si se elimina categoría, se eliminan códigos
codes.category_id → categories.id (ON DELETE CASCADE)

-- Unique constraints
users.email → UNIQUE
users.username → UNIQUE
categories.slug → UNIQUE
votes(user_id, code_id) → UNIQUE (composite)

-- Check constraints
users.karma >= 0
users.level BETWEEN 1 AND 5
codes.verified_count >= 0
votes.type IN ('up', 'down')

### Constraints Avanzados (Nivel Profesional + Anti-Bots)

#### 1. Prevenir Auto-Votos

-- No puedes votar tus propios códigos
CREATE OR REPLACE FUNCTION prevent_self_vote()
RETURNS TRIGGER AS
$$

DECLARE
code_author_id UUID;
BEGIN
SELECT user_id INTO code_author_id FROM codes WHERE id = NEW.code_id;

IF NEW.user_id = code_author_id THEN
RAISE EXCEPTION '🤖 ERROR 418: Soy una tetera, no puedo votar mis propios códigos.';
END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER check_self_vote BEFORE INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION prevent_self_vote();

#### 2. Prevenir Códigos Duplicados

-- No puedes subir el mismo código + app que ya existe activo
CREATE UNIQUE INDEX idx_unique_active_codes
  ON codes(LOWER(app_name), LOWER(code))
  WHERE is_active = true;

#### 3. Validar Descuentos

-- Porcentajes entre 1-100, valores fijos positivos
ALTER TABLE codes ADD CONSTRAINT valid_discount_percentage
  CHECK (
    discount_type != 'percentage'
    OR (discount_value > 0 AND discount_value <= 100)
  );

ALTER TABLE codes ADD CONSTRAINT valid_discount_fixed
  CHECK (
    discount_type != 'fixed'
    OR discount_value > 0
  );

#### 4. Rate Limiting (Anti-Spam)

-- Máximo 10 códigos por hora por usuario
CREATE OR REPLACE FUNCTION check_rate_limit()
RETURNS TRIGGER AS
$$

DECLARE
recent_count INTEGER;
BEGIN
SELECT COUNT(\*) INTO recent_count
FROM codes
WHERE user_id = NEW.user_id
AND created_at > now() - interval '1 hour';

IF recent_count >= 10 THEN
RAISE EXCEPTION '🚨 ERROR 429: Rate limit excedido. Has subido % códigos en 1 hora.', recent_count;
END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER enforce_rate_limit BEFORE INSERT ON codes
  FOR EACH ROW EXECUTE FUNCTION check_rate_limit();

#### 5. Detección de Bots

-- Tabla para trackear comportamiento sospechoso
CREATE TABLE bot_detection_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  details JSONB,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_resolved BOOLEAN DEFAULT false
);

CREATE INDEX idx_bot_detection_user ON bot_detection_log(user_id, detected_at DESC);

-- Function para detectar votos masivos sospechosos
CREATE OR REPLACE FUNCTION detect_bot_voting()
RETURNS TRIGGER AS
$$

DECLARE
votes_last_minute INTEGER;
BEGIN
SELECT COUNT(\*) INTO votes_last_minute
FROM votes
WHERE user_id = NEW.user_id
AND created_at > now() - interval '1 minute';

IF votes_last_minute > 5 THEN
INSERT INTO bot_detection_log (user_id, action_type, details)
VALUES (
NEW.user_id,
'rapid_votes',
jsonb_build_object('votes_per_minute', votes_last_minute, 'timestamp', now())
);

    RAISE EXCEPTION '🤖 ERROR 666: Actividad sospechosa detectada. Has votado % veces en 1 minuto.', votes_last_minute;

END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER detect_bot_behavior BEFORE INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION detect_bot_voting();

#### 6. Validación de Emails

-- Solo emails con formato correcto
ALTER TABLE users ADD CONSTRAINT valid_email_format
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

#### 7. Audit Log (Registro Forense)

-- Tabla de auditoría completa
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name, created_at DESC);
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_log_record ON audit_log(record_id, created_at DESC);

-- Function genérica de auditoría
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS
$$

BEGIN
INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
VALUES (
TG_TABLE_NAME,
COALESCE(NEW.id, OLD.id),
TG_OP,
CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
);
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER audit_codes AFTER INSERT OR UPDATE OR DELETE ON codes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_votes AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

---

## Índices de Performance

### Índices Críticos para Queries Comunes

-- Query: "Códigos más verificados por categoría"
CREATE INDEX idx_codes_category_verified ON codes(category_id, verified_count DESC, is_active);

-- Query: "Últimos códigos activos"
CREATE INDEX idx_codes_recent_active ON codes(is_active, created_at DESC) WHERE is_active = true;

-- Query: "Ranking usuarios top"
CREATE INDEX idx_users_ranking ON users(karma DESC, level DESC);

-- Query: "Códigos de usuario específico"
CREATE INDEX idx_codes_user_created ON codes(user_id, created_at DESC);

-- Query: "Búsqueda full-text"
CREATE INDEX idx_codes_fulltext ON codes USING gin(
  to_tsvector('spanish', app_name || ' ' || COALESCE(description, ''))
);

**Análisis de performance:**

\begin{itemize}
\item Tablas optimizadas para lecturas masivas (80\% reads, 20\% writes)
\item Índices compuestos para queries frecuentes
\item Full-text search para búsquedas rápidas
\item Partitioning opcional para escalar a millones de códigos
\end{itemize}

---

## Row Level Security (RLS)

### Políticas de Seguridad Supabase

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: users
CREATE POLICY "Usuarios pueden ver todos los perfiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON users
  FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS: codes
CREATE POLICY "Todos pueden ver códigos activos" ON codes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Usuarios autenticados pueden crear códigos" ON codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden editar sus propios códigos" ON codes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios códigos" ON codes
  FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: votes
CREATE POLICY "Todos pueden ver votos" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden votar" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- POLÍTICAS: categories (solo lectura)
CREATE POLICY "Todos pueden ver categorías" ON categories
  FOR SELECT USING (true);

-- POLÍTICAS: badges (solo lectura)
CREATE POLICY "Todos pueden ver badges" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Todos pueden ver badges de usuarios" ON user_badges
  FOR SELECT USING (true);

---

## Integración con Sistema Flujo

### Tabla karma_log (Auditoría de Flujo)

CREATE TABLE karma_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_code_id UUID REFERENCES codes(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_karma_log_user ON karma_log(user_id, created_at DESC);
CREATE INDEX idx_karma_log_reason ON karma_log(reason);

### Tabla user_streaks (Rachas de Consistencia)

CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS
$$

BEGIN
IF (SELECT last_activity_date FROM user_streaks WHERE user_id = NEW.user_id) =
CURRENT_DATE - INTERVAL '1 day' THEN
UPDATE user_streaks
SET current_streak = current_streak + 1,
longest_streak = GREATEST(longest_streak, current_streak + 1),
last_activity_date = CURRENT_DATE
WHERE user_id = NEW.user_id;
ELSIF (SELECT last_activity_date FROM user_streaks WHERE user_id = NEW.user_id) <
CURRENT_DATE - INTERVAL '1 day' THEN
UPDATE user_streaks
SET current_streak = 1,
last_activity_date = CURRENT_DATE
WHERE user_id = NEW.user_id;
END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_streak
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

### Triggers para Gestión Automática de Karma

-- Trigger: Bonuses por popularidad
CREATE OR REPLACE FUNCTION check_verification_milestones()
RETURNS TRIGGER AS
$$

BEGIN
IF NEW.verified_count = 10 AND OLD.verified_count < 10 THEN
UPDATE users SET karma = karma + 20 WHERE id = NEW.user_id;
INSERT INTO karma_log (user_id, amount, reason, related_code_id)
VALUES (NEW.user_id, 20, 'code_10_verifications', NEW.id);
END IF;

IF NEW.verified_count = 50 AND OLD.verified_count < 50 THEN
UPDATE users SET karma = karma + 50 WHERE id = NEW.user_id;
INSERT INTO karma_log (user_id, amount, reason, related_code_id)
VALUES (NEW.user_id, 50, 'code_50_verifications', NEW.id);
END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_verification_milestones
  AFTER UPDATE OF verified_count ON codes
  FOR EACH ROW
  EXECUTE FUNCTION check_verification_milestones();

-- Trigger: Penalización por códigos caducados
CREATE OR REPLACE FUNCTION penalize_expired_code()
RETURNS TRIGGER AS
$$

DECLARE
downvote_count INTEGER;
BEGIN
SELECT COUNT(\*) INTO downvote_count
FROM votes
WHERE code_id = NEW.code_id AND type = 'down';

IF downvote_count >= 5 THEN
UPDATE codes SET is_active = false WHERE id = NEW.code_id;
UPDATE users SET karma = karma - 5 WHERE id = (SELECT user_id FROM codes WHERE id = NEW.code_id);
INSERT INTO karma_log (user_id, amount, reason, related_code_id)
VALUES (
(SELECT user_id FROM codes WHERE id = NEW.code_id),
-5,
'code_expired',
NEW.code_id
);
END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_penalize_expired
  AFTER INSERT ON votes
  FOR EACH ROW
  WHEN (NEW.type = 'down')
  EXECUTE FUNCTION penalize_expired_code();

-- Trigger: Otorgar badges automáticamente al ganar karma
CREATE OR REPLACE FUNCTION check_and_grant_badges()
RETURNS TRIGGER AS
$$

BEGIN
INSERT INTO user_badges (user_id, badge_id)
SELECT NEW.id, b.id
FROM badges b
WHERE b.karma_required <= NEW.karma
AND NOT EXISTS (
SELECT 1 FROM user_badges ub
WHERE ub.user_id = NEW.id AND ub.badge_id = b.id
);
RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER grant_badges_on_karma_change
  AFTER UPDATE OF karma ON users
  FOR EACH ROW
  WHEN (NEW.karma > OLD.karma)
  EXECUTE FUNCTION check_and_grant_badges();

---

## Seeds (Datos Iniciales)

### 1. categories.sql

INSERT INTO categories (id, name, slug, emoji, description, sort_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'Fintech & Bancos', 'fintech', '💳', 'Neobancos, tarjetas, transferencias', 1),
('c2222222-2222-2222-2222-222222222222', 'Compras Online', 'compras', '🛒', 'E-commerce, delivery', 2),
('c3333333-3333-3333-3333-333333333333', 'Entretenimiento', 'streaming', '📺', 'Streaming, música, gaming', 3),
('c4444444-4444-4444-4444-444444444444', 'Seguridad', 'seguridad', '🔒', 'VPN, cloud, antivirus', 4),
('c5555555-5555-5555-5555-555555555555', 'Productividad', 'apps', '📱', 'Software, cursos online', 5),
('c6666666-6666-6666-6666-666666666666', 'Crypto & Trading', 'crypto', '🪙', 'Exchanges, wallets', 6);

### 2. badges.sql

INSERT INTO badges (id, name, slug, emoji, description, karma_required, level_required, rarity) VALUES
('b1111111-1111-1111-1111-111111111111', 'Explorador', 'explorador', '🌱', 'Primeros pasos en la comunidad', 0, 1, 'common'),
('b2222222-2222-2222-2222-222222222222', 'Verificador', 'verificador', '✅', 'Contribuidor activo', 101, 2, 'common'),
('b3333333-3333-3333-3333-333333333333', 'Contribuidor', 'contribuidor', '🔥', 'Miembro destacado', 501, 3, 'rare'),
('b4444444-4444-4444-4444-444444444444', 'Experto', 'experto', '💎', 'Referente de la comunidad', 1501, 4, 'epic'),
('b5555555-5555-5555-5555-555555555555', 'Leyenda', 'leyenda', '👑', 'Máximo nivel', 5000, 5, 'legendary');

### 3. demo_user.sql

-- Usuario demo para códigos iniciales
INSERT INTO users (id, email, username, password_hash, karma, level) VALUES
('u0000000-0000-0000-0000-000000000000', 'demo@verificacodigos.com', 'VerificaCodigos', '$2a$10$dummyhash', 1000, 3);

---

## Migraciones

### 001_initial.sql (Tablas Base)

Crear tablas: `users`, `categories`, `codes`, `votes`.

### 002_add_badges.sql (Sistema Badges)

-- Tablas badges y user_badges
CREATE TABLE badges (...);
CREATE TABLE user_badges (...);

-- Trigger para otorgar badges automáticamente
CREATE TRIGGER grant_badges_on_karma_change...

### 003_add_gamification.sql (Sistema Flujo)

-- Tablas karma_log y user_streaks
CREATE TABLE karma_log (...);
CREATE TABLE user_streaks (...);

-- Triggers para gestión de karma
CREATE TRIGGER trigger_verification_milestones...
CREATE TRIGGER trigger_penalize_expired...
CREATE TRIGGER trigger_update_streak...

### 004_add_indexes.sql (Optimización)

-- Índices adicionales para búsquedas comunes
CREATE INDEX idx_codes_app_name_lower ON codes(LOWER(app_name));
CREATE INDEX idx_codes_expires_soon ON codes(expires_at) WHERE expires_at > now();
CREATE INDEX idx_votes_recent ON votes(created_at DESC) WHERE created_at > now() - interval '7 days';

-- Materialized view para stats homepage
CREATE MATERIALIZED VIEW homepage_stats AS
SELECT
  (SELECT COUNT(*) FROM codes WHERE is_active = true) AS total_codes,
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT SUM(verified_count) FROM codes) AS total_verifications,
  (SELECT SUM(karma) FROM users) AS total_karma_community
WITH DATA;

CREATE UNIQUE INDEX ON homepage_stats ((1));

---

## Queries Útiles

### Top 10 Códigos Más Verificados

SELECT
  c.app_name,
  c.code,
  c.verified_count,
  cat.name AS category,
  u.username AS author
FROM codes c
JOIN categories cat ON c.category_id = cat.id
JOIN users u ON c.user_id = u.id
WHERE c.is_active = true
ORDER BY c.verified_count DESC
LIMIT 10;

### Ranking Top 100 Usuarios

SELECT
  username,
  karma,
  level,
  (SELECT COUNT(*) FROM codes WHERE user_id = users.id) AS codes_submitted,
  (SELECT COUNT(*) FROM votes WHERE user_id = users.id) AS votes_cast
FROM users
ORDER BY karma DESC, level DESC
LIMIT 100;

### Códigos Próximos a Expirar (7 días)

SELECT
  app_name,
  code,
  expires_at,
  (expires_at - now()) AS time_remaining
FROM codes
WHERE is_active = true
  AND expires_at IS NOT NULL
  AND expires_at BETWEEN now() AND now() + interval '7 days'
ORDER BY expires_at ASC;

### Búsqueda Full-Text

SELECT
  app_name,
  code,
  description,
  ts_rank(
    to_tsvector('spanish', app_name || ' ' || COALESCE(description, '')),
    query
  ) AS rank
FROM codes,
  to_tsquery('spanish', 'netflix | spotify') AS query
WHERE to_tsvector('spanish', app_name || ' ' || COALESCE(description, '')) @@ query
ORDER BY rank DESC;

### Stats Usuario Individual

WITH user_stats AS (
  SELECT
    u.id,
    u.username,
    u.karma,
    u.level,
    COUNT(DISTINCT c.id) AS codes_count,
    COUNT(DISTINCT v.id) AS votes_count,
    SUM(c.verified_count) AS total_verifications_received,
    COUNT(DISTINCT ub.badge_id) AS badges_count
  FROM users u
  LEFT JOIN codes c ON c.user_id = u.id
  LEFT JOIN votes v ON v.user_id = u.id
  LEFT JOIN user_badges ub ON ub.user_id = u.id
  WHERE u.id = 'USER_ID_AQUI'
  GROUP BY u.id, u.username, u.karma, u.level
)
SELECT * FROM user_stats;

### Historial de Karma de Usuario

SELECT
  amount,
  reason,
  related_code_id,
  created_at
FROM karma_log
WHERE user_id = 'USER_ID_AQUI'
ORDER BY created_at DESC
LIMIT 50;

---

## Funciones Útiles

### Actualizar Karma Usuario

CREATE OR REPLACE FUNCTION update_user_karma(
  p_user_id UUID,
  p_karma_change INTEGER,
  p_reason TEXT,
  p_code_id UUID DEFAULT NULL
)
RETURNS void AS
$$

BEGIN
UPDATE users
SET karma = karma + p_karma_change
WHERE id = p_user_id;

INSERT INTO karma_log (user_id, amount, reason, related_code_id)
VALUES (p_user_id, p_karma_change, p_reason, p_code_id);
END;

$$
LANGUAGE plpgsql;

-- Uso:
-- SELECT update_user_karma('user-uuid', 10, 'manual_adjustment');

### Marcar Códigos Expirados (Cron Job)

CREATE OR REPLACE FUNCTION mark_expired_codes()
RETURNS INTEGER AS
$$

DECLARE
affected_count INTEGER;
BEGIN
UPDATE codes
SET is_active = false
WHERE is_active = true
AND expires_at IS NOT NULL
AND expires_at < now();

GET DIAGNOSTICS affected_count = ROW_COUNT;
RETURN affected_count;
END;

$$
LANGUAGE plpgsql;

-- Ejecutar diariamente vía Supabase pg_cron:
-- SELECT cron.schedule('mark-expired-codes', '0 0 * * *', 'SELECT mark_expired_codes();');

---

## Backup y Mantenimiento

### Script Backup Diario

#!/bin/bash
# backup.sh - Ejecutar diariamente

DATE=$(date +%Y%m%d)
pg_dump -h db.xxx.supabase.co -U postgres verificacodigos > backup_$DATE.sql

### Vacuum y Analyze (Mantenimiento)

-- Ejecutar semanalmente para optimizar performance
VACUUM ANALYZE codes;
VACUUM ANALYZE users;
VACUUM ANALYZE votes;

-- Refrescar materialized views
REFRESH MATERIALIZED VIEW homepage_stats;

---

## Deployment

### Orden de Ejecución

# 1. Crear tablas base
psql -f database/migrations/001_initial.sql

# 2. Insertar categorías
psql -f database/seeds/categories.sql

# 3. Sistema badges
psql -f database/migrations/002_add_badges.sql
psql -f database/seeds/badges.sql

# 4. Sistema Flujo (gamificación)
psql -f database/migrations/003_add_gamification.sql

# 5. Índices adicionales
psql -f database/migrations/004_add_indexes.sql

# 6. Datos demo
psql -f database/seeds/demo_user.sql

---

## Checklist Producción

\begin{itemize}
\item[$\square$] Todas las tablas tienen RLS habilitado
\item[$\square$] Índices creados en columnas frecuentemente consultadas
\item[$\square$] Triggers de updated\_at funcionando
\item[$\square$] Seeds de categorías y badges insertados
\item[$\square$] Backup automático configurado (Supabase lo hace por defecto)
\item[$\square$] pg\_cron configurado para marcar códigos expirados
\item[$\square$] Materialized views refrescándose cada 5min
\item[$\square$] Full-text search testeado con búsquedas reales
\item[$\square$] Constraint anti-autovotos activado
\item[$\square$] Validación de descuentos implementada
\item[$\square$] Rate limiting configurado (10 códigos/hora)
\item[$\square$] Detección de bots activa
\item[$\square$] Audit log funcionando en tablas críticas
\item[$\square$] Índice unique para códigos duplicados
\item[$\square$] Sistema Flujo integrado (karma\_log, user\_streaks, triggers)
\item[$\square$] Badges otorgándose automáticamente
\end{itemize}

---

## Performance y Capacidad

**Performance esperado:**

\begin{itemize}
\item Queries simples: <10ms
\item Búsquedas full-text: <50ms
\item Ranking top 100: <100ms
\item Homepage stats (cached): <5ms
\end{itemize}

**Capacidad:**

\begin{itemize}
\item 10M códigos: ✅ Soportado
\item 1M usuarios: ✅ Soportado
\item 100M votos: ✅ Soportado (con partitioning)
\item Sistema Flujo: ✅ Escalable (karma\_log con índices optimizados)
\end{itemize}

---

## Recursos

- Supabase Docs: https://supabase.com/docs/guides/database
- PostgreSQL Full-Text Search: https://www.postgresql.org/docs/current/textsearch.html
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
- Performance Tuning: https://wiki.postgresql.org/wiki/Performance_Optimization
- Sistema Flujo: Ver documento GAMIFICATION.md para detalles completos
$$
