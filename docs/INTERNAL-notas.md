# 📝 DIARIO DE DESARROLLO - VerificaCodigos.com

> **Uso:** Diario personal de progreso. NO TRACK en Git.

---

## 📅 HOY (Sábado 31 Enero 2026)

**✅ COMPLETADO**

- [x] Limpiar documentación duplicada
- [x] Crear .gitignore mejorado
- [x] Definir estructura archivos INTERNAL
- [x] README.md minimalista

**🎯 PENDIENTE HOY**

- [ ] Descargar archivos finales
- [ ] Organizar carpeta docs/
- [ ] Git commit + push

**❌ BLOQUEOS**

- Ninguno

---

## 📊 ESTA SEMANA (31 ENE - 06 FEB)

**🎯 Meta:** MVP básico funcionando localmente

| Día        | Tareas               | Estado       |
| ---------- | -------------------- | ------------ |
| **VIE 31** | Docs + .gitignore    | ✅ Hecho     |
| **SAB 01** | Schema DB + Seeds    | ⏳ Pendiente |
| **DOM 02** | Homepage HTML + CSS  | ⏳ Pendiente |
| **LUN 03** | Sistema login básico | ⏳ Pendiente |
| **MAR 04** | Subir/listar códigos | ⏳ Pendiente |
| **MIE 05** | Votos up/down        | ⏳ Pendiente |
| **JUE 06** | Tests + fixes        | ⏳ Pendiente |

**Progreso:** 1/7 días completados

---

## 🔍 STATUS ACTUAL

| Componente | Estado       | Notas                 |
| ---------- | ------------ | --------------------- |
| Docs       | ✅ OK        | Organizados y limpios |
| .gitignore | ✅ OK        | Protege secrets       |
| Database   | 🛑 No existe | Crear mañana          |
| Frontend   | 🛑 No existe | Semana próxima        |
| Deploy     | 🛑 No existe | Después de MVP        |

---

## 📈 MÉTRICAS SEMANALES

| Día   | Tareas completadas | Horas |
| ----- | ------------------ | ----- |
| 31/01 | 4                  | 2h    |
| 01/02 | -                  | -     |
| 02/02 | -                  | -     |

**Total semana:** 4 tareas, 2h

---

## 💡 IDEAS RÁPIDAS

(Mover a INTERNAL-estrategia.md cuando sea relevante)

- Sistema badges automático
- Notificaciones email cuando código verificado
- PWA con service worker
- Admin panel básico
- Dark mode

---

## 🐛 BUGS CONOCIDOS

(Ninguno todavía - proyecto empieza)

---

## 📝 NOTAS Y APRENDIZAJES

**31 Enero:**

- Aprendí que menos archivos = menos confusión
- INTERNAL-estrategia.md es mi "biblia técnica"
- Este archivo es mi día a día

---

## ⚡ COMANDOS ÚTILES

```bash
# Local dev
netlify dev

# Supabase
supabase db push
supabase db seed

# Deploy
netlify deploy --prod

# Git
git add .
git commit -m "feat: mensaje"
git push
```

---

## 🎯 PRÓXIMOS 3 PASOS

1. ✅ **HOY:** Finalizar documentación
2. ⏳ **MAÑANA:** Crear schema.sql + ejecutar en Supabase
3. ⏳ **DOMINGO:** Primera página HTML (homepage)

---

DEPLOYYYYY
Deploy es publicar/subir tu web a internet para que cualquiera la pueda acceder.

# 🚀 DEPLOY.md - VerificaCodigos.com

> **Guía completa de despliegue para Netlify + Supabase**  
> Stack: Frontend SPA (Vanilla JS) + Backend Serverless + PostgreSQL  
> Última actualización: 31 Enero 2026

---

## 📋 PRE-REQUISITOS

Antes de empezar, asegúrate de tener:

- [ ] **Cuenta Netlify** (gratis en [netlify.com](https://netlify.com))
- [ ] **Cuenta Supabase** (gratis en [supabase.com](https://supabase.com))
- [ ] **Git instalado** localmente
- [ ] **Node.js 18+** y npm/yarn
- [ ] Repositorio GitHub del proyecto

---

## 🗄️ PASO 1: CONFIGURAR SUPABASE (BASE DE DATOS)

### 1.1 Crear Proyecto Supabase

```bash
# 1. Ve a https://supabase.com/dashboard
# 2. Click "New Project"
# 3. Completa:
#    - Name: verificacodigos
#    - Database Password: [GUARDA ESTO - la necesitarás]
#    - Region: Europe West (Frankfurt) - más cerca de Murcia
# 4. Espera 2-3 minutos a que se cree
```

### 1.2 Ejecutar Schema SQL

```sql
-- Ve a SQL Editor en Supabase Dashboard
-- Copia y pega el contenido de docs/DATABASE.md (sección SCHEMA COMPLETO)
-- Click "Run" para crear todas las tablas
```

**Archivo:** `database/schema.sql` (completo en docs/)

### 1.3 Seeds de Datos Iniciales

```sql
-- Ejecuta en orden desde SQL Editor:
-- 1. database/seeds/categories.sql (6 categorías)
-- 2. database/seeds/badges.sql (sistema gamificación)
-- 3. database/seeds/demo_codes.sql (códigos demo - opcional)
```

### 1.4 Configurar RLS (Row Level Security)

```sql
-- Ya incluido en schema.sql, pero verifica:
-- Settings > Authentication > Row Level Security = Enabled
-- Aplica políticas desde docs/DATABASE.md (sección RLS)
```

### 1.5 Obtener Credenciales

```bash
# Ve a Settings > API en Supabase Dashboard
# Copia estos valores (los necesitarás en Netlify):

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...tu-key-larga
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...tu-service-key (⚠️ SOLO backend)
```

---

## 🌐 PASO 2: CONFIGURAR NETLIFY (FRONTEND + FUNCTIONS)

### 2.1 Conectar Repositorio

```bash
# Opción A: Deploy desde GitHub (recomendado)
# 1. Ve a https://app.netlify.com
# 2. Click "Add new site" > "Import an existing project"
# 3. Autoriza GitHub y selecciona tu repo verificacodigos

# Opción B: Deploy manual desde CLI
npm install -g netlify-cli
netlify login
netlify init
```

### 2.2 Configuración Build

```toml
# netlify.toml (ya debería estar en tu raíz)
[build]
  publish = "public/"
  functions = "netlify/functions"
  command = "echo 'No build needed - vanilla JS'"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2.3 Variables de Entorno en Netlify

```bash
# Ve a Site settings > Environment variables
# Añade estas variables (usa valores de Supabase Paso 1.5):

SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # ⚠️ Solo para functions backend
```

**⚠️ IMPORTANTE:** Nunca expongas `SERVICE_ROLE_KEY` en frontend.

### 2.4 Deploy Inicial

```bash
# Si usas CLI:
netlify deploy --prod

# Si usas GitHub:
# - Haz push a main/master
# - Netlify autodespliega automáticamente
git add .
git commit -m "Initial deploy"
git push origin main
```

---

## 🔧 PASO 3: VERIFICAR DEPLOYMENT

### 3.1 Checklist Post-Deploy

- [ ] **Frontend carga:** Abre tu-sitio.netlify.app
- [ ] **Conexión Supabase OK:** Abre DevTools Console, verifica sin errores CORS
- [ ] **Functions responden:** Prueba `/api/health` (si tienes endpoint)
- [ ] **RLS activo:** Intenta votar sin login (debe fallar con 403)
- [ ] **Categorías visibles:** Homepage muestra chips de categorías

### 3.2 Test de Funcionalidad

```bash
# Prueba estos flujos:
1. Registro usuario nuevo
2. Login existente
3. Añadir código nuevo
4. Votar código (upvote/downvote)
5. Ver perfil con puntos Carga
```

### 3.3 Comandos Debug

```bash
# Ver logs Netlify Functions
netlify functions:log

# Ver logs deploy
netlify open:admin

# Test local antes de deploy
netlify dev
# Abre http://localhost:8888
```

---

## 🔐 PASO 4: CONFIGURACIÓN DOMINIO (OPCIONAL)

### 4.1 Dominio Personalizado

```bash
# Si compraste verificacodigos.com:
# 1. Ve a Netlify > Domain settings
# 2. Click "Add custom domain"
# 3. Escribe: verificacodigos.com
# 4. Sigue instrucciones DNS de tu proveedor
```

**Registros DNS típicos:**

```
A Record:    @    →  75.2.60.5 (Netlify IP)
CNAME:       www  →  tu-sitio.netlify.app
```

### 4.2 SSL Automático

```bash
# Netlify activa HTTPS automáticamente tras configurar dominio
# Espera 24-48h para propagación DNS completa
```

---

## 🐛 TROUBLESHOOTING

### Problema: "CORS error" en Console

**Causa:** Frontend intenta conectar a Supabase sin credenciales correctas.

**Solución:**

```javascript
// Verifica en src/config/supabase.js:
const SUPABASE_URL = "https://TU-PROYECTO.supabase.co"; // ✅ Correcto
const SUPABASE_URL = "localhost:54321"; // ❌ Incorrecto para producción
```

### Problema: Functions devuelven 404

**Causa:** Ruta incorrecta o función no desplegada.

**Solución:**

```bash
# Verifica estructura:
netlify/functions/
  ├── auth.js      # Debe estar aquí
  ├── codes.js
  └── votes.js

# Redeploy:
netlify deploy --prod --force
```

### Problema: RLS bloquea todo

**Causa:** Políticas RLS muy restrictivas o mal configuradas.

**Solución:**

```sql
-- Temporalmente desactiva RLS para debug (⚠️ solo en dev):
ALTER TABLE codes DISABLE ROW LEVEL SECURITY;

-- Verifica políticas:
SELECT * FROM pg_policies WHERE tablename = 'codes';
```

### Problema: Build falla en Netlify

**Causa:** Comando build incorrecto o dependencias faltantes.

**Solución:**

```toml
# netlify.toml - asegúrate de:
[build]
  command = "echo 'No build needed'" # ✅ Para Vanilla JS
  # command = "npm run build"        # ❌ Solo si usas bundler
```

---

## 📊 MONITOREO POST-DEPLOY

### Netlify Analytics (Gratis)

```bash
# Activa en: Site settings > Analytics
# Métricas:
- Visitas únicas
- Páginas vistas
- Top sources
- 404s
```

### Supabase Monitoring

```bash
# Dashboard > Database > Usage
# Revisa:
- Connection pooling
- Query performance
- Storage usage
```

### Logs en Tiempo Real

```bash
# Terminal local:
netlify dev --live

# Functions logs:
netlify functions:log --name=codes
```

---

## 🔄 WORKFLOW DE ACTUALIZACIONES

### Deploy Automático (GitHub + Netlify)

```bash
# 1. Haz cambios locales
# 2. Commit y push
git add .
git commit -m "feat: añadir filtro por categoría"
git push origin main

# 3. Netlify autodespliega en 1-2 minutos
# 4. Verifica en tu-sitio.netlify.app
```

### Rollback en Caso de Error

```bash
# Opción A: Desde Netlify Dashboard
# Deploys > Click deploy anterior > "Publish deploy"

# Opción B: Desde CLI
netlify rollback
```

---

## 📝 CHECKLIST FINAL PRODUCCIÓN

Antes de abrir al público:

- [ ] ✅ Todas las tablas creadas en Supabase
- [ ] ✅ Seeds de categorías y badges ejecutados
- [ ] ✅ RLS habilitado y testeado
- [ ] ✅ Variables entorno configuradas en Netlify
- [ ] ✅ Frontend carga sin errores console
- [ ] ✅ Registro y login funcionan
- [ ] ✅ CRUD códigos operativo
- [ ] ✅ Sistema votación responde
- [ ] ✅ Gamificación (Carga/niveles) actualiza
- [ ] ✅ Dominio personalizado (si aplica)
- [ ] ✅ SSL activo (HTTPS)
- [ ] ✅ SEO básico (meta tags en index.html)
- [ ] ✅ Analytics configurado
- [ ] ✅ Backup inicial DB hecho

---
