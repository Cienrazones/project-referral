# 🗺️ ROADMAP GLOBAL CON SEO - VerificaCódigos

**Versión:** 1.0 Final  
**Fecha:** 2 Febrero 2026, 01:26 WET  
**Status:** 🟢 Production Ready  
**Duración:** 12 semanas (post-MVP Admin)  
**Objetivo:** Aplicación completa, optimizada SEO, segura y escalable

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General Roadmap](#1-visión-general-roadmap)
2. [Fase 1: Database & Backend Core (Semanas 1-3)](#2-fase-1-database--backend-core-semanas-1-3)
3. [Fase 2: SEO Foundation (Semanas 4-5)](#3-fase-2-seo-foundation-semanas-4-5)
4. [Fase 3: Frontend Public & UX (Semanas 6-8)](#4-fase-3-frontend-public--ux-semanas-6-8)
5. [Fase 4: SEO Advanced & Performance (Semanas 9-10)](#5-fase-4-seo-advanced--performance-semanas-9-10)
6. [Fase 5: Security Hardening (Semana 11)](#6-fase-5-security-hardening-semana-11)
7. [Fase 6: Launch & Monitoring (Semana 12)](#7-fase-6-launch--monitoring-semana-12)
8. [Vigilancia Continua de Seguridad](#8-vigilancia-continua-de-seguridad)
9. [Dónde Buscar Fixes y Vulnerabilidades](#9-dónde-buscar-fixes-y-vulnerabilidades)
10. [Compliance y Aspectos Legales](#10-compliance-y-aspectos-legales)

---

## 1. VISIÓN GENERAL ROADMAP

### 1.1 Contexto

```
PUNTO DE PARTIDA (Semana 0):
  ✅ MVP Admin completado (4 semanas)
  ✅ Base de datos diseñada
  ✅ 24 vulnerabilidades documentadas
  ✅ 3 documentos técnicos internos

OBJETIVO FINAL (Semana 12):
  🎯 Aplicación pública funcional
  🎯 SEO optimizado (ranking Top 3)
  🎯 Security Score 95%+
  🎯 Performance Score 90%+
  🎯 GDPR compliant
  🎯 Escalable 100k+ usuarios
```

### 1.2 Filosofía de Implementación

```
PRINCIPIOS CLAVE:

1. DATABASE FIRST
   └─ Implementar primero cambios de BD
   └─ Migraciones atómicas y reversibles
   └─ Testing exhaustivo antes de backend/frontend

2. SECURITY BY DESIGN
   └─ Cada feature con análisis de vulnerabilidades
   └─ Peer review obligatorio
   └─ Audit logging en todo momento

3. SEO FROM DAY ONE
   └─ Metadata desde el inicio
   └─ URLs optimizadas
   └─ Schema.org markup

4. TESTING CONTINUO
   └─ Unit tests (80% coverage)
   └─ Integration tests
   └─ Security scans (npm audit, Snyk)

5. MONITORING ACTIVO
   └─ Performance tracking
   └─ Error logging (Sentry)
   └─ SEO monitoring (GSC, Analytics)
```

### 1.3 Distribución Semanal

```
┌────────────────────────────────────────────────────────┐
│            TIMELINE 12 SEMANAS                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│ S1-S3:  Database & Backend Core (3 semanas)          │
│ S4-S5:  SEO Foundation (2 semanas)                    │
│ S6-S8:  Frontend Public & UX (3 semanas)              │
│ S9-S10: SEO Advanced & Performance (2 semanas)        │
│ S11:    Security Hardening (1 semana)                 │
│ S12:    Launch & Monitoring (1 semana)                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 2. FASE 1: DATABASE & BACKEND CORE (SEMANAS 1-3)

### 2.1 Semana 1: Database Setup & Core Tables

**Objetivo:** Base de datos en producción con tablas core

#### Día 1-2: Setup PostgreSQL/Supabase

```sql
-- SCRIPT 1: Crear base de datos
CREATE DATABASE cienrazones
  WITH ENCODING = 'UTF8'
  LC_COLLATE = 'es_ES.UTF-8'
  LC_CTYPE = 'es_ES.UTF-8'
  TEMPLATE = template0;

-- SCRIPT 2: Activar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
```

**Vulnerabilidades a Vigilar:**

```
⚠️ PUNTO CRÍTICO: Credenciales de BD
  └─ Usar variables de entorno (DATABASE_URL)
  └─ Nunca commitear .env al repo
  └─ Rotar passwords cada 90 días
  └─ Activar SSL/TLS obligatorio

⚠️ PUNTO CRÍTICO: Permisos de usuario
  └─ Usuario app: SOLO SELECT/INSERT/UPDATE/DELETE
  └─ Usuario admin: Permisos completos
  └─ Evitar usar superuser en app
```

#### Día 3-4: Tablas Core

```sql
-- ORDEN CORRECTO DE CREACIÓN:

-- 1. Tablas independientes (sin FK)
CREATE TABLE categorias (...);
CREATE TABLE eventos_especiales (...);

-- 2. Usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  puntos INT DEFAULT 0 CHECK (puntos >= 0 AND puntos <= 10000),
  nivel INT DEFAULT 1 CHECK (nivel >= 1 AND nivel <= 5),
  activo BOOLEAN DEFAULT true,
  bloqueado BOOLEAN DEFAULT false,
  bloqueado_hasta TIMESTAMPTZ,
  login_attempts INT DEFAULT 0,
  login_locked_until TIMESTAMPTZ,
  last_login_ip INET,
  last_login_time TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Códigos (depende de usuarios + categorias)
CREATE TABLE codigos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id) ON DELETE RESTRICT,
  creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  actualizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  titulo VARCHAR(255) NOT NULL CHECK (LENGTH(titulo) >= 5),
  descripcion TEXT,
  codigo_promocional VARCHAR(100) NOT NULL,
  puntos INT DEFAULT 0 CHECK (puntos >= 0 AND puntos <= 10000),
  version INT DEFAULT 1,
  usos_totales INT,
  usos_restantes INT CHECK (usos_restantes >= 0),
  tipo_caducidad VARCHAR(20) CHECK (tipo_caducidad IN ('evento_especial', 'fecha_personalizada', 'sin_caducidad')),
  evento_especial_id UUID REFERENCES eventos_especiales(id),
  fecha_caducidad TIMESTAMPTZ,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'caducado', 'eliminado')),
  es_codigo_vigente BOOLEAN DEFAULT true,
  positivas INT DEFAULT 0,
  negativas INT DEFAULT 0,
  rating_promedio FLOAT CHECK (rating_promedio >= 0 AND rating_promedio <= 5),
  total_reviews INT DEFAULT 0,
  engagement_score INT DEFAULT 0,
  ultima_verificacion TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Verificaciones (depende de codigos + usuarios)
CREATE TABLE verificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_id UUID REFERENCES codigos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  es_positiva BOOLEAN NOT NULL,
  comentario TEXT CHECK (LENGTH(comentario) <= 500),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_self_verificacion CHECK (usuario_id != (SELECT creado_por FROM codigos WHERE id = codigo_id))
);

-- 5. Comentarios (depende de codigos + usuarios)
CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_id UUID REFERENCES codigos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comentarios(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL CHECK (LENGTH(contenido) >= 5 AND LENGTH(contenido) <= 1000),
  es_editable BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  editado_en TIMESTAMPTZ
);

-- 6. Moderadores + Reportes
CREATE TABLE moderadores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('moderador', 'senior', 'admin')),
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reportes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_id UUID REFERENCES codigos(id) ON DELETE RESTRICT,
  usuario_reporta UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  moderador_id UUID REFERENCES moderadores(id) ON DELETE SET NULL,
  razon VARCHAR(100) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'revisando', 'resuelto', 'rechazado')),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  resuelto_en TIMESTAMPTZ
);
```

**Testing Post-Creación:**

```sql
-- TEST 1: Verificar tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Resultado esperado: 10 tablas core

-- TEST 2: Verificar constraints
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- TEST 3: Insertar datos de prueba
INSERT INTO usuarios (username, email, password_hash)
VALUES ('test_user', 'test@example.com', 'hashed_password');

-- Si falla: revisar constraints
```

**Checklist Semana 1:**

```
☐ PostgreSQL 15+ instalado
☐ Extensiones activadas (uuid-ossp, pgcrypto, pg_cron)
☐ 10 tablas core creadas
☐ Constraints verificados
☐ Foreign keys correctos
☐ Índices básicos creados
☐ Tests de inserción pasando
☐ Backup de BD configurado
```

---

### 2.2 Semana 2: Funciones & Triggers (Security Layer)

**Objetivo:** Implementar capa de seguridad en BD

#### Funciones Core (8 funciones)

```sql
-- FUNCIÓN 1: Actualizar Puntos Seguro (FIX #1 - Race Conditions)
CREATE OR REPLACE FUNCTION actualizar_puntos_seguro(
  p_codigo_id UUID,
  p_puntos_delta INT
) RETURNS VOID AS $$
BEGIN
  -- SERIALIZABLE isolation level previene race conditions
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  
  UPDATE codigos
  SET 
    puntos = puntos + p_puntos_delta,
    version = version + 1  -- Optimistic locking
  WHERE id = p_codigo_id;
  
  -- Actualizar puntos del autor
  UPDATE usuarios u
  SET puntos = puntos + p_puntos_delta
  FROM codigos c
  WHERE c.id = p_codigo_id
  AND u.id = c.creado_por;
END;
$$ LANGUAGE plpgsql;

-- FUNCIÓN 2: Usar Código Limitado (FIX #9 - Atomic Operations)
CREATE OR REPLACE FUNCTION usar_codigo_limitado(
  p_codigo_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_usos_restantes INT;
BEGIN
  -- Lock pesimista para prevenir race conditions
  SELECT usos_restantes INTO v_usos_restantes
  FROM codigos
  WHERE id = p_codigo_id
  FOR UPDATE;
  
  IF v_usos_restantes IS NULL OR v_usos_restantes > 0 THEN
    UPDATE codigos
    SET usos_restantes = COALESCE(usos_restantes, 0) - 1
    WHERE id = p_codigo_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- FUNCIÓN 3: Purga GDPR Usuario (FIX #7)
CREATE OR REPLACE FUNCTION purga_gdpr_usuario(
  p_usuario_id UUID
) RETURNS VOID AS $$
BEGIN
  -- 1. Eliminar verificaciones
  DELETE FROM verificaciones WHERE usuario_id = p_usuario_id;
  
  -- 2. Eliminar comentarios
  DELETE FROM comentarios WHERE usuario_id = p_usuario_id;
  
  -- 3. Anonimizar usuario
  UPDATE usuarios
  SET 
    username = 'deleted_' || SUBSTR(id::TEXT, 1, 8),
    email = 'deleted_' || SUBSTR(id::TEXT, 1, 8) || '@deleted.local',
    password_hash = '',
    activo = false
  WHERE id = p_usuario_id;
  
  -- 4. Códigos sin propietario (SET NULL automático por FK)
  -- Códigos quedan con creado_por = NULL
  
  -- 5. Log de auditoría GDPR
  INSERT INTO gdpr_purge_log (usuario_id, tabla, registros_afectados, purgado_en)
  VALUES 
    (p_usuario_id, 'verificaciones', (SELECT COUNT(*) FROM verificaciones WHERE usuario_id = p_usuario_id), NOW()),
    (p_usuario_id, 'comentarios', (SELECT COUNT(*) FROM comentarios WHERE usuario_id = p_usuario_id), NOW()),
    (p_usuario_id, 'usuarios', 1, NOW());
  
  -- 6. Log recuperación (30 días)
  INSERT INTO usuarios_borrados_log (
    usuario_id,
    username,
    email,
    razon,
    borrado_en,
    recuperable_hasta
  )
  SELECT 
    id,
    username,
    email,
    'GDPR purge',
    NOW(),
    NOW() + INTERVAL '30 days'
  FROM usuarios
  WHERE id = p_usuario_id;
END;
$$ LANGUAGE plpgsql;
```

#### Triggers de Seguridad (8 triggers)

```sql
-- TRIGGER 1: No Auto-Verificación (FIX #3)
CREATE OR REPLACE FUNCTION trg_no_auto_verificacion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.usuario_id = (SELECT creado_por FROM codigos WHERE id = NEW.codigo_id) THEN
    RAISE EXCEPTION 'No puedes verificar tu propio código';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_auto_verificacion
BEFORE INSERT ON verificaciones
FOR EACH ROW
EXECUTE FUNCTION trg_no_auto_verificacion();

-- TRIGGER 2: Rate Limiting Verificaciones (FIX #2)
CREATE OR REPLACE FUNCTION trg_rate_limit_verificaciones()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM verificaciones
  WHERE usuario_id = NEW.usuario_id
  AND DATE(creado_en) = CURRENT_DATE;
  
  IF v_count >= 50 THEN
    RAISE EXCEPTION 'Límite de 50 verificaciones diarias alcanzado';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rate_limit_verificaciones
BEFORE INSERT ON verificaciones
FOR EACH ROW
EXECUTE FUNCTION trg_rate_limit_verificaciones();

-- TRIGGER 3: Validar URLs Código (FIX #5)
CREATE OR REPLACE FUNCTION trg_validar_url_codigo()
RETURNS TRIGGER AS $$
DECLARE
  v_url_valida BOOLEAN;
BEGIN
  -- Validar que URL esté en whitelist
  SELECT EXISTS (
    SELECT 1 FROM dominios_permitidos
    WHERE NEW.descripcion ILIKE '%' || dominio || '%'
    OR NEW.titulo ILIKE '%' || dominio || '%'
  ) INTO v_url_valida;
  
  IF NOT v_url_valida AND (NEW.descripcion ~ 'https?://' OR NEW.titulo ~ 'https?://') THEN
    RAISE EXCEPTION 'URL no permitida. Solo dominios whitelisted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_url_codigo
BEFORE INSERT OR UPDATE ON codigos
FOR EACH ROW
EXECUTE FUNCTION trg_validar_url_codigo();

-- TRIGGER 4: Validar Comentarios Seguros (FIX #6)
CREATE OR REPLACE FUNCTION trg_validar_comentario()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Sin URLs
  IF NEW.contenido ~ 'https?://' THEN
    RAISE EXCEPTION 'URLs no permitidas en comentarios';
  END IF;
  
  -- 2. Sin duplicados (mismo contenido en última hora)
  IF EXISTS (
    SELECT 1 FROM comentarios
    WHERE usuario_id = NEW.usuario_id
    AND codigo_id = NEW.codigo_id
    AND contenido = NEW.contenido
    AND creado_en > NOW() - INTERVAL '1 hour'
  ) THEN
    RAISE EXCEPTION 'Comentario duplicado reciente';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_comentario
BEFORE INSERT ON comentarios
FOR EACH ROW
EXECUTE FUNCTION trg_validar_comentario();

-- TRIGGER 5: Max 2 Niveles Comentarios (FIX #4)
CREATE OR REPLACE FUNCTION trg_max_2_niveles_comentarios()
RETURNS TRIGGER AS $$
DECLARE
  v_nivel INT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;  -- Nivel 1
  END IF;
  
  -- Calcular nivel
  WITH RECURSIVE niveles AS (
    SELECT id, parent_id, 1 AS nivel
    FROM comentarios
    WHERE id = NEW.parent_id
    
    UNION ALL
    
    SELECT c.id, c.parent_id, n.nivel + 1
    FROM comentarios c
    INNER JOIN niveles n ON c.id = n.parent_id
  )
  SELECT MAX(nivel) INTO v_nivel FROM niveles;
  
  IF v_nivel >= 2 THEN
    RAISE EXCEPTION 'Máximo 2 niveles de comentarios permitidos';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_2_niveles_comentarios
BEFORE INSERT ON comentarios
FOR EACH ROW
EXECUTE FUNCTION trg_max_2_niveles_comentarios();

-- TRIGGER 6: Proteger Timestamps (FIX #10)
CREATE OR REPLACE FUNCTION trg_proteger_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Forzar creado_en = NOW() en INSERT
  NEW.creado_en := NOW();
  
  -- Forzar actualizado_en = NOW() en UPDATE
  IF TG_OP = 'UPDATE' THEN
    NEW.actualizado_en := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proteger_timestamps_codigos
BEFORE INSERT OR UPDATE ON codigos
FOR EACH ROW
EXECUTE FUNCTION trg_proteger_timestamps();

-- TRIGGER 7: Marcar Código Caducado en Verificación (FIX #8)
CREATE OR REPLACE FUNCTION trg_marcar_caducado_en_verificacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si código ya caducado, actualizar estado
  UPDATE codigos
  SET 
    estado = 'caducado',
    es_codigo_vigente = false
  WHERE id = NEW.codigo_id
  AND tipo_caducidad = 'fecha_personalizada'
  AND fecha_caducidad < NOW()
  AND estado = 'activo';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_marcar_caducado_en_verificacion
AFTER INSERT ON verificaciones
FOR EACH ROW
EXECUTE FUNCTION trg_marcar_caducado_en_verificacion();

-- TRIGGER 8: Actualizar Puntos Automático
CREATE OR REPLACE FUNCTION trg_actualizar_puntos_verificacion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.es_positiva THEN
    PERFORM actualizar_puntos_seguro(NEW.codigo_id, 10);
  ELSE
    PERFORM actualizar_puntos_seguro(NEW.codigo_id, -5);
  END IF;
  
  -- Actualizar contadores
  UPDATE codigos
  SET 
    positivas = positivas + CASE WHEN NEW.es_positiva THEN 1 ELSE 0 END,
    negativas = negativas + CASE WHEN NOT NEW.es_positiva THEN 1 ELSE 0 END,
    total_reviews = total_reviews + 1,
    ultima_verificacion = NOW()
  WHERE id = NEW.codigo_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_puntos_verificacion
AFTER INSERT ON verificaciones
FOR EACH ROW
EXECUTE FUNCTION trg_actualizar_puntos_verificacion();
```

**Testing de Triggers:**

```sql
-- TEST 1: No auto-verificación
-- Debe fallar con excepción
INSERT INTO verificaciones (codigo_id, usuario_id, es_positiva)
SELECT id, creado_por, true
FROM codigos
WHERE creado_por IS NOT NULL
LIMIT 1;

-- TEST 2: Rate limiting
-- Crear 51 verificaciones en un día (debe fallar en la 51)
DO $$
DECLARE
  i INT;
  v_codigo_id UUID;
  v_usuario_id UUID;
BEGIN
  SELECT id INTO v_codigo_id FROM codigos LIMIT 1;
  SELECT id INTO v_usuario_id FROM usuarios WHERE id != (SELECT creado_por FROM codigos WHERE id = v_codigo_id) LIMIT 1;
  
  FOR i IN 1..51 LOOP
    INSERT INTO verificaciones (codigo_id, usuario_id, es_positiva)
    VALUES (v_codigo_id, v_usuario_id, true);
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Rate limit funcionando: %', SQLERRM;
END $$;

-- TEST 3: URLs en comentarios
-- Debe fallar
INSERT INTO comentarios (codigo_id, usuario_id, contenido)
SELECT id, creado_por, 'Visita https://spam.com'
FROM codigos
LIMIT 1;

-- TEST 4: Max 2 niveles comentarios
-- Debe fallar al intentar nivel 3
WITH 
  comentario_nivel_1 AS (
    INSERT INTO comentarios (codigo_id, usuario_id, contenido, parent_id)
    SELECT id, creado_por, 'Comentario nivel 1', NULL
    FROM codigos LIMIT 1
    RETURNING id
  ),
  comentario_nivel_2 AS (
    INSERT INTO comentarios (codigo_id, usuario_id, contenido, parent_id)
    SELECT c.id, c.creado_por, 'Comentario nivel 2', cn1.id
    FROM codigos c, comentario_nivel_1 cn1
    LIMIT 1
    RETURNING id
  )
INSERT INTO comentarios (codigo_id, usuario_id, contenido, parent_id)
SELECT c.id, c.creado_por, 'Comentario nivel 3', cn2.id
FROM codigos c, comentario_nivel_2 cn2
LIMIT 1;
-- Debe fallar aquí
```

**Checklist Semana 2:**

```
☐ 8 funciones creadas y testeadas
☐ 8 triggers creados y testeados
☐ Tests de triggers pasando
☐ Race conditions prevenidas (FIX #1, #9)
☐ Rate limiting funcionando (FIX #2)
☐ No auto-verificación (FIX #3)
☐ Max 2 niveles comentarios (FIX #4)
☐ URLs whitelisted (FIX #5)
☐ Comentarios seguros (FIX #6)
☐ GDPR purge (FIX #7)
☐ Timestamps protegidos (FIX #10)
```

---

### 2.3 Semana 3: RLS, Índices, CRON Jobs

**Objetivo:** Capa final de seguridad + automatizaciones

#### Row Level Security (RLS)

```sql
-- RLS POLICY 1: Moderador ver reportes asignados (FIX #15 - BOLA Prevention)
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;

CREATE POLICY moderador_ver_reportes_asignados
ON reportes FOR SELECT
USING (
  moderador_id = current_setting('app.current_user_id')::UUID
  OR EXISTS (
    SELECT 1 FROM moderadores
    WHERE usuario_id = current_setting('app.current_user_id')::UUID
    AND nivel = 'admin'
  )
);

-- RLS POLICY 2: Admin actions solo admin (FIX #16)
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_actions_only_admin
ON admin_actions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM moderadores
    WHERE usuario_id = current_setting('app.current_user_id')::UUID
    AND nivel IN ('admin', 'senior')
  )
);

-- Helper function para setear current_user_id
CREATE OR REPLACE FUNCTION set_current_user_id(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', p_user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;
```

#### Índices Optimizados

```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_codigos_estado ON codigos(estado);
CREATE INDEX idx_codigos_categoria_id ON codigos(categoria_id);
CREATE INDEX idx_codigos_creado_por ON codigos(creado_por);
CREATE INDEX idx_codigos_fecha_caducidad ON codigos(fecha_caducidad) WHERE tipo_caducidad = 'fecha_personalizada';
CREATE INDEX idx_codigos_positivas_negativas ON codigos(positivas, negativas);

CREATE INDEX idx_verificaciones_codigo_id ON verificaciones(codigo_id);
CREATE INDEX idx_verificaciones_usuario_id ON verificaciones(usuario_id);
CREATE INDEX idx_verificaciones_creado_en ON verificaciones(creado_en);

CREATE INDEX idx_comentarios_codigo_id ON comentarios(codigo_id);
CREATE INDEX idx_comentarios_parent_id ON comentarios(parent_id) WHERE parent_id IS NOT NULL;

CREATE INDEX idx_reportes_estado ON reportes(estado);
CREATE INDEX idx_reportes_moderador_id ON reportes(moderador_id) WHERE moderador_id IS NOT NULL;

CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_puntos ON usuarios(puntos);

-- Índices compuestos para queries complejas
CREATE INDEX idx_codigos_activos_categoria ON codigos(categoria_id, estado) WHERE estado = 'activo';
CREATE INDEX idx_verificaciones_fecha_usuario ON verificaciones(usuario_id, creado_en);

-- Índice para búsqueda full-text (opcional)
CREATE INDEX idx_codigos_titulo_gin ON codigos USING gin(to_tsvector('spanish', titulo));
CREATE INDEX idx_codigos_descripcion_gin ON codigos USING gin(to_tsvector('spanish', descripcion));
```

#### CRON Jobs (13 jobs staggered)

```sql
-- Activar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- JOB 1: Marcar códigos caducados (01:00) - FIX #8
SELECT cron.schedule(
  'marcar-codigos-caducados',
  '0 1 * * *',  -- Diario a la 1:00 AM
  $$
  UPDATE codigos 
  SET estado = 'caducado', es_codigo_vigente = false
  WHERE tipo_caducidad = 'fecha_personalizada'
  AND fecha_caducidad < NOW()
  AND estado = 'activo';
  
  INSERT INTO cron_executions (job_name, status, rows_affected)
  VALUES ('marcar-codigos-caducados', 'success', (SELECT COUNT(*) FROM codigos WHERE estado = 'caducado'));
  $$
);

-- JOB 2: Eliminar códigos sin uso (02:00)
SELECT cron.schedule(
  'eliminar-sin-uso',
  '0 2 * * *',
  $$
  UPDATE codigos
  SET estado = 'eliminado'
  WHERE tipo_caducidad = 'sin_caducidad'
  AND ultima_verificacion < NOW() - INTERVAL '21 days'
  AND estado = 'activo'
  LIMIT 1000;
  $$
);

-- JOB 3: Generar sitemap (02:15) - SEO
SELECT cron.schedule(
  'generar-sitemap',
  '15 2 * * *',
  $$
  -- Llamar función que genera sitemap.xml
  PERFORM generar_sitemap();
  $$
);

-- JOB 4: Limpiar códigos borrados (03:00) - Batch operation
SELECT cron.schedule(
  'limpiar-borrados',
  '0 3 * * *',
  $$
  -- Códigos sin propietario + negativas
  DELETE FROM codigos
  WHERE creado_por IS NULL
  AND negativas >= 5
  LIMIT 1000;
  
  -- Códigos eliminados hace > 90 días
  DELETE FROM codigos
  WHERE estado = 'eliminado'
  AND actualizado_en < NOW() - INTERVAL '90 days'
  LIMIT 1000;
  $$
);

-- JOB 5: Check CRON failures (03:30) - Monitoring - FIX #13
SELECT cron.schedule(
  'check-cron-failures',
  '30 3 * * *',
  $$
  DO $$
  DECLARE
    v_failures INT;
  BEGIN
    SELECT COUNT(*) INTO v_failures
    FROM cron_executions
    WHERE status = 'failed'
    AND executed_at > NOW() - INTERVAL '24 hours';
    
    IF v_failures > 0 THEN
      -- Slack webhook alert
      PERFORM http_post(
        'https://hooks.slack.com/services/YOUR_WEBHOOK',
        '{"text": "⚠️ CRON failures detected: ' || v_failures || ' jobs failed in last 24h"}',
        'application/json'
      );
    END IF;
  END $$;
  $$
);

-- JOB 6: Actualizar mantenimiento (04:00)
SELECT cron.schedule(
  'actualizar-mantenimiento',
  '0 4 * * *',
  $$
  -- Auto-completar códigos sin usos restantes
  UPDATE codigos
  SET estado = 'caducado', es_codigo_vigente = false
  WHERE usos_totales IS NOT NULL
  AND usos_restantes = 0
  AND estado = 'activo';
  $$
);

-- JOB 7: Fetch Google Search Console data (04:00) - SEO
SELECT cron.schedule(
  'fetch-gsc-data',
  '0 4 * * *',
  $$
  -- Llamar función que hace fetch de GSC API
  PERFORM fetch_google_search_console_data();
  $$
);

-- JOB 8: Keyword rank tracking (06:00) - SEO
SELECT cron.schedule(
  'keyword-rank-tracking',
  '0 6 * * *',
  $$
  -- Track posición de keywords target
  PERFORM track_keyword_rankings();
  $$
);

-- JOB 9: SEO performance alert (08:00) - SEO
SELECT cron.schedule(
  'seo-performance-alert',
  '0 8 * * *',
  $$
  -- Alertas de performance SEO
  PERFORM seo_performance_alert();
  $$
);

-- JOB 10: Reset rate limits (00:00)
SELECT cron.schedule(
  'reset-rate-limits',
  '0 0 * * *',
  $$
  -- Reset contadores diarios (si usas tabla)
  UPDATE usuarios SET login_attempts = 0;
  $$
);

-- JOB 11: Purga hard delete (SUNDAY 04:00)
SELECT cron.schedule(
  'purga-hard-delete',
  '0 4 * * 0',  -- Solo domingos
  $$
  -- Hard delete usuarios borrados > 90 días
  DELETE FROM usuarios_borrados_log
  WHERE recuperable_hasta < NOW();
  
  -- Hard delete códigos > 90 días eliminados
  DELETE FROM codigos
  WHERE estado = 'eliminado'
  AND actualizado_en < NOW() - INTERVAL '90 days'
  LIMIT 1000;
  $$
);

-- JOB 12: SEO optimization suggestions (SUNDAY 05:00)
SELECT cron.schedule(
  'seo-optimization-suggestions',
  '0 5 * * 0',
  $$
  -- Generar sugerencias de optimización SEO
  PERFORM generar_seo_optimization_suggestions();
  $$
);

-- JOB 13: Limpiar CRON locks (Cada 6 horas)
SELECT cron.schedule(
  'limpiar-cron-locks',
  '0 */6 * * *',
  $$
  DELETE FROM cron_locks
  WHERE created_at < NOW() - INTERVAL '6 hours';
  $$
);
```

**Testing CRON Jobs:**

```sql
-- TEST 1: Ejecutar job manualmente
SELECT cron.unschedule('marcar-codigos-caducados');
-- Ejecutar SQL del job manualmente
-- Verificar resultado
SELECT cron.schedule(...);  -- Re-schedule

-- TEST 2: Verificar schedule
SELECT * FROM cron.job;

-- TEST 3: Ver historial de ejecuciones
SELECT * FROM cron_executions
ORDER BY executed_at DESC
LIMIT 20;
```

**Checklist Semana 3:**

```
☐ RLS policies implementadas (FIX #15, #16)
☐ 20+ índices creados
☐ 13 CRON jobs programados
☐ CRON monitoring funcionando (FIX #13)
☐ Slack webhooks configurados
☐ Tests de RLS pasando
☐ Performance queries < 100ms
☐ Backup automático configurado
```

---

## 3. FASE 2: SEO FOUNDATION (SEMANAS 4-5)

### 3.1 Semana 4: Tablas SEO + Metadata Básica

**Objetivo:** Estructura SEO completa en BD

#### Tablas SEO (5 tablas)

```sql
-- TABLA 1: seo_metadata
CREATE TABLE seo_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entidad_tipo VARCHAR(50) NOT NULL CHECK (entidad_tipo IN ('codigo', 'categoria', 'evento')),
  entidad_id UUID NOT NULL,
  title VARCHAR(60) NOT NULL,
  description VARCHAR(160) NOT NULL,
  keywords VARCHAR(200),
  og_title VARCHAR(100),
  og_description VARCHAR(200),
  og_image TEXT,
  schema_json JSONB,
  canonical_url TEXT,
  slug VARCHAR(100) UNIQUE,
  noindex BOOLEAN DEFAULT false,
  nofollow BOOLEAN DEFAULT false,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entidad_tipo, entidad_id)
);

-- TABLA 2: seo_keywords
CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword VARCHAR(200) UNIQUE NOT NULL,
  search_volume INT,
  difficulty INT CHECK (difficulty >= 0 AND difficulty <= 100),
  current_rank INT,
  target_rank INT,
  tracking_activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  ultima_actualizacion TIMESTAMPTZ
);

-- TABLA 3: seo_performance
CREATE TABLE seo_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha DATE NOT NULL,
  organic_traffic INT DEFAULT 0,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr FLOAT,
  avg_position FLOAT,
  bounce_rate FLOAT,
  session_duration INT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 4: seo_links
CREATE TABLE seo_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(20) CHECK (tipo IN ('internal', 'external', 'backlink')),
  origen_url TEXT,
  destino_url TEXT NOT NULL,
  anchor_text VARCHAR(200),
  follow BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  domain_authority INT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA 5: seo_sitemaps
CREATE TABLE seo_sitemaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) DEFAULT 'general',
  xml_content TEXT NOT NULL,
  total_urls INT,
  generado_en TIMESTAMPTZ DEFAULT NOW()
);
```

#### Función: Generar Metadata Automática

```sql
CREATE OR REPLACE FUNCTION generar_metadata_codigo(p_codigo_id UUID)
RETURNS VOID AS $$
DECLARE
  v_codigo RECORD;
  v_slug TEXT;
  v_schema JSONB;
BEGIN
  -- Obtener código
  SELECT c.*, cat.nombre as categoria_nombre
  INTO v_codigo
  FROM codigos c
  LEFT JOIN categorias cat ON c.categoria_id = cat.id
  WHERE c.id = p_codigo_id;
  
  -- Generar slug
  v_slug := lower(regexp_replace(v_codigo.titulo, '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := 'codigo-' || v_slug || '-' || substr(v_codigo.codigo_promocional, 1, 10);
  
  -- Schema.org markup
  v_schema := jsonb_build_object(
    '@context', 'https://schema.org',
    '@type', 'Thing',
    'name', v_codigo.titulo,
    'description', v_codigo.descripcion,
    'offers', jsonb_build_object(
      '@type', 'Offer',
      'priceValidUntil', v_codigo.fecha_caducidad
    ),
    'aggregateRating', jsonb_build_object(
      '@type', 'AggregateRating',
      'ratingValue', ROUND((v_codigo.positivas::FLOAT / NULLIF(v_codigo.positivas + v_codigo.negativas, 0)) * 5, 1),
      'reviewCount', v_codigo.total_reviews
    )
  );
  
  -- Insertar metadata
  INSERT INTO seo_metadata (
    entidad_tipo,
    entidad_id,
    title,
    description,
    keywords,
    og_title,
    og_description,
    schema_json,
    canonical_url,
    slug
  )
  VALUES (
    'codigo',
    p_codigo_id,
    v_codigo.titulo || ' - Código ' || v_codigo.codigo_promocional,
    'Código promocional ' || v_codigo.codigo_promocional || ' para ' || v_codigo.categoria_nombre || '. ' || LEFT(v_codigo.descripcion, 100),
    'código ' || lower(v_codigo.categoria_nombre) || ', ' || v_codigo.codigo_promocional || ', descuento',
    '🎯 ' || v_codigo.titulo,
    v_codigo.descripcion,
    v_schema,
    'https://verificacodigos.com/' || v_slug,
    v_slug
  )
  ON CONFLICT (entidad_tipo, entidad_id)
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    keywords = EXCLUDED.keywords,
    og_title = EXCLUDED.og_title,
    og_description = EXCLUDED.og_description,
    schema_json = EXCLUDED.schema_json,
    canonical_url = EXCLUDED.canonical_url,
    slug = EXCLUDED.slug,
    actualizado_en = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generar metadata al crear código
CREATE OR REPLACE FUNCTION trg_auto_generar_metadata()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generar_metadata_codigo(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_generar_metadata
AFTER INSERT ON codigos
FOR EACH ROW
EXECUTE FUNCTION trg_auto_generar_metadata();
```

#### Función: Generar Sitemap.xml

```sql
CREATE OR REPLACE FUNCTION generar_sitemap()
RETURNS VOID AS $$
DECLARE
  v_xml TEXT;
  v_total_urls INT;
BEGIN
  -- Construir XML del sitemap
  v_xml := '<?xml version="1.0" encoding="UTF-8"?>' || E'\n';
  v_xml := v_xml || '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' || E'\n';
  
  -- URLs de códigos activos
  v_xml := v_xml || (
    SELECT string_agg(
      '  <url>' || E'\n' ||
      '    <loc>' || sm.canonical_url || '</loc>' || E'\n' ||
      '    <lastmod>' || c.actualizado_en::DATE || '</lastmod>' || E'\n' ||
      '    <changefreq>weekly</changefreq>' || E'\n' ||
      '    <priority>0.8</priority>' || E'\n' ||
      '  </url>' || E'\n',
      ''
    )
    FROM codigos c
    INNER JOIN seo_metadata sm ON c.id = sm.entidad_id AND sm.entidad_tipo = 'codigo'
    WHERE c.estado = 'activo'
    AND sm.noindex = false
  );
  
  v_xml := v_xml || '</urlset>';
  
  -- Contar URLs
  SELECT COUNT(*) INTO v_total_urls
  FROM codigos c
  INNER JOIN seo_metadata sm ON c.id = sm.entidad_id
  WHERE c.estado = 'activo'
  AND sm.noindex = false;
  
  -- Guardar sitemap
  INSERT INTO seo_sitemaps (tipo, xml_content, total_urls)
  VALUES ('general', v_xml, v_total_urls);
END;
$$ LANGUAGE plpgsql;
```

**Checklist Semana 4:**

```
☐ 5 tablas SEO creadas
☐ Función generar_metadata_codigo()
☐ Trigger auto-generar metadata
☐ Función generar_sitemap()
☐ CRON sitemap configurado (02:15)
☐ Schema.org markup generándose
☐ Slugs únicos generándose
☐ Tests de metadata pasando
```

---

### 3.2 Semana 5: SEO Keywords + Google Search Console Integration

**Objetivo:** Tracking de keywords + integración GSC

#### Keywords Target (iniciales)

```sql
-- Insertar keywords objetivo
INSERT INTO seo_keywords (keyword, search_volume, difficulty, target_rank, tracking_activo)
VALUES
  ('código descuento netflix', 50000, 70, 3, true),
  ('codigo promocional amazon', 45000, 75, 3, true),
  ('descuento streaming 2026', 20000, 60, 5, true),
  ('códigos gratis compras', 30000, 65, 5, true),
  ('código netflix marzo 2026', 10000, 50, 3, true),
  ('cómo conseguir códigos gratis', 15000, 55, 3, true),
  ('verificar código promocional', 8000, 40, 1, true),
  ('códigos descuento online', 25000, 60, 5, true),
  ('promociones netflix', 18000, 70, 10, true),
  ('descuentos amazon 2026', 22000, 72, 10, true);
```

#### Función: Track Keyword Rankings

```sql
CREATE OR REPLACE FUNCTION track_keyword_rankings()
RETURNS VOID AS $$
DECLARE
  v_keyword RECORD;
  v_current_rank INT;
BEGIN
  FOR v_keyword IN 
    SELECT * FROM seo_keywords 
    WHERE tracking_activo = true
  LOOP
    -- Aquí llamarías a API externa (SERPWatcher, SEMrush, etc.)
    -- Por simplicidad, simulamos:
    v_current_rank := FLOOR(RANDOM() * 100) + 1;
    
    UPDATE seo_keywords
    SET 
      current_rank = v_current_rank,
      ultima_actualizacion = NOW()
    WHERE id = v_keyword.id;
    
    -- Si bajó > 10 posiciones, alertar
    IF v_current_rank - v_keyword.current_rank > 10 THEN
      -- Slack alert
      PERFORM http_post(
        'https://hooks.slack.com/services/YOUR_WEBHOOK',
        '{"text": "⚠️ SEO Alert: Keyword `' || v_keyword.keyword || '` dropped from #' || v_keyword.current_rank || ' to #' || v_current_rank || '"}',
        'application/json'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

#### Función: Fetch Google Search Console Data

```sql
CREATE OR REPLACE FUNCTION fetch_google_search_console_data()
RETURNS VOID AS $$
DECLARE
  v_response JSONB;
  v_data RECORD;
BEGIN
  -- Llamar a GSC API (requiere credenciales OAuth2)
  -- Por simplicidad, ejemplo de estructura:
  
  /*
  v_response := http_get(
    'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fverificacodigos.com/searchAnalytics/query',
    'Bearer YOUR_ACCESS_TOKEN'
  );
  */
  
  -- Parsear respuesta y guardar
  FOR v_data IN 
    SELECT * FROM jsonb_to_recordset(v_response->'rows') AS (
      keys TEXT[],
      clicks INT,
      impressions INT,
      ctr FLOAT,
      position FLOAT
    )
  LOOP
    INSERT INTO seo_performance (
      fecha,
      organic_traffic,
      impressions,
      clicks,
      ctr,
      avg_position
    )
    VALUES (
      CURRENT_DATE,
      v_data.clicks,
      v_data.impressions,
      v_data.clicks,
      v_data.ctr,
      v_data.position
    )
    ON CONFLICT (fecha) DO UPDATE
    SET 
      organic_traffic = seo_performance.organic_traffic + v_data.clicks,
      impressions = seo_performance.impressions + v_data.impressions,
      clicks = seo_performance.clicks + v_data.clicks;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

**Checklist Semana 5:**

```
☐ 10+ keywords target insertadas
☐ Función track_keyword_rankings()
☐ Función fetch_google_search_console_data()
☐ Google Search Console verificado
☐ API OAuth2 configurada (GSC)
☐ CRON keyword tracking (06:00)
☐ CRON GSC fetch (04:00)
☐ Alertas SEO funcionando (Slack)
☐ Dashboard SEO básico
```

---

## 4. FASE 3: FRONTEND PUBLIC & UX (SEMANAS 6-8)

### 4.1 Semana 6: Setup Frontend + Landing Page

**Objetivo:** Frontend público funcional

```bash
# Setup proyecto Next.js 14
npx create-next-app@latest verificacodigos-public --typescript --tailwind --app
cd verificacodigos-public

# Instalar dependencias
npm install axios swr
npm install @headlessui/react @heroicons/react
npm install react-hook-form zod
```

**Estructura:**

```
verificacodigos-public/
├─ app/
│  ├─ (public)/
│  │  ├─ page.tsx (Landing)
│  │  ├─ codigos/
│  │  │  ├─ page.tsx (Lista)
│  │  │  └─ [slug]/page.tsx (Detalle)
│  │  ├─ categorias/
│  │  │  └─ [slug]/page.tsx
│  │  └─ buscar/page.tsx
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  └─ register/page.tsx
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
│  ├─ CodigoCard.tsx
│  ├─ SearchBar.tsx
│  └─ CategoryFilter.tsx
├─ lib/
│  └─ api.ts
└─ public/
   └─ sitemap.xml
```

**Landing Page SEO-Optimized:**

```typescript
// app/(public)/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VerificaCódigos - Códigos Promocionales Verificados 2026',
  description: 'Encuentra códigos promocionales verificados para Netflix, Amazon, streaming y más. Comunidad activa, descuentos reales.',
  keywords: 'códigos descuento, códigos promocionales, netflix, amazon, streaming, 2026',
  openGraph: {
    title: 'VerificaCódigos - Descuentos Verificados',
    description: 'Códigos promocionales 100% verificados por la comunidad',
    url: 'https://verificacodigos.com',
    siteName: 'VerificaCódigos',
    images: [
      {
        url: 'https://verificacodigos.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  alternates: {
    canonical: 'https://verificacodigos.com',
  },
};

export default async function Home() {
  // Fetch códigos destacados
  const codigos = await fetch('https://api.verificacodigos.com/codigos/destacados').then(r => r.json());

  return (
    <main>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500 to-teal-700 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            Códigos Promocionales Verificados
          </h1>
          <p className="text-xl mb-8">
            Descuentos reales, verificados por la comunidad. Netflix, Amazon, Streaming y más.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Featured Codes */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Códigos Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {codigos.map(codigo => (
              <CodigoCard key={codigo.id} codigo={codigo} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Categorías Populares</h2>
          <CategoryFilter />
        </div>
      </section>

      {/* Schema.org LD+JSON */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'VerificaCódigos',
            url: 'https://verificacodigos.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://verificacodigos.com/buscar?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </main>
  );
}
```

**Checklist Semana 6:**

```
☐ Proyecto Next.js 14 creado
☐ Landing page diseñada
☐ Metadata SEO configurada
☐ Schema.org LD+JSON incluido
☐ SearchBar component
☐ CodigoCard component
☐ Responsive design
☐ API integration básica
```

---

### 4.2 Semana 7: Páginas de Códigos + Categorías

**Página de Detalle de Código (SEO-Critical):**

```typescript
// app/(public)/codigos/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const codigo = await fetch(`https://api.verificacodigos.com/codigos/${params.slug}`).then(r => r.json());
  const metadata = codigo.seo_metadata;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    openGraph: {
      title: metadata.og_title,
      description: metadata.og_description,
      images: [metadata.og_image],
    },
    alternates: {
      canonical: metadata.canonical_url,
    },
  };
}

export default async function CodigoPage({ params }: { params: { slug: string } }) {
  const codigo = await fetch(`https://api.verificacodigos.com/codigos/${params.slug}`).then(r => r.json());

  return (
    <article>
      <header>
        <h1 className="text-4xl font-bold mb-4">{codigo.titulo}</h1>
        <div className="flex items-center gap-4 mb-6">
          <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded">
            {codigo.categoria}
          </span>
          <span className="text-gray-600">
            ⭐ {codigo.rating_promedio}/5 ({codigo.total_reviews} verificaciones)
          </span>
        </div>
      </header>

      <section className="mb-8">
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Código promocional:</p>
          <code className="text-2xl font-mono font-bold">{codigo.codigo_promocional}</code>
          <button className="mt-4 px-6 py-3 bg-teal-600 text-white rounded hover:bg-teal-700">
            Copiar Código
          </button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Descripción</h2>
        <p className="text-gray-700">{codigo.descripcion}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">¿Funciona este código?</h2>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700">
            ✅ Sí funciona ({codigo.positivas})
          </button>
          <button className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700">
            ❌ No funciona ({codigo.negativas})
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Comentarios</h2>
        <ComentariosSection codigoId={codigo.id} />
      </section>

      {/* Schema.org LD+JSON */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(codigo.seo_metadata.schema_json),
        }}
      />
    </article>
  );
}
```

**Checklist Semana 7:**

```
☐ Página detalle código
☐ Dynamic metadata (generateMetadata)
☐ Schema.org por código
☐ Botón copiar código
☐ Sistema verificación (UI)
☐ Comentarios section
☐ Página categorías
☐ Breadcrumbs SEO
☐ Canonical URLs correctas
```

---

### 4.3 Semana 8: Features Interactivas + Auth

**Sistema de Autenticación Usuario:**

```typescript
// app/(auth)/register/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta - VerificaCódigos',
  robots: { index: false, follow: true }, // No indexar páginas de auth
};

export default function Register() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Crear Cuenta</h1>
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button className="w-full px-4 py-3 bg-teal-600 text-white rounded hover:bg-teal-700">
            Crear Cuenta
          </button>
        </form>
      </div>
    </main>
  );
}
```

**Checklist Semana 8:**

```
☐ Página registro usuario
☐ Página login usuario
☐ JWT authentication
☐ Protected routes
☐ User profile page
☐ Crear código (form)
☐ Verificar código (interactivo)
☐ Comentar en código
☐ Sistema de puntos visible
```

---

## 5. FASE 4: SEO ADVANCED & PERFORMANCE (SEMANAS 9-10)

### 5.1 Semana 9: Performance Optimization

**Objetivo:** Lighthouse Score 90+

#### Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['verificacodigos.com'],
    formats: ['image/avif', 'image/webp'],
  },
};

// Uso
import Image from 'next/image';

<Image
  src="/og-image.jpg"
  alt="VerificaCódigos"
  width={1200}
  height={630}
  priority
/>
```

#### Static Generation + ISR

```typescript
// app/(public)/codigos/[slug]/page.tsx
export const revalidate = 3600; // ISR: revalidar cada hora

export async function generateStaticParams() {
  const codigos = await fetch('https://api.verificacodigos.com/codigos/top-100').then(r => r.json());

  return codigos.map((codigo: any) => ({
    slug: codigo.slug,
  }));
}
```

#### Bundle Optimization

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```

```bash
npm install @next/bundle-analyzer
```

**Checklist Semana 9:**

```
☐ Image optimization (AVIF/WebP)
☐ ISR configurado (revalidate)
☐ generateStaticParams para top códigos
☐ Bundle analysis (< 200KB gzipped)
☐ Lazy loading components
☐ Code splitting
☐ Prefetch links críticos
☐ Lighthouse Score 90+ (desktop)
☐ Lighthouse Score 85+ (mobile)
```

---

### 5.2 Semana 10: SEO Advanced + Link Building

**Internal Linking Strategy:**

```sql
-- Función: Generar internal links automáticos
CREATE OR REPLACE FUNCTION generar_internal_links()
RETURNS VOID AS $$
DECLARE
  v_codigo RECORD;
BEGIN
  FOR v_codigo IN SELECT * FROM codigos WHERE estado = 'activo' LOOP
    -- Links a códigos de misma categoría
    INSERT INTO seo_links (tipo, origen_url, destino_url, anchor_text, follow)
    SELECT 
      'internal',
      'https://verificacodigos.com/' || sm1.slug,
      'https://verificacodigos.com/' || sm2.slug,
      c2.titulo,
      true
    FROM codigos c2
    INNER JOIN seo_metadata sm1 ON v_codigo.id = sm1.entidad_id AND sm1.entidad_tipo = 'codigo'
    INNER JOIN seo_metadata sm2 ON c2.id = sm2.entidad_id AND sm2.entidad_tipo = 'codigo'
    WHERE c2.categoria_id = v_codigo.categoria_id
    AND c2.id != v_codigo.id
    AND c2.estado = 'activo'
    LIMIT 5
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

**External Backlinks Tracking:**

```sql
-- Registrar backlinks externos
INSERT INTO seo_links (tipo, origen_url, destino_url, domain_authority, follow)
VALUES
  ('backlink', 'https://example-blog.com/post-123', 'https://verificacodigos.com', 45, true),
  ('backlink', 'https://forum.reddit.com/r/deals', 'https://verificacodigos.com/codigos/netflix-30', 92, true);
```

**Checklist Semana 10:**

```
☐ Internal linking automático
☐ Breadcrumbs en todas las páginas
☐ Sitemap index (múltiples sitemaps)
☐ Robots.txt configurado
☐ Canonical URLs verificadas
☐ Backlinks tracking
☐ External link building (10+ backlinks)
☐ Social signals (Twitter, Reddit)
☐ Google My Business (si aplica)
```

---

## 6. FASE 5: SECURITY HARDENING (SEMANA 11)

### 6.1 Auditoría de Seguridad Completa

**Checklist de Seguridad (100 puntos):**

```
DATABASE (20 puntos):
  ☐ RLS policies activas
  ☐ Prepared statements 100%
  ☐ Triggers de validación funcionando
  ☐ No SQL injection posible
  ☐ Backup diario automático

BACKEND API (25 puntos):
  ☐ JWT tokens con expiración
  ☐ Rate limiting (express-rate-limit)
  ☐ Helmet headers configurados
  ☐ CORS restrictivo
  ☐ Input validation (Zod)
  ☐ Error handling sin info sensible
  ☐ HTTPS enforced
  ☐ Environment variables seguras

FRONTEND (15 puntos):
  ☐ XSS prevention (sanitización)
  ☐ CSRF tokens (si forms)
  ☐ Content Security Policy
  ☐ Subresource Integrity (SRI)
  ☐ httpOnly cookies

MONITORING (20 puntos):
  ☐ Sentry error tracking
  ☐ Log rotation configurado
  ☐ CRON failures alerting
  ☐ Performance monitoring
  ☐ Uptime monitoring (99.9%)

COMPLIANCE (20 puntos):
  ☐ GDPR purge funcionando
  ☐ Privacy policy publicada
  ☐ Terms of service publicados
  ☐ Cookie consent banner
  ☐ Data export API
```

### 6.2 Penetration Testing

```bash
# npm audit
npm audit --production

# Snyk scan
npx snyk test

# OWASP ZAP
# Manual testing con ZAP Proxy
```

### 6.3 Security Headers

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  }
};
```

**Checklist Semana 11:**

```
☐ Auditoría seguridad 95%+
☐ npm audit: 0 vulnerabilidades high/critical
☐ Snyk: 0 vulnerabilidades high/critical
☐ Penetration testing completado
☐ Security headers configurados
☐ Rate limiting probado
☐ GDPR purge testeado
☐ Incident response plan documentado
```

---

## 7. FASE 6: LAUNCH & MONITORING (SEMANA 12)

### 7.1 Pre-Launch Checklist

```
INFRAESTRUCTURA:
  ☐ BD en producción (Supabase)
  ☐ Backend desplegado (Railway/Render)
  ☐ Frontend desplegado (Vercel)
  ☐ DNS configurado
  ☐ SSL/TLS activo
  ☐ CDN configurado (Cloudflare)

SEO:
  ☐ Sitemap.xml generado
  ☐ Robots.txt correcto
  ☐ Google Search Console verificado
  ☐ Google Analytics configurado
  ☐ Schema.org markup verificado
  ☐ Canonical URLs verificadas
  ☐ 404 page personalizada
  ☐ 500 page personalizada

MONITORING:
  ☐ Sentry configurado
  ☐ Uptime Robot configurado
  ☐ Slack webhooks activos
  ☐ Email alerts configurados
  ☐ Performance baseline capturado

LEGAL:
  ☐ Privacy policy publicada
  ☐ Terms of service publicados
  ☐ Cookie consent banner
  ☐ GDPR compliance verificado
  ☐ Contact page funcionando

TESTING:
  ☐ Unit tests 80%+ coverage
  ☐ Integration tests pasando
  ☐ E2E tests críticos pasando
  ☐ Load testing (1000 concurrent users)
  ☐ Security scan limpio
```

### 7.2 Launch Day

```
09:00 - Final smoke tests
10:00 - Deploy producción
10:30 - Verificar funcionalidad core
11:00 - Submit sitemap a GSC
11:30 - Anuncio en redes sociales
12:00 - Monitor activo (4 horas)
16:00 - Review logs y errores
17:00 - Post-mortem meeting
```

### 7.3 Post-Launch Monitoring (30 días)

```
DIARIO:
  ☐ Verificar errores (Sentry)
  ☐ Revisar performance (Core Web Vitals)
  ☐ Monitorear SEO rankings
  ☐ Revisar organic traffic

SEMANAL:
  ☐ Analizar bounce rate
  ☐ Revisar conversión verificaciones
  ☐ Security scan (npm audit)
  ☐ Backup verification

MENSUAL:
  ☐ SEO performance report
  ☐ User feedback análisis
  ☐ Performance optimization
  ☐ Security audit
```

**Checklist Semana 12:**

```
☐ Pre-launch checklist 100%
☐ Launch exitoso sin downtime
☐ Monitoring activo 24/7
☐ 0 errores críticos
☐ Performance estable
☐ SEO indexación iniciada
☐ First 100 users registered
☐ Post-mortem documentado
```

---

## 8. VIGILANCIA CONTINUA DE SEGURIDAD

### 8.1 Dónde Vigilar (Checklist Mensual)

```
BASE DE DATOS:
  ☐ Logs de queries lentas (pg_stat_statements)
  ☐ Conexiones abiertas (pg_stat_activity)
  ☐ Tamaño de tablas (pg_total_relation_size)
  ☐ Deadlocks (pg_stat_database)
  ☐ Index usage (pg_stat_user_indexes)

BACKEND:
  ☐ Error rate (> 1% es crítico)
  ☐ Response time (> 500ms es warning)
  ☐ Memory usage (> 80% es crítico)
  ☐ CPU usage (> 70% es warning)
  ☐ Disk space (> 85% es crítico)

FRONTEND:
  ☐ Core Web Vitals (LCP, FID, CLS)
  ☐ Lighthouse scores (< 90 es warning)
  ☐ Bundle size (> 300KB es crítico)
  ☐ JavaScript errors (Sentry)
  ☐ API call latency

SEGURIDAD:
  ☐ Failed login attempts (> 100/día es sospechoso)
  ☐ Rate limiting hits (> 50/día/IP es sospechoso)
  ☐ Anomalous user behavior (AI detection)
  ☐ SQL injection attempts (logs)
  ☐ XSS attempts (logs)
```

### 8.2 Automatización de Vigilancia

```sql
-- View: Dashboard de Salud del Sistema
CREATE OR REPLACE VIEW sistema_salud AS
SELECT
  (SELECT COUNT(*) FROM codigos WHERE estado = 'activo') as codigos_activos,
  (SELECT COUNT(*) FROM usuarios WHERE activo = true) as usuarios_activos,
  (SELECT COUNT(*) FROM verificaciones WHERE DATE(creado_en) = CURRENT_DATE) as verificaciones_hoy,
  (SELECT COUNT(*) FROM reportes WHERE estado = 'pendiente') as reportes_pendientes,
  (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as queries_activas,
  (SELECT pg_database_size('cienrazones') / (1024*1024*1024)) as db_size_gb,
  (SELECT COUNT(*) FROM cron_executions WHERE status = 'failed' AND executed_at > NOW() - INTERVAL '24 hours') as cron_failures_24h;

-- Query diaria: Verificar salud
SELECT * FROM sistema_salud;
```

### 8.3 Alertas Automáticas

```sql
-- CRON Job: Health Check y Alertas
SELECT cron.schedule(
  'health-check-alertas',
  '*/15 * * * *',  -- Cada 15 minutos
  $$
  DO $$
  DECLARE
    v_salud RECORD;
    v_alerta TEXT;
  BEGIN
    SELECT * INTO v_salud FROM sistema_salud;
    
    -- Alerta: Reportes pendientes > 50
    IF v_salud.reportes_pendientes > 50 THEN
      v_alerta := '⚠️ Reportes pendientes: ' || v_salud.reportes_pendientes;
      PERFORM http_post('https://hooks.slack.com/services/YOUR_WEBHOOK', '{"text": "' || v_alerta || '"}', 'application/json');
    END IF;
    
    -- Alerta: CRON failures
    IF v_salud.cron_failures_24h > 0 THEN
      v_alerta := '🔴 CRON failures: ' || v_salud.cron_failures_24h || ' jobs failed';
      PERFORM http_post('https://hooks.slack.com/services/YOUR_WEBHOOK', '{"text": "' || v_alerta || '"}', 'application/json');
    END IF;
    
    -- Alerta: DB size > 10GB
    IF v_salud.db_size_gb > 10 THEN
      v_alerta := '💾 Database size: ' || ROUND(v_salud.db_size_gb, 2) || ' GB (considerar limpieza)';
      PERFORM http_post('https://hooks.slack.com/services/YOUR_WEBHOOK', '{"text": "' || v_alerta || '"}', 'application/json');
    END IF;
  END $$;
  $$
);
```

---

## 9. DÓNDE BUSCAR FIXES Y VULNERABILIDADES

### 9.1 Fuentes Oficiales (Revisar Semanalmente)

```
POSTGRESQL:
  📍 https://www.postgresql.org/support/security/
  📍 https://www.postgresql.org/support/versioning/
  └─ Buscar: CVE PostgreSQL
  └─ Alertas: Configurar RSS feed

NODE.JS:
  📍 https://nodejs.org/en/blog/vulnerability/
  📍 https://github.com/nodejs/node/security/advisories
  └─ Buscar: CVE Node.js
  └─ Alertas: GitHub Security Advisories

NPM PACKAGES:
  📍 https://github.com/advisories
  📍 https://snyk.io/vuln/
  └─ Comando: npm audit
  └─ Comando: npx snyk test

EXPRESS.JS:
  📍 https://expressjs.com/en/advanced/security-updates.html
  📍 https://github.com/expressjs/express/security/advisories
  └─ Buscar: CVE Express

REACT / NEXT.JS:
  📍 https://github.com/facebook/react/security/advisories
  📍 https://github.com/vercel/next.js/security/advisories
  └─ Buscar: CVE React, CVE Next.js
```

### 9.2 Herramientas de Escaneo (Automatizar)

```bash
# 1. npm audit (built-in)
npm audit
npm audit fix

# 2. Snyk (recomendado)
npm install -g snyk
snyk auth
snyk test
snyk monitor  # Monitoreo continuo

# 3. OWASP Dependency-Check
# Descargar de https://owasp.org/www-project-dependency-check/
dependency-check --project VerificaCódigos --scan .

# 4. Retire.js (JavaScript vulnerabilities)
npm install -g retire
retire --path .

# 5. Safety (Python, si usas scripts)
pip install safety
safety check

# 6. Trivy (Docker images)
trivy image verificacodigos:latest
```

### 9.3 Comunidades y Alertas

```
SUSCRIBIRSE A:
  📧 PostgreSQL Announce Mailing List
  📧 Node.js Security Releases
  📧 npm Security Advisories
  📧 GitHub Dependabot Alerts (automático)
  📧 Snyk Vulnerability Alerts

SEGUIR:
  🐦 @nodejs on Twitter
  🐦 @PostgreSQL on Twitter
  🐦 @github on Twitter
  🐦 @snyk on Twitter

REVISAR:
  📰 https://www.cvedetails.com/
  📰 https://nvd.nist.gov/
  📰 https://www.exploit-db.com/
  📰 https://snyk.io/blog/
```

### 9.4 Procedimiento de Respuesta a CVE

```
1. DETECCIÓN (Automatizada)
   ├─ GitHub Dependabot crea PR
   ├─ Snyk envía email alert
   ├─ npm audit detecta vulnerability
   └─ Equipo notificado vía Slack

2. EVALUACIÓN (Inmediato)
   ├─ Leer CVE description
   ├─ Calcular CVSS score
   ├─ Verificar si afecta aplicación
   ├─ Identificar versión vulnerable
   └─ Buscar patch disponible

3. PRIORIZACIÓN
   ├─ CRÍTICO (9.0-10.0): < 4 horas
   ├─ ALTO (7.0-8.9): < 24 horas
   ├─ MEDIO (4.0-6.9): < 1 semana
   └─ BAJO (0-3.9): < 1 mes

4. REMEDIACIÓN
   ├─ Crear rama: hotfix/cve-XXXX-XXXX
   ├─ Actualizar package.json
   ├─ npm install
   ├─ Ejecutar tests
   ├─ Code review
   ├─ Merge + Deploy prioritario
   └─ Verificar npm audit limpio

5. DOCUMENTACIÓN
   ├─ Crear issue en GitHub
   ├─ Documentar CVE + fix en SECURITY.md
   ├─ Changelog entry
   ├─ Team notification
   └─ Post-mortem (si crítico)

6. MONITORING
   ├─ Verificar logs 24h post-fix
   ├─ Monitorear performance
   ├─ User feedback
   └─ Re-scan con Snyk
```

---

## 10. COMPLIANCE Y ASPECTOS LEGALES

### 10.1 GDPR Compliance (EU)

```
REQUISITOS IMPLEMENTADOS:

✅ Derecho al Olvido (Art. 17)
   └─ Función: purga_gdpr_usuario()
   └─ UI: Botón "Eliminar mi cuenta"
   └─ Timeline: 30 días recuperable

✅ Portabilidad de Datos (Art. 20)
   └─ API: GET /api/usuarios/:id/export
   └─ Formato: JSON
   └─ Incluye: Verificaciones, comentarios, códigos

✅ Consentimiento (Art. 7)
   └─ Cookie consent banner
   └─ Checkbox explícito en registro
   └─ Log de consentimiento en BD

✅ Acceso a Datos (Art. 15)
   └─ API: GET /api/usuarios/:id/datos
   └─ Dashboard usuario: Ver todos mis datos

✅ Notificación de Brechas (Art. 33)
   └─ Procedimiento documentado
   └─ Timeline: 72 horas
   └─ Template email preparado

PENDIENTES (NO MVP):
  ⚠️ DPO (Data Protection Officer) - Requerido si > 10k usuarios
  ⚠️ Privacy Impact Assessment
  ⚠️ Data Processing Agreement con Supabase
```

### 10.2 Documentos Legales (Obligatorios)

```
PRIVACY POLICY:
  📄 Qué datos recopilamos
  📄 Cómo usamos los datos
  📄 Con quién compartimos datos
  📄 Derechos del usuario (GDPR)
  📄 Cookies y tracking
  📄 Contacto DPO (si aplica)
  
  URL: https://verificacodigos.com/privacy

TERMS OF SERVICE:
  📄 Uso aceptable
  📄 Prohibiciones (spam, fraude)
  📄 Sistema de puntos (reglas)
  📄 Moderación (reportes)
  📄 Terminación de cuenta
  📄 Limitación de responsabilidad
  📄 Ley aplicable (país)
  
  URL: https://verificacodigos.com/terms

COOKIE POLICY:
  📄 Tipos de cookies usadas
  📄 Cookies esenciales vs opcionales
  📄 Cookies de terceros (Analytics)
  📄 Cómo rechazar cookies
  
  URL: https://verificacodigos.com/cookies
```

### 10.3 Compliance con Leyes Locales

```
ESPAÑA (LSSI-CE + LOPD):
  ✅ Aviso legal en footer
  ✅ Datos de contacto visibles
  ✅ NIF/CIF si es empresa
  ✅ Registro Mercantil (si aplica)
  ✅ AEPD notification (si > 10k usuarios)

LATINOAMÉRICA:
  ⚠️ Verificar leyes locales por país
  ⚠️ Argentina: Ley 25.326
  ⚠️ México: LFPDPPP
  ⚠️ Brasil: LGPD (similar a GDPR)
  ⚠️ Chile: Ley 19.628
```

### 10.4 Riesgos Legales a Evitar

```
🚫 SPAM:
   └─ Nunca enviar emails sin consentimiento
   └─ Botón "unsubscribe" obligatorio
   └─ Log de opt-in/opt-out

🚫 COPYRIGHT:
   └─ No usar imágenes sin licencia
   └─ No copiar contenido de otras webs
   └─ Dar crédito a fuentes

🚫 PHISHING:
   └─ Validar URLs en whitelist (trigger)
   └─ No permitir links maliciosos
   └─ Reportar códigos fraudulentos

🚫 FRAUDE:
   └─ Detectar bots (anomalias_usuario)
   └─ Rate limiting estricto
   └─ Bloquear usuarios sospechosos

🚫 CONTENIDO ILEGAL:
   └─ Moderación activa
   └─ Sistema de reportes
   └─ Eliminación rápida (< 24h)
```

### 10.5 Checklist Legal Final

```
☐ Privacy Policy publicada
☐ Terms of Service publicados
☐ Cookie Policy publicada
☐ Cookie consent banner funcionando
☐ GDPR purge implementado
☐ Data export API funcionando
☐ Aviso legal en footer
☐ Contacto visible
☐ NIF/CIF visible (si empresa)
☐ Procedimiento de brechas documentado
☐ Email de contacto DPO (si aplica)
☐ Template de respuesta a solicitudes GDPR
```

---

## 📊 RESUMEN EJECUTIVO

```
╔═══════════════════════════════════════════════════════════╗
║         ROADMAP GLOBAL - 12 SEMANAS                       ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  FASE 1: Database & Backend Core (S1-S3)                 ║
║    ✅ 22 tablas core + SEO                                ║
║    ✅ 8 funciones + 8 triggers                            ║
║    ✅ RLS policies + 13 CRON jobs                         ║
║    ✅ 24 vulnerabilidades mitigadas                       ║
║                                                           ║
║  FASE 2: SEO Foundation (S4-S5)                          ║
║    ✅ 5 tablas SEO                                        ║
║    ✅ Metadata automática                                 ║
║    ✅ Sitemap generator                                   ║
║    ✅ GSC integration                                     ║
║    ✅ 10+ keywords tracking                               ║
║                                                           ║
║  FASE 3: Frontend Public (S6-S8)                         ║
║    ✅ Landing page SEO-optimized                          ║
║    ✅ Páginas de códigos + categorías                     ║
║    ✅ Sistema auth usuarios                               ║
║    ✅ Features interactivas                               ║
║                                                           ║
║  FASE 4: SEO Advanced & Performance (S9-S10)             ║
║    ✅ Lighthouse Score 90+                                ║
║    ✅ ISR + Static Generation                             ║
║    ✅ Internal linking                                    ║
║    ✅ External backlinks                                  ║
║                                                           ║
║  FASE 5: Security Hardening (S11)                        ║
║    ✅ Security Score 95%+                                 ║
║    ✅ Penetration testing                                 ║
║    ✅ Compliance GDPR                                     ║
║                                                           ║
║  FASE 6: Launch & Monitoring (S12)                       ║
║    ✅ Deploy producción                                   ║
║    ✅ Monitoring 24/7                                     ║
║    ✅ Post-launch optimization                            ║
║                                                           ║
║  VIGILANCIA CONTINUA:                                    ║
║    📍 npm audit (semanal)                                ║
║    📍 Snyk monitoring (continuo)                         ║
║    📍 PostgreSQL CVE (semanal)                           ║
║    📍 Node.js CVE (semanal)                              ║
║    📍 Health checks (cada 15 min)                        ║
║    📍 Security audits (mensual)                          ║
║                                                           ║
║  FUENTES DE FIXES:                                       ║
║    📰 PostgreSQL.org/security                            ║
║    📰 Nodejs.org/vulnerability                           ║
║    📰 GitHub Security Advisories                         ║
║    📰 Snyk.io/vuln                                       ║
║    📰 CVEdetails.com                                     ║
║                                                           ║
║  COMPLIANCE:                                             ║
║    ✅ GDPR compliant                                     ║
║    ✅ Privacy Policy                                     ║
║    ✅ Terms of Service                                   ║
║    ✅ Cookie Policy                                      ║
║    ✅ LSSI-CE (España)                                   ║
║                                                           ║
║  RESULTADO ESPERADO:                                     ║
║    🎯 Security Score: 95%+                               ║
║    🎯 SEO Ranking: Top 3 (keywords target)               ║
║    🎯 Performance: 90+ (Lighthouse)                      ║
║    🎯 Uptime: 99.9%                                      ║
║    🎯 Users: 10k+ (primer mes)                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🔗 ARCHIVOS RELACIONADOS

```
📄 INTERNAL_CONCEPTUAL_DOCS.md
   └─ Arquitectura del sistema

📄 INTERNAL_DATABASE_DOCS.md
   └─ Instalación base de datos

📄 INTERNAL_MANTENIMIENTO.md
   └─ Guía de actualizaciones

📄 INTERNAL_ADMIN_MVP.md
   └─ MVP Admin (4 semanas)

📄 SCHEMA_PRODUCCION_FINAL_2026.sql
   └─ SQL completo (882 líneas)

📄 VULNERABILIDADES_CRITICAS_2026.md
   └─ Análisis de seguridad (922 líneas)

📄 VERIFICACION_TODOS_LOS_FIXES.md
   └─ Checklist implementación (544 líneas)
```

---

**Documentación Roadmap Global - Completada al 100%**  
**Versión:** 1.0 Final  
**Status:** 🟢 Production Ready  
**Duración:** 12 semanas (post-MVP Admin)  
**Objetivo:** Aplicación completa, segura, optimizada SEO y escalable