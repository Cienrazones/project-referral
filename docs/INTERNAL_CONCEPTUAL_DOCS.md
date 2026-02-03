text

# DOCUMENTACIÓN CONCEPTUAL INTERNA - VerificaCódigos

**Versión:** 2.0 Conceptual  
**Fecha:** 3 Febrero 2026  
**Estado:** Production Ready (alineado con schema físico v1.0)  
**Security Score (referencia):** 91.7 / 100

> Este documento describe la **arquitectura conceptual** de VerificaCódigos.  
> El esquema físico actual se implementa en **22 tablas PostgreSQL**, documentadas en `INTERNAL_DATABASE_DOCS.md` y en el archivo `SCHEMAPRODUCCIONFINAL2026.sql`.

---

## 0. Tabla de contenidos

1. Visión general del sistema
2. Dominios funcionales
3. Entidades conceptuales
4. Relaciones y reglas de negocio
5. Flujos de datos clave
6. Arquitectura de seguridad
7. Sistema de puntos y niveles
8. Sistema de moderación
9. Automatizaciones (CRON)
10. SEO y descubribilidad
11. Compliance y privacidad (GDPR)
12. Resumen estadístico (alto nivel)

---

## 1. Visión general del sistema

VerificaCódigos es una plataforma comunitaria donde:

- Usuarios publican códigos promocionales (Netflix, Amazon, etc).
- La comunidad verifica si funcionan (positivo/negativo).
- Un sistema de puntos y niveles recompensa contribuciones valiosas.
- Moderadores y admins gestionan reportes, spam y abusos.
- Módulos de SEO maximizan la visibilidad orgánica.
- Capas de seguridad y auditoría controlan fraude, bots y cumplimiento GDPR.

A nivel físico, todo esto vive en **22 tablas** distribuidas en dominios: Core Aplicación, SEO, Sistema y Legacy.

---

## 2. Dominios funcionales

### 2.1 Dominio Usuarios & Gamificación

Agrupa identidad, niveles, puntos y preferencias:

- Usuarios: credenciales, puntos, nivel, estado de bloqueo, tracking de login.
- Preferencias de notificación: configuración opt‑in/opt‑out por tipo de evento.

### 2.2 Dominio Códigos & Engagement

Trabaja la vida del código y la interacción comunitaria:

- Códigos: título, descripción, código promocional, caducidad, estado.
- Verificaciones: votos positivos/negativos con límites de uso.
- Comentarios: discusiones a dos niveles, sin URLs ni spam.
- Reportes: denuncias de códigos problemáticos.
- Moderadores: usuarios con permisos especiales de moderación.

### 2.3 Dominio SEO & Descubribilidad

Todo lo que afecta a Google y tráfico orgánico:

- SEO metadata por entidad (títulos, descripciones, slugs, schema.org, OG).
- Palabras clave rastreadas y posiciones.
- Rendimiento SEO (tráfico, CTR, rebote).
- Links internos/externos y sitemaps autogenerados.

### 2.4 Dominio Sistema & Seguridad

Sostiene la operación y el control:

- Anomalías de usuario (behavioral analysis).
- Acciones de admin (audit log).
- Bloqueos y ejecuciones de CRON.
- Logs de purga GDPR y usuarios borrados.
- Estado de mantenimiento/legacy.

---

## 3. Entidades conceptuales

### 3.1 Usuario

Rol:

- Crea códigos, verifica códigos, comenta, reporta, gana puntos y sube de nivel.

Conceptualmente, un usuario tiene:

- Identidad: username, email.
- Gamificación: puntos (0–10000), nivel (1–5).
- Estado: activo/bloqueado, bloqueo temporal.
- Seguridad: intentos de login, último IP y timestamp.
- Privacidad: puede ser anonimizado y purgado bajo GDPR.

### 3.2 Código

Rol:

- Representa un código promocional concreto dentro de una categoría.

Conceptualmente, un código incluye:

- Contenido: título, descripción, valor de código promocional.
- Caducidad: evento especial, fecha personalizada o sin caducidad explícita.
- Estado: activo, caducado o eliminado.
- Engagement: positivas, negativas, rating medio, puntos asociados.
- Propiedad: referencia al usuario creador (puede quedar sin propietario en GDPR).

### 3.3 Verificación

Rol:

- Confirmar si un código funciona o no, afectando puntos y credibilidad.

Idea conceptual:

- Es positiva o negativa, opcionalmente con comentario corto.
- Impacta en los puntos del autor del código.
- Está limitada por rate‑limit diario por usuario (máx. 50/día).
- No se permite auto-verificación del propio código.

### 3.4 Comentario

Rol:

- Facilitar conversación alrededor de un código sin convertirlo en foro infinito.

Concepto:

- Comentarios asociados a código y usuario, con jerarquía máxima de 2 niveles.
- Sin URLs permitidas y sin duplicados en ventana corta.
- Editables solo durante una hora tras su creación.

### 3.5 Reporte y Moderador

Rol:

- Reporte: marcar códigos sospechosos.
- Moderador: revisar, decidir y actuar dentro de límites.

Concepto:

- Reporte tiene estado: pendiente → revisando → resuelto / rechazado.
- Moderador solo ve reportes asignados (RLS).
- Admin puede ver todos los reportes y tomar acciones globales.

### 3.6 SEO Metadata y Sistema

Rol:

- SEO metadata: controlar cómo se muestra cada entidad en buscadores.
- Sistema: registrar anomalías, logs de admin, ejecuciones CRON y purgas GDPR.

---

## 4. Relaciones y reglas de negocio

Relaciones principales:

- Usuario 1–N Códigos: un usuario puede crear muchos códigos.
- Usuario 1–N Verificaciones: puede verificar muchos códigos.
- Usuario 1–N Comentarios: puede escribir muchos comentarios.
- Categoría 1–N Códigos: cada código pertenece a una categoría.
- Código 1–N Verificaciones, Comentarios y Reportes.
- Moderador 1–N Reportes: un moderador gestiona múltiples reportes.
- Comentario 1–N Comentarios (auto‑referencia) limitado a profundidad 2.

Reglas:

- No se puede borrar una categoría que aún tiene códigos.
- No se puede borrar un código con reportes pendientes.
- Comentarios no pueden exceder 2 niveles de nesting.
- Un usuario no puede verificar sus propios códigos.

---

## 5. Flujos de datos clave

### 5.1 Crear código

1. Usuario rellena formulario (título, descripción, código, categoría, caducidad).
2. API valida autenticación, formato y rate‑limit de creación.
3. DB crea el código y aplica constraints (longitud, estados, caducidad).
4. SEO registra metadata y se programa regeneración de sitemap.

### 5.2 Verificar código

1. Usuario marca si funciona/no funciona.
2. API comprueba JWT, que el código está activo y que no es autor.
3. DB inserta la verificación, aplica rate‑limit diario y prohíbe auto‑verificación.
4. Se actualizan puntos del autor y rating del código de forma atómica.

### 5.3 Reportar código

1. Usuario selecciona motivo (spam, no funciona, ofensivo, engaño, duplicado, otro).
2. Se crea un reporte en estado pendiente.
3. Admin asigna a moderador; estado revisando.
4. Moderador decide: rechazar reporte o eliminar/ajustar el código.
5. Se notifica al usuario que reportó y se registra en adminactions.

### 5.4 Borrado de usuario (GDPR)

1. Usuario solicita borrar su cuenta.
2. Backend ejecuta función de purga GDPR.
3. Se borran verificaciones y comentarios del usuario.
4. El usuario queda anonimizado (username/email sustituidos) y desactivado.
5. Códigos quedan sin propietario, sujetos a limpieza por CRON si no se usan o son negativos.
6. Se registra todo en logs GDPR y de usuarios borrados con ventana de recuperación 30 días.

### 5.5 Jobs CRON críticos

- Marcar códigos caducados.
- Limpiar códigos sin propietario/uso según reglas de negocio.
- Verificar fallos de CRON y enviar alertas.
- Hard delete tras 90 días para datos marcados.

---

## 6. Arquitectura de seguridad (conceptual)

Capas:

1. Frontend: validación de inputs, límites de longitud, protección XSS básica.
2. API: validación de JWT, rate‑limits, autorización por recurso.
3. DB – Constraints: CHECK, UNIQUE, NOT NULL y claves foráneas.
4. DB – Triggers: no auto‑verificación, rate‑limit verificaciones, validación de comentarios y URLs.
5. Row Level Security: aislamiento de reportes y logs de admin.
6. Transacciones: uso de aislamiento SERIALIZABLE y locking optimista.
7. Detección AI: anomalías de comportamiento y credential stuffing.
8. Monitoring: logs de cron, alertas Slack, auditoría de adminactions.

---

## 7. Sistema de puntos y niveles

### 7.1 Cómo se ganan puntos

Ejemplos conceptuales:

- Crear código: +5 puntos (limitado por día).
- Recibir verificación positiva: +10 puntos para el autor.
- Recibir verificación negativa: −5 puntos para el autor.
- Comentario útil (upvotes): +2 puntos (con límite diario).
- Reporte válido aceptado: +10 puntos.

### 7.2 Niveles de usuario

- Nivel 1: Rookie (0–49 puntos).
- Nivel 2: Regular (50–199).
- Nivel 3: Confiable (200–499).
- Nivel 4: Experto (500–999).
- Nivel 5: Maestro (1000+).

Cada nivel desbloquea más capacidades (visibilidad, edición, etc.), descritas en la capa de negocio y reflejadas en la UI.

---

## 8. Sistema de moderación

### 8.1 Roles

- Moderador: revisa reportes, elimina códigos problemáticos, puede aplicar sanciones ligeras.
- Senior: gestiona reportes más complejos y puede ajustar configuración moderada.
- Admin: acceso completo a usuarios, configuración y logs.

### 8.2 Workflow de reportes

Estados:

- Pendiente: creado, en cola.
- Revisando: asignado a moderador, en análisis.
- Resuelto: acción aplicada, usuario notificado.
- Rechazado: reporte inválido; el código sigue activo.

---

## 9. Automatizaciones (CRON)

Conceptualmente, la plataforma se apoya en:

- Jobs diarios para caducidad y limpieza de códigos.
- Jobs SEO para sitemaps y rendimiento orgánico.
- Jobs de monitoring para detectar fallos de cron.
- Jobs semanales de hard‑delete de datos marcados para borrado.

Todos se ejecutan de forma **staggered** (espaciados) para evitar contención.

---

## 10. SEO y descubribilidad

Estrategia:

- Posicionar keywords como “código descuento Netflix”, “código promocional Amazon”, etc.
- Inyectar metadata rica por código y categoría (title, description, OG, schema.org).
- Mantener sitemap.xml actualizado con cambios relevantes.
- Medir tráfico, CTR y rebote para ajustar estrategia.

---

## 11. Compliance y privacidad (GDPR)

Principios:

- Derecho al olvido: función dedicada que anonimiza y elimina contenido asociado.
- Portabilidad: endpoint de export de datos del usuario en formato estructurado.
- Consentimiento: tabla de preferencias para almacenar opt‑in explícito.
- Acceso: endpoint que lista todos los datos ligados a un usuario autenticado.

Logs conservados:

- Logs de purga GDPR.
- Logs de usuarios borrados (ventana de recuperación 30 días).
- Logs de acciones de admin para auditoría.

---

## 12. Resumen estadístico (alto nivel)

- Tablas físicas: **22** (10 Core Aplicación, 5 SEO, 6 Sistema, 1 Legacy).
- Funciones core: 8.
- Triggers de seguridad: 8.
- Policies RLS activas: 2.
- CRON jobs configurados: 13.
- Índices optimizados: 20.
- Vulnerabilidades críticas mitigadas: 24.
- Security Score: 91.7 / 100.

> Este documento conceptual está alineado con `INTERNAL_DATABASE_DOCS.md` y `SCHEMAPRODUCCIONFINAL2026.sql`.  
> Cualquier cambio en el esquema físico debe reflejarse primero en la doc de base de datos y después en este documento.
