# 🔌 API REST - VerificaCodigos.com

> Documentación completa de endpoints  
> Base URL: `https://verificacodigos.com/.netlify/functions/`  
> Versión: 1.0.0 | Última actualización: 30 Enero 2026

---

## 📋 Tabla de contenidos

1. [Autenticación](#autenticación)
2. [Códigos](#códigos)
3. [Votos](#votos)
4. [Usuarios](#usuarios)
5. [Búsqueda](#búsqueda)
6. [Categorías](#categorías)
7. [Newsletter](#newsletter)
8. [Códigos de error](#códigos-de-error)
9. [Rate Limiting](#rate-limiting)

---

## 🔐 Autenticación

### POST /auth/register

Crear nueva cuenta.

**Request:**

```bash
curl -X POST https://verificacodigos.com/.netlify/functions/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "password": "SeguraContrasena123!"
  }'
```

**Parámetros:**

| Campo      | Tipo   | Requerido | Descripción              |
| ---------- | ------ | --------- | ------------------------ |
| `email`    | string | ✅        | Email único              |
| `username` | string | ✅        | Username 3-20 caracteres |
| `password` | string | ✅        | Min 8 caracteres         |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Cuenta creada. Verifica tu email.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "karma": 0,
    "level": 1,
    "created_at": "2026-01-30T12:34:56Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /auth/login

Iniciar sesión.

**Request:**

```bash
curl -X POST https://verificacodigos.com/.netlify/functions/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "SeguraContrasena123!"
  }'
```

**Parámetros:**

| Campo      | Tipo   | Requerido | Descripción      |
| ---------- | ------ | --------- | ---------------- |
| `email`    | string | ✅        | Email registrado |
| `password` | string | ✅        | Contraseña       |

**Response (200 OK):**

```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "karma": 150,
    "level": 2,
    "avatar_url": "https://...",
    "created_at": "2026-01-30T12:34:56Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 604800
}
```

---

### POST /auth/logout

Cerrar sesión (revoca token).

**Request:**

```bash
curl -X POST https://verificacodigos.com/.netlify/functions/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Sesión cerrada."
}
```

---

### GET /auth/verify-email

Verificar email con token.

**Request:**

```bash
curl "https://verificacodigos.com/.netlify/functions/auth/verify-email?token=abc123xyz"
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Email verificado correctamente."
}
```

---

## 📦 Códigos

### GET /codes

Listar códigos con paginación y filtros.

**Request:**

```bash
curl "https://verificacodigos.com/.netlify/functions/codes?page=1&limit=12&category=fintech&sort=verified_count"
```

**Parámetros (Query):**

| Parámetro  | Tipo   | Defecto | Descripción                            |
| ---------- | ------ | ------- | -------------------------------------- |
| `page`     | number | 1       | Número de página                       |
| `limit`    | number | 12      | Códigos por página (máx. 50)           |
| `category` | string | -       | Slug categoría (fintech, compras, etc) |
| `sort`     | string | -       | Campo: verified_count, created_at      |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "code-uuid-1",
      "app_name": "Revolut",
      "code": "REVOLUT20",
      "description": "20€ bonus al registrarse",
      "discount_type": "fixed",
      "discount_value": 20,
      "category_id": "cat-fintech",
      "verified_count": 145,
      "downvote_count": 2,
      "status": "active",
      "user_id": "user-uuid",
      "created_at": "2026-01-28T10:15:00Z",
      "expires_at": "2026-03-30T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 487,
    "pages": 41
  }
}
```

---

### GET /codes/:id

Obtener detalle de un código específico.

**Request:**

```bash
curl "https://verificacodigos.com/.netlify/functions/codes/code-uuid-1"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "code-uuid-1",
    "app_name": "Revolut",
    "code": "REVOLUT20",
    "description": "20€ bonus al registrarse",
    "discount_type": "fixed",
    "discount_value": 20,
    "category_id": "cat-fintech",
    "verified_count": 145,
    "downvote_count": 2,
    "status": "active",
    "user_id": "user-uuid",
    "user": {
      "id": "user-uuid",
      "username": "usuario123",
      "karma": 350,
      "level": 3,
      "avatar_url": "https://..."
    },
    "created_at": "2026-01-28T10:15:00Z",
    "expires_at": "2026-03-30T00:00:00Z"
  }
}
```

---

### POST /codes

Crear un nuevo código. **Requiere autenticación.**

**Request:**

```bash
curl -X POST https://verificacodigos.com/.netlify/functions/codes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "Revolut",
    "code": "REVOLUT20",
    "description": "20€ bonus al registrarse",
    "category_id": "cat-fintech",
    "discount_type": "fixed",
    "discount_value": 20,
    "url": "https://revolut.com/referrals/usuario",
    "expires_at": "2026-03-30T00:00:00Z"
  }'
```

**Parámetros (Body):**

| Campo            | Tipo   | Requerido | Descripción                       |
| ---------------- | ------ | --------- | --------------------------------- |
| `app_name`       | string | ✅        | Nombre app/empresa                |
| `code`           | string | ✅        | Código descuento (único)          |
| `description`    | string | ✅        | Qué ofrece (max 200 chars)        |
| `category_id`    | string | ✅        | UUID de categoría                 |
| `discount_type`  | string | ✅        | fixed \| percentage \| free_trial |
| `discount_value` | number | ✅        | Cantidad (€ o %)                  |
| `url`            | string | ❌        | Link directo                      |
| `expires_at`     | string | ❌        | ISO 8601 fecha expiración         |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "+10 Carga por crear código",
  "data": {
    "id": "code-uuid-new",
    "app_name": "Revolut",
    "code": "REVOLUT20",
    "status": "active",
    "verified_count": 0,
    "created_at": "2026-01-30T14:22:00Z"
  },
  "karma_awarded": 10
}
```

---

### PUT /codes/:id

Editar código propio. **Requiere autenticación.**

**Request:**

```bash
curl -X PUT https://verificacodigos.com/.netlify/functions/codes/code-uuid-1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Ahora 25€ bonus",
    "discount_value": 25
  }'
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Código actualizado.",
  "data": {
    "id": "code-uuid-1",
    "description": "Ahora 25€ bonus",
    "discount_value": 25,
    "updated_at": "2026-01-30T14:25:00Z"
  }
}
```

---

### DELETE /codes/:id

Eliminar código propio. **Requiere autenticación.**

**Request:**

```bash
curl -X DELETE https://verificacodigos.com/.netlify/functions/codes/code-uuid-1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Código eliminado."
}
```

---

## 👍 Votos

### POST /votes

Votar un código (verificar que funciona). **Requiere autenticación.**

**Request:**

```bash
curl -X POST https://verificacodigos.com/.netlify/functions/votes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "code_id": "code-uuid-1",
    "type": "up"
  }'
```

**Parámetros (Body):**

| Campo     | Tipo   | Requerido | Descripción     |
| --------- | ------ | --------- | --------------- |
| `code_id` | string | ✅        | UUID del código |
| `type`    | string | ✅        | up \| down      |

**Reglas de Carga:**

- `type: "up"` → +5 Carga al autor, +3 al votante, +1 verified_count.
- `type: "down"` → -3 Carga al autor, +1 downvote_count. Si downvotes ≥ 5 → status = 'expired'.

**Response (201 Created):**

```json
{
  "success": true,
  "message": "+3 Carga por verificación",
  "data": {
    "vote_id": "vote-uuid",
    "code_id": "code-uuid-1",
    "type": "up",
    "created_at": "2026-01-30T14:30:00Z"
  },
  "karma_awarded": 3
}
```

---

## 👥 Usuarios

### GET /users/:id

Obtener perfil de usuario.

**Request:**

```bash
curl "https://verificacodigos.com/.netlify/functions/users/user-uuid-1"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "user-uuid-1",
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "karma": 350,
    "level": 3,
    "avatar_url": "https://...",
    "codes_submitted": 12,
    "votes_made": 87,
    "badges": ["Verificador", "Popular"],
    "created_at": "2026-01-15T08:00:00Z"
  }
}
```

---

### GET /users/ranking

Ranking de usuarios por Carga.

**Request:**

```bash
curl "https://verificacodigos.com/.netlify/functions/users/ranking?period=week&limit=100"
```

**Parámetros (Query):**

| Parámetro | Tipo   | Defecto | Descripción              |
| --------- | ------ | ------- | ------------------------ |
| `period`  | string | all     | all \| month \| week     |
| `limit`   | number | 100     | Top N usuarios (máx 100) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "username": "usuario123",
      "karma": 5420,
      "level": 5,
      "avatar_url": "https://...",
      "codes_submitted": 45,
      "badges": ["Leyenda", "Popular"]
    },
    {
      "rank": 2,
      "username": "usuario456",
      "karma": 4890,
      "level": 5,
      "avatar_url": "https://...",
      "codes_submitted": 38,
      "badges": ["Experto"]
    }
  ],
  "period": "week",
  "generated_at": "2026-01-30T14:35:00Z"
}
```

---

## 🔍 Búsqueda

### GET /search

Buscar códigos por query y filtros.

**Request:**

```bash
curl "https://verificacodigos.com/.netlify/functions/search?q=netflix&category=streaming&page=1&limit=12"
```

**Parámetros (Query):**

| Parámetro  | Tipo   | Requerido | Descripción               |
| ---------- | ------ | --------- | ------------------------- |
| `q`        | string | ✅        | Término búsqueda          |
| `category` | string | ❌        | Slug categoría            |
| `page`     | number | ❌        | Número página (default 1) |
| `limit`    | number | ❌        | Por página (default 12)   |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "code-uuid-netflix",
      "app_name": "Netflix",
      "code": "NETFLIX30",
      "description": "1 mes gratis",
      "verified_count": 234,
      "score": 0.95
    }
  ],
  "query": "netflix",
  "total": 23,
  "page": 1
}
```

---

## 📂 Categorías

### GET /categories

Listar todas las categorías.

**Request:**

```bash
curl "https://verificacodigos.com/.netlify/functions/categories"
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-fintech",
      "name": "Fintech & Bancos",
      "emoji": "💳",
      "slug": "fintech",
      "codes_count": 156
    },
    {
      "id": "cat-compras",
      "name": "Compras Online",
      "emoji": "🛒",
      "slug": "compras",
      "codes_count": 287
    },
    {
      "id": "cat-streaming",
      "name": "Entretenimiento",
      "emoji": "📺",
      "slug": "streaming",
      "codes_count": 234
    },
    {
      "id": "cat-seguridad",
      "name": "Seguridad",
      "emoji": "🔒",
      "slug": "seguridad",
      "codes_count": 89
    },
    {
      "id": "cat-apps",
      "name": "Productividad",
      "emoji": "📱",
      "slug": "apps",
      "codes_count": 67
    },
    {
      "id": "cat-crypto",
      "name": "Crypto & Trading",
      "emoji": "🪙",
      "slug": "crypto",
      "codes_count": 34
    }
  ]
}
```

---

## 📧 Newsletter

### POST /newsletter/subscribe

Suscribirse a la newsletter.

**Request:**

```bash
curl -X POST https://verificacodigos.com/.netlify/functions/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "preferences": ["fintech", "compras"]
  }'
```

**Parámetros (Body):**

| Campo         | Tipo   | Requerido | Descripción            |
| ------------- | ------ | --------- | ---------------------- |
| `email`       | string | ✅        | Email suscriptor       |
| `preferences` | array  | ❌        | Array slugs categorías |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Suscrito a newsletter.",
  "data": {
    "email": "usuario@ejemplo.com",
    "preferences": ["fintech", "compras"],
    "subscribed_at": "2026-01-30T14:40:00Z"
  }
}
```

---

## ⚠️ Códigos de error

| Código  | Mensaje               | Solución                                                            |
| ------- | --------------------- | ------------------------------------------------------------------- |
| **400** | Bad Request           | Datos inválidos o falta algún campo requerido. Verifica el request. |
| **401** | Unauthorized          | Token JWT inválido, expirado o no incluido. Inicia sesión.          |
| **403** | Forbidden             | No tienes permiso (ej: editar código de otro usuario).              |
| **404** | Not Found             | Recurso no encontrado (código, usuario, categoría).                 |
| **409** | Conflict              | Duplicado (email o código ya existe).                               |
| **422** | Unprocessable Entity  | Datos malformados (ej: email sin @, karma negativo).                |
| **429** | Too Many Requests     | Rate limit excedido. Espera antes de reintentar.                    |
| **500** | Internal Server Error | Error del servidor. Intenta más tarde.                              |

**Ejemplo de error response:**

```json
{
  "success": false,
  "error": "Código inválido",
  "status": 400,
  "details": {
    "field": "code",
    "message": "El código es requerido"
  }
}
```

---

## 🔄 Rate Limiting

### Límites por endpoint

| Endpoint                     | Límite      | Ventana              |
| ---------------------------- | ----------- | -------------------- |
| `POST /auth/register`        | 5 requests  | 1 hora por IP        |
| `POST /auth/login`           | 10 requests | 15 minutos por IP    |
| `POST /codes`                | 5 requests  | 1 hora por usuario   |
| `POST /votes`                | 20 requests | 24 horas por usuario |
| `GET /search`                | 30 requests | 1 minuto por IP      |
| `POST /newsletter/subscribe` | 10 requests | 1 hora por IP        |

### Headers de rate limiting

Cada respuesta incluye:

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 18
X-RateLimit-Reset: 1643390400
X-RateLimit-RetryAfter: 60
```

Si excedes el límite (429):

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "message": "Intenta de nuevo en 60 segundos"
}
```

---

## 📝 Ejemplos completos

### Flujo: Crear código y votarlo

```bash
# 1. Login
TOKEN=$(curl -s -X POST https://verificacodigos.com/.netlify/functions/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "test123"
  }' | jq -r '.token')

# 2. Crear código
CODE_ID=$(curl -s -X POST https://verificacodigos.com/.netlify/functions/codes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "app_name": "Netflix",
    "code": "NETFLIX30",
    "description": "1 mes gratis",
    "category_id": "cat-streaming",
    "discount_type": "free_trial"
  }' | jq -r '.data.id')

# 3. Votar (+verificar que funciona)
curl -X POST https://verificacodigos.com/.netlify/functions/votes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"code_id\": \"$CODE_ID\",
    \"type\": \"up\"
  }"
```

---

## 📞 Soporte

- 📧 Email: support@verificacodigos.com
- 🐛 Issues: GitHub Issues
- 💬 Discord: [enlace comunidad]

**Última actualización:** 30 Enero 2026
