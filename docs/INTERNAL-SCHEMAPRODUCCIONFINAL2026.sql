sql
-- INTERNAL-SCHEMAPRODUCCIONFINAL2026.sql
-- Schema completo VerificaCódigos - BD 'cienrazones'
-- PostgreSQL 15+

------------------------------------------------------------
-- 0. EXTENSIONES
------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

------------------------------------------------------------
-- 1. TIPOS ENUM
------------------------------------------------------------

CREATE TYPE tipo_caducidad_enum AS ENUM ('evento', 'fecha', 'ninguna');

CREATE TYPE estado_codigo_enum AS ENUM ('activo', 'caducado', 'eliminado');

------------------------------------------------------------
-- 2. TABLAS BASE (SIN FK)
------------------------------------------------------------

CREATE TABLE categorias (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre  VARCHAR(100) NOT NULL,
  slug    VARCHAR(150) UNIQUE NOT NULL,
  activa  BOOLEAN DEFAULT true
);

CREATE TABLE eventos_especiales (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        VARCHAR(100) NOT NULL,
  fecha_inicio  TIMESTAMPTZ NOT NULL,
  fecha_fin     TIMESTAMPTZ NOT NULL
);

CREATE TABLE dominios_permitidos (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dominio VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE usuarios (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username          VARCHAR(100) UNIQUE NOT NULL CHECK (LENGTH(username) >= 3),
  email             VARCHAR(255) UNIQUE NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,

  -- Gamificación
  puntos            INT DEFAULT 0 CHECK (puntos >= 0 AND puntos <= 10000),
  nivel             INT DEFAULT 1 CHECK (nivel >= 1 AND nivel <= 5),

  -- Estado
  activo            BOOLEAN DEFAULT true,
  bloqueado         BOOLEAN DEFAULT false,
  bloqueado_hasta   TIMESTAMPTZ,

  -- Detección credenciales (FIX #18)
  login_attempts     INT DEFAULT 0,
  login_locked_until TIMESTAMPTZ,
  last_login_ip      INET,
  last_login_time    TIMESTAMPTZ,

  -- Timestamps (FIX #10)
  creado_en          TIMESTAMPTZ DEFAULT NOW() CHECK (creado_en <= NOW()),
  actualizado_en     TIMESTAMPTZ DEFAULT NOW() CHECK (actualizado_en <= NOW())
);

------------------------------------------------------------
-- 3. TABLAS CON FK (CODIGOS, VERIFICACIONES, COMENTARIOS, REPORTES, ETC.)
------------------------------------------------------------

CREATE TABLE codigos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id        UUID REFERENCES categorias(id) ON DELETE RESTRICT,
  creado_por          UUID REFERENCES usuarios(id) ON DELETE SET NULL,

  titulo              VARCHAR(255) NOT NULL CHECK (LENGTH(titulo) BETWEEN 5 AND 255),
  descripcion         TEXT,
  codigo_promocional  VARCHAR(100),

  -- Puntos + concurrencia
  puntos              INT DEFAULT 0 CHECK (puntos >= 0 AND puntos <= 10000),
  version             INT DEFAULT 1, -- Optimistic locking

  -- Usos limitados (FIX #9)
  usos_totales        INT,
  usos_restantes      INT CHECK (usos_restantes >= 0),

  -- Caducidad (3 tipos)
  tipo_caducidad      tipo_caducidad_enum,
  evento_especial_id  UUID REFERENCES eventos_especiales(id),
  fecha_caducidad     TIMESTAMPTZ,

  estado              estado_codigo_enum DEFAULT 'activo',
  es_codigo_vigente   BOOLEAN DEFAULT true,

  positivas           INT DEFAULT 0,
  negativas           INT DEFAULT 0,

  creado_en           TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE verificaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_id   UUID REFERENCES codigos(id) ON DELETE CASCADE,
  usuario_id  UUID REFERENCES usuarios(id) ON DELETE CASCADE,

  es_positiva BOOLEAN NOT NULL,
  comentario  TEXT CHECK (LENGTH(comentario) <= 500),

  creado_en   TIMESTAMPTZ DEFAULT NOW(),

  -- No auto-verificación (FIX #3)
  CONSTRAINT no_self_verificacion CHECK (
    usuario_id <> (SELECT creado_por FROM codigos WHERE id = codigo_id)
  )
);

CREATE TABLE comentarios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_id   UUID REFERENCES codigos(id) ON DELETE CASCADE,
  usuario_id  UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comentarios(id) ON DELETE CASCADE,

  contenido   TEXT NOT NULL CHECK (LENGTH(contenido) BETWEEN 5 AND 1000),
  es_editable BOOLEAN DEFAULT true,

  creado_en   TIMESTAMPTZ DEFAULT NOW(),
  editado_en  TIMESTAMPTZ
);

CREATE TABLE moderadores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID UNIQUE REFERENCES usuarios(id),
  nivel      VARCHAR(20) NOT NULL, -- moderador, senior, admin
  activo     BOOLEAN DEFAULT true
);

CREATE TABLE reportes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_id       UUID REFERENCES codigos(id) ON DELETE RESTRICT,
  usuario_reporta UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  moderador_id    UUID REFERENCES moderadores(id) ON DELETE SET NULL,

  razon           VARCHAR(100) NOT NULL,
  descripcion     TEXT,
  estado          VARCHAR(20) DEFAULT 'pendiente',

  creado_en       TIMESTAMPTZ DEFAULT NOW(),
  resuelto_en     TIMESTAMPTZ
);

CREATE TABLE notificacion_preferencias (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id      UUID UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  email_global    BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false
);

------------------------------------------------------------
-- 4. TABLAS SEO
------------------------------------------------------------

CREATE TABLE seo_metadata (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidad_tipo   VARCHAR(50) NOT NULL, -- codigo, categoria, etc.
  entidad_id     UUID NOT NULL,

  title          VARCHAR(60),
  description    VARCHAR(160),
  keywords       VARCHAR(200),

  og_title       VARCHAR(100),
  og_description VARCHAR(200),
  og_image       TEXT,

  schema_json    JSONB,
  canonical_url  TEXT,
  slug           VARCHAR(100) UNIQUE,

  noindex        BOOLEAN DEFAULT false,
  nofollow       BOOLEAN DEFAULT false,

  creado_en      TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seo_keywords (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword      VARCHAR(200) NOT NULL,
  current_rank INT,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seo_performance (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidad_tipo   VARCHAR(50),
  entidad_id     UUID,
  organic_traffic INT,
  ctr            NUMERIC(5,2),
  bounce_rate    NUMERIC(5,2),
  fecha          DATE DEFAULT CURRENT_DATE
);

CREATE TABLE seo_links (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidad_tipo VARCHAR(50),
  entidad_id   UUID,
  url          TEXT NOT NULL,
  es_interno   BOOLEAN DEFAULT true
);

CREATE TABLE seo_sitemaps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path        TEXT NOT NULL,
  generado_en TIMESTAMPTZ DEFAULT NOW()
);

------------------------------------------------------------
-- 5. TABLAS SISTEMA
------------------------------------------------------------

CREATE TABLE anomalias_usuario (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID REFERENCES usuarios(id),
  tipo        VARCHAR(50),
  detalles    JSONB,
  creado_en   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admin_actions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id      UUID REFERENCES usuarios(id),
  accion        VARCHAR(100),
  tabla_afectada TEXT,
  registro_id   UUID,
  detalles      JSONB,
  creado_en     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cron_locks (
  job_name  TEXT PRIMARY KEY,
  locked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cron_executions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name      TEXT,
  status        TEXT,
  rows_affected INT,
  executed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gdpr_purge_log (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id         UUID,
  tabla              TEXT,
  registros_afectados INT,
  purgado_en         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE usuarios_borrados_log (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id        UUID,
  username          TEXT,
  email             TEXT,
  razon             TEXT,
  borrado_en        TIMESTAMPTZ DEFAULT NOW(),
  recuperable_hasta TIMESTAMPTZ
);

CREATE TABLE mantenimiento_status (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mensaje   TEXT,
  activo    BOOLEAN DEFAULT false,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

------------------------------------------------------------
-- 6. FUNCIONES CORE
------------------------------------------------------------

-- Actualizar puntos de código de forma segura (FIX #1, #20, #21)
CREATE OR REPLACE FUNCTION actualizar_puntos_seguro(
  p_codigo_id UUID,
  p_delta     INT
) RETURNS BOOLEAN AS $$
DECLARE
  v_puntos_nuevos INT;
BEGIN
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

  UPDATE codigos
  SET puntos       = puntos + p_delta,
      version      = version + 1,
      actualizado_en = NOW()
  WHERE id = p_codigo_id
  RETURNING puntos INTO v_puntos_nuevos;

  IF v_puntos_nuevos < 0 OR v_puntos_nuevos > 10000 THEN
    RAISE EXCEPTION 'Puntos fuera de rango';
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Purga GDPR de usuario (FIX #7, #24)
CREATE OR REPLACE FUNCTION purga_gdpr_usuario(
  p_usuario_id UUID
) RETURNS VOID AS $$
BEGIN
  DELETE FROM verificaciones WHERE usuario_id = p_usuario_id;
  DELETE FROM comentarios    WHERE usuario_id = p_usuario_id;

  UPDATE usuarios
  SET username      = 'deleted_' || SUBSTR(id::TEXT, 1, 8),
      email         = 'deleted_' || id::TEXT || '@deleted.local',
      password_hash = '',
      activo        = false
  WHERE id = p_usuario_id;

  INSERT INTO gdpr_purge_log (usuario_id, tabla, registros_afectados, purgado_en)
  VALUES (p_usuario_id, 'usuarios', 1, NOW());

  INSERT INTO usuarios_borrados_log (usuario_id, username, email, razon, borrado_en, recuperable_hasta)
  SELECT id, username, email, 'GDPR purge', NOW(), NOW() + INTERVAL '30 days'
  FROM usuarios
  WHERE id = p_usuario_id;
END;
$$ LANGUAGE plpgsql;

------------------------------------------------------------
-- 7. TRIGGERS (RATE LIMIT, NO AUTOVERIFICACIÓN, COMENTARIOS, TIMESTAMPS)
------------------------------------------------------------

-- Rate limit verificaciones (FIX #2)
CREATE OR REPLACE FUNCTION fn_validar_rate_limit_verificaciones()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM verificaciones
  WHERE usuario_id = NEW.usuario_id
    AND creado_en > NOW() - INTERVAL '24 hours';

  IF v_count >= 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded (max 50 verificaciones/día)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rate_limit_verificaciones
BEFORE INSERT ON verificaciones
FOR EACH ROW
EXECUTE FUNCTION fn_validar_rate_limit_verificaciones();

-- Max 2 niveles en comentarios (FIX #4)
CREATE OR REPLACE FUNCTION fn_validar_max_niveles_comentarios()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_parent UUID;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT parent_id INTO v_parent_parent
  FROM comentarios
  WHERE id = NEW.parent_id;

  IF v_parent_parent IS NOT NULL THEN
    RAISE EXCEPTION 'Max 2 niveles de comentarios alcanzado';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_max_niveles_comentarios
BEFORE INSERT ON comentarios
FOR EACH ROW
EXECUTE FUNCTION fn_validar_max_niveles_comentarios();

-- Validar comentarios sin URLs y sin duplicados (FIX #6)
CREATE OR REPLACE FUNCTION fn_validar_comentario_seguro()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
BEGIN
  IF NEW.contenido ~* 'https?://' THEN
    RAISE EXCEPTION 'No se permiten URLs en comentarios';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM comentarios
  WHERE usuario_id = NEW.usuario_id
    AND contenido  = NEW.contenido
    AND creado_en > NOW() - INTERVAL '1 hour';

  IF v_count > 0 THEN
    RAISE EXCEPTION 'Comentario duplicado en la última hora';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_comentario
BEFORE INSERT ON comentarios
FOR EACH ROW
EXECUTE FUNCTION fn_validar_comentario_seguro();

-- Proteger timestamps (FIX #10)
CREATE OR REPLACE FUNCTION fn_proteger_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.creado_en    := OLD.creado_en;
  NEW.actualizado_en := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proteger_timestamps_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION fn_proteger_timestamps();

CREATE TRIGGER trg_proteger_timestamps_codigos
BEFORE UPDATE ON codigos
FOR EACH ROW
EXECUTE FUNCTION fn_proteger_timestamps();

------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS)
------------------------------------------------------------

ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Moderador solo ve sus reportes, admin ve todos (pseudocódigo auth.uid)
CREATE POLICY moderador_ver_reportes_asignados
ON reportes
FOR SELECT
USING (
  moderador_id IN (
    SELECT id
    FROM moderadores
    WHERE usuario_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM moderadores
    WHERE usuario_id = auth.uid()
      AND nivel = 'admin'
  )
);

CREATE POLICY admin_actions_only_admin
ON admin_actions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM moderadores
    WHERE usuario_id = auth.uid()
      AND nivel = 'admin'
  )
);

------------------------------------------------------------
-- 9. CRON JOBS (pg_cron)
------------------------------------------------------------

-- Marcar códigos caducados diariamente 01:00 (FIX #8)
SELECT cron.schedule(
  'marcar-codigos-caducados',
  '0 1 * * *',
$$
BEGIN
  INSERT INTO cron_locks (job_name) VALUES ('marcar-codigos-caducados')
  ON CONFLICT (job_name) DO NOTHING;

  UPDATE codigos
  SET estado = 'caducado',
      es_codigo_vigente = false
  WHERE tipo_caducidad = 'fecha'
    AND fecha_caducidad <= NOW()
    AND estado = 'activo';

  INSERT INTO cron_executions (job_name, status, rows_affected, executed_at)
  VALUES ('marcar-codigos-caducados', 'success', ROW_COUNT, NOW());

  DELETE FROM cron_locks WHERE job_name = 'marcar-codigos-caducados';
END;
$$
);

-- Otros jobs (eliminar sin uso, generar sitemap, check-cron-failures, hard delete, SEO, etc.)
-- se pueden añadir siguiendo el mismo patrón de cron.schedule.

------------------------------------------------------------
-- FIN SCHEMA