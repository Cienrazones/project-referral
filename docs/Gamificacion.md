## Índice

**Nota técnica:** En la base de datos, el campo se llama `karma` (convención técnica estándar), pero el nombre público del sistema es **Flujo**.

1. [Filosofía del Sistema](#filosofía-del-sistema)
2. [Qué NO es Flujo (Lecciones de Black Mirror)](#qué-no-es-flujo)
3. [Mecánicas de Puntos](#mecánicas-de-puntos)
4. [Niveles y Progresión](#niveles-y-progresión)
5. [Badges y Logros](#badges-y-logros)
6. [Sistema de Reputación](#sistema-de-reputación)
7. [Anti-Abuso y Fairness](#anti-abuso-y-fairness)
8. [Implementación Técnica](#implementación-técnica)
9. [Pruebas A/B y Métricas](#pruebas-ab-y-métricas)
10. [Referencias y Recursos](#referencias-y-recursos)

---

## Filosofía del Sistema

### La Gran Idea

**Flujo es un sistema de reputación que mide contribución verificable a la comunidad, no conformidad social.**

Cuando subes un código que funciona, no estás ganando likes. Estás ayudando a cientos de personas a ahorrar dinero real. Eso tiene valor tangible y medible.

### Principios Fundamentales

**1. Medir trabajo real, no popularidad**

- Flujo representa esfuerzo verificado por otros usuarios
- No puedes "comprarlo" con dinero
- No puedes "simularlo" con bots (sistema anti-fraude robusto)

**2. Transparencia absoluta**

- Todas las reglas son públicas
- Los usuarios ven exactamente cómo ganaron/perdieron puntos
- Algoritmo abierto (no caja negra como algoritmos de redes sociales)

**3. No es un juego de popularidad**

- Tu Flujo no afecta tu vida real (acceso a vivienda, trabajo, créditos)
- Nadie puede "downvotear" tu perfil, solo códigos específicos
- No hay penalización por asociarte con usuarios de bajo Flujo

**4. Diseñado para comunidad, no para vigilancia**

- No rastreamos comportamiento fuera de la plataforma
- No penalizamos opiniones políticas o ideológicas
- Solo medimos: ¿Tu código funcionó? ¿Ayudó a alguien?

### Inspiraciones (Lo Bueno)

- **Wikipedia:** Contribuidores miden su impacto por ediciones verificadas y mantenidas por la comunidad. No hay "downvote" a personas, solo a contenido específico.
- **Stack Overflow:** Reputation mide conocimiento técnico verificado. Las respuestas correctas (verificadas por la comunidad) suben, las incorrectas bajan. Pero tu cuenta no puede ser "downvoteada" globalmente.
- **Reddit Karma:** Mide contribución a discusiones. Pero Karma no determina acceso a servicios ni afecta tu vida real.

### Qué es Flujo

Russell T Davies (creador de _Years and Years_) dijo:

> "La tecnología no es el problema. El problema es cuando la tecnología amplifica lo peor de la naturaleza humana sin controles éticos."

Flujo no es un sistema de control social. Es un sistema de reconocimiento por trabajo real. Como los créditos universitarios: miden aprendizaje, no te hacen mejor persona ni determinan tu valor humano.

---

## Qué NO es Flujo

### Lecciones de Black Mirror

**Episodio: Nosedive (3x01)**

En este episodio, la protagonista vive en un mundo donde cada interacción social se califica con estrellas (1-5). Tu puntuación determina:

- Acceso a viviendas premium
- Aprobación de préstamos
- Prioridad en aeropuertos
- Invitaciones sociales

**Problema:** Las personas optimizan para la métrica, no para autenticidad. Fingen felicidad constante, evitan conflictos sanos, y viven con ansiedad permanente.

### Flujo NO hace esto

| Black Mirror (Distopía)                         | VerificaCodigos (Realidad)                          |
| ----------------------------------------------- | --------------------------------------------------- |
| Tu puntuación afecta vivienda, trabajo, crédito | Flujo solo existe dentro de la plataforma           |
| Puedes ser downvoteado globalmente              | Solo códigos específicos pueden ser downvoteados    |
| Bajar 0.1 puntos = pánico social                | Perder 5 Flujo = motivación para subir mejor código |
| Optimización performativa (fingir)              | Trabajo real (código funciona o no)                 |
| No puedes recuperarte de puntuación baja        | Siempre puedes subir nuevos códigos                 |

### Principio de Diseño

**"Un sistema de gamificación ético debe medir comportamiento auténtico, no forzar conformidad."**

Flujo mide: ¿Ayudaste a alguien? No mide: ¿Caíste bien?

---

## Mecánicas de Puntos

### Tabla de Acciones y Flujo

| Acción                                        | Flujo | Condiciones                        | Cooldown |
| --------------------------------------------- | ----- | ---------------------------------- | -------- |
| Subir código nuevo                            | +10   | Código único (no duplicado)        | -        |
| Código verificado "Funciona" por otro usuario | +5    | Por cada verificación positiva     | -        |
| Código alcanza 10 verificaciones positivas    | +20   | Bonus una sola vez                 | -        |
| Código alcanza 50 verificaciones positivas    | +50   | Bonus una sola vez                 | -        |
| Código ayuda a 100 personas (copias)          | +100  | Bonus una sola vez                 | -        |
| Verificar código ajeno (up/down)              | +3    | Máximo 20 verificaciones/día       | 1 hora   |
| Código reportado caducado (5+ downvotes)      | -5    | Penalización al creador del código | -        |
| Código eliminado por spam                     | -20   | Decisión de moderador              | -        |
| Streak de 7 días consecutivos verificando     | +15   | Al completar la semana             | -        |
| Streak de 30 días consecutivos                | +50   | Al completar el mes                | -        |

### Detalles de Implementación

#### 1. Código Verificado Positivamente

// netlify/functions/votes.js
export const handler = async (event) => {
const { code_id, type } = JSON.parse(event.body);
const user = event.user; // Del middleware de auth

if (type === 'up') {
// +5 Flujo al dueño del código (campo: karma)
await supabase.rpc('increment_karma', {
user_id: code.user_id,
amount: 5,
reason: 'code_upvoted'
});

    // +3 Flujo al votante (campo: karma)
    await supabase.rpc('increment_karma', {
      user_id: user.id,
      amount: 3,
      reason: 'verified_code'
    });

}
};

#### 2. Bonuses por Popularidad

-- Trigger automático cuando un código alcanza 10 verificaciones
CREATE OR REPLACE FUNCTION check_verification_milestones()
RETURNS TRIGGER AS $$
BEGIN
IF NEW.verified_count = 10 AND OLD.verified_count < 10 THEN
UPDATE users SET karma = karma + 20 WHERE id = NEW.user_id;
INSERT INTO karma_log (user_id, amount, reason)
VALUES (NEW.user_id, 20, 'code_10_verifications');
END IF;

IF NEW.verified_count = 50 AND OLD.verified_count < 50 THEN
UPDATE users SET karma = karma + 50 WHERE id = NEW.user_id;
INSERT INTO karma_log (user_id, amount, reason)
VALUES (NEW.user_id, 50, 'code_50_verifications');
END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

CREATE TRIGGER trigger_verification_milestones
  AFTER UPDATE OF verified_count ON codes
  FOR EACH ROW
  EXECUTE FUNCTION check_verification_milestones();

#### 3. Penalización por Códigos Caducados

-- Si un código recibe 5+ downvotes, se marca expired y penaliza al creador
CREATE OR REPLACE FUNCTION penalize_expired_code()
RETURNS TRIGGER AS
$$

BEGIN
IF NEW.downvote_count >= 5 AND OLD.downvote_count < 5 THEN
UPDATE codes SET status = 'expired' WHERE id = NEW.id;
UPDATE users SET karma = karma - 5 WHERE id = NEW.user_id;
INSERT INTO karma_log (user_id, amount, reason)
VALUES (NEW.user_id, -5, 'code_expired');
END IF;

RETURN NEW;
END;

$$
LANGUAGE plpgsql;

#### 4. Rate Limits (Anti-Abuso)

// src/middleware/rateLimit.js
const verificationLimits = new Map(); // userId -> { count, resetTime }

export const checkVerificationLimit = (userId) => {
  const now = Date.now();
  const dailyLimit = 20; // 20 verificaciones/día

  if (!verificationLimits.has(userId)) {
    verificationLimits.set(userId, {
      count: 1,
      resetTime: now + (24 * 60 * 60 * 1000) // 24h
    });
    return true;
  }

  const record = verificationLimits.get(userId);

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + (24 * 60 * 60 * 1000);
    return true;
  }

  if (record.count >= dailyLimit) {
    return false; // Límite excedido
  }

  record.count++;
  return true;
};

---

## Niveles y Progresión

### Sistema de 5 Niveles

| Nivel | Nombre | Flujo Requerido | Badge | Beneficios |
|-------|--------|-----------------|-------|------------|
| 1 | 🌱 Explorador | 0 - 100 | Verde básico | Acceso completo a la plataforma |
| 2 | ✅ Verificador | 101 - 500 | Azul verificado | Badge "Verificado", acceso anticipado a nuevas features |
| 3 | 🔥 Contribuidor | 501 - 1500 | Naranja destacado | Perfil destacado en ranking, notificaciones priority |
| 4 | 💎 Experto | 1501 - 5000 | Morado elite | Verificación rápida automática, acceso a estadísticas avanzadas |
| 5 | 👑 Leyenda | 5000+ | Dorado legendario | Todos los beneficios + reconocimiento en homepage |

### Curva de Progresión (Matemática)

La progresión no es lineal. Pasar de Nivel 1 a 2 es relativamente rápido (subir 10 códigos), pero llegar a Leyenda requiere contribución sostenida.

// src/utils/levelCalculation.js
export const calculateLevel = (karma) => {
  if (karma >= 5000) return { level: 5, name: 'Leyenda', badge: '👑' };
  if (karma >= 1501) return { level: 4, name: 'Experto', badge: '💎' };
  if (karma >= 501) return { level: 3, name: 'Contribuidor', badge: '🔥' };
  if (karma >= 101) return { level: 2, name: 'Verificador', badge: '✅' };
  return { level: 1, name: 'Explorador', badge: '🌱' };
};

export const getNextLevelProgress = (karma) => {
  const levels = [101, 501, 1501, 5000];
  const currentLevel = calculateLevel(karma).level;

  if (currentLevel === 5) {
    return { progress: 100, nextLevelKarma: null };
  }

  const nextLevelKarma = levels[currentLevel - 1];
  const prevLevelKarma = currentLevel === 1 ? 0 : levels[currentLevel - 2];
  const progress = ((karma - prevLevelKarma) / (nextLevelKarma - prevLevelKarma)) * 100;

  return { progress: Math.round(progress), nextLevelKarma };
};

### Beneficios Desbloqueables

**Nivel 2: Verificador (101+ Flujo)**

- Badge Verificado: Aparece junto a tu nombre en todos tus códigos
- Acceso anticipado: Pruebas beta de nuevas features
- Color personalizado: Elige color de tu badge de perfil

**Nivel 3: Contribuidor (501+ Flujo)**

- Perfil destacado: Apareces en sección "Top Contributors" de homepage
- Notificaciones priority: Tus códigos se notifican primero a usuarios activos
- Stats avanzadas: Dashboard con métricas de impacto (€ ahorrados por tus códigos)

**Nivel 4: Experto (1501+ Flujo)**

- Verificación automática: Tus códigos se marcan como "Pre-verificado por Experto"
- Edición rápida: Puedes editar códigos sin aprobación de moderador
- Insights de comunidad: Acceso a datos agregados (tendencias, categorías más buscadas)

**Nivel 5: Leyenda (5000+ Flujo)**

- Reconocimiento en homepage: Tu perfil aparece rotando en hero section
- Invitaciones exclusivas: Eventos virtuales con equipo de VerificaCodigos
- Badge personalizado: Diseña tu propio badge único
- Early access lifetime: Acceso permanente a todas las betas futuras

---

## Badges y Logros

### Tipos de Badges

#### Badges de Progresión (Automáticos)

| Badge | Nombre | Requisito | Emoji |
|-------|--------|-----------|-------|
| Early Bird | Madrugador | Primeros 100 usuarios registrados | 🐦 |
| Code Novice | Novato | Subir tu primer código | 🎯 |
| Code Hunter | Cazador | 50+ códigos subidos | 🏹 |
| Code Master | Maestro | 200+ códigos subidos | 🎓 |
| Verification Hero | Héroe Verificador | 1000+ verificaciones realizadas | 🦸 |
| Community Pillar | Pilar Comunitario | 5000+ verificaciones realizadas | 🏛️ |

#### Badges de Streak (Consistencia)

| Badge | Nombre | Requisito | Emoji |
|-------|--------|-----------|-------|
| Week Warrior | Guerrero Semanal | 7 días consecutivos verificando | 📅 |
| Streak Master | Maestro Racha | 30 días consecutivos verificando | 🔥 |
| Unstoppable | Imparable | 90 días consecutivos verificando | ⚡ |
| Eternal Flame | Llama Eterna | 365 días consecutivos verificando | 🌟 |

#### Badges de Impacto (Contribución)

| Badge | Nombre | Requisito | Emoji |
|-------|--------|-----------|-------|
| Money Saver | Ahorrador | Tus códigos ayudaron a ahorrar €1,000 | 💰 |
| Community Hero | Héroe Comunitario | Tus códigos ayudaron a ahorrar €10,000 | 🦸 |
| Legend Builder | Constructor Legendario | Tus códigos ayudaron a ahorrar €50,000 | 👑 |

#### Badges Especiales (Eventos)

| Badge | Nombre | Requisito | Emoji |
|-------|--------|-----------|-------|
| Launch Supporter | Apoyo Lanzamiento | Participar en beta cerrada | 🚀 |
| Black Friday Champion | Campeón Black Friday | Subir 10+ códigos durante Black Friday | 🛍️ |
| Category King | Rey de Categoría | #1 en una categoría específica durante 1 mes | 👑 |

### Implementación de Badges

#### Base de Datos

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  requirement_type TEXT NOT NULL, -- 'karma', 'codes_submitted', 'streak', 'savings', 'event'
  requirement_value INTEGER,
  is_special BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  PRIMARY KEY(user_id, badge_id)
);

#### Lógica de Asignación Automática

// src/services/badgeService.js
export const checkAndAwardBadges = async (userId) => {
  const user = await supabase
    .from('users')
    .select('karma, created_at')
    .eq('id', userId)
    .single();

  const codesCount = await supabase
    .from('codes')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  const verificationsCount = await supabase
    .from('votes')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  // Badge: Code Hunter (50+ códigos)
  if (codesCount.count >= 50) {
    await awardBadge(userId, 'code_hunter');
  }

  // Badge: Verification Hero (1000+ verificaciones)
  if (verificationsCount.count >= 1000) {
    await awardBadge(userId, 'verification_hero');
  }

  // Badge: Early Bird (primeros 100 usuarios)
  const userRank = await supabase
    .from('users')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(100);

  if (userRank.data.some(u => u.id === userId)) {
    await awardBadge(userId, 'early_bird');
  }
};

const awardBadge = async (userId, badgeSlug) => {
  const badge = await supabase
    .from('badges')
    .select('id')
    .eq('slug', badgeSlug)
    .single();

  const existing = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badge.id)
    .single();

  if (!existing) {
    await supabase.from('user_badges').insert({
      user_id: userId,
      badge_id: badge.id,
      earned_at: new Date().toISOString()
    });

    await sendNotification(userId, `¡Conseguiste el badge ${badge.name}! 🎉`);
  }
};

---

## Sistema de Reputación

### Factores Que Afectan Reputación

El Flujo es el número crudo, pero la Reputación es más compleja:

1. **Flujo total (peso: 50%)**
2. **Tasa de verificación positiva (peso: 20%)**
   - Ratio de upvotes vs downvotes en tus códigos
   - Fórmula: `(upvotes / (upvotes + downvotes)) * 100`
3. **Consistencia (streak) (peso: 15%)**
   - Días consecutivos activo
4. **Diversidad de categorías (peso: 10%)**
   - Contribuir en múltiples categorías suma más que especializarse
5. **Impacto comunitario (peso: 5%)**
   - Cuántas personas usaron tus códigos

### Cálculo de Reputación Score

// src/utils/reputationScore.js
export const calculateReputationScore = async (userId) => {
  const user = await supabase
    .from('users')
    .select('karma, streak_days')
    .eq('id', userId)
    .single();

  const codes = await supabase
    .from('codes')
    .select('verified_count, downvote_count, category_id')
    .eq('user_id', userId);

  // 1. Flujo total (normalizada a 0-100)
  const karmaScore = Math.min((user.karma / 10000) * 100, 100);

  // 2. Tasa de verificación positiva
  const totalUpvotes = codes.reduce((sum, c) => sum + c.verified_count, 0);
  const totalDownvotes = codes.reduce((sum, c) => sum + c.downvote_count, 0);
  const verificationRate = totalUpvotes / (totalUpvotes + totalDownvotes + 1);
  const verificationScore = verificationRate * 100;

  // 3. Consistencia (streak)
  const streakScore = Math.min((user.streak_days / 90) * 100, 100);

  // 4. Diversidad de categorías
  const uniqueCategories = new Set(codes.map(c => c.category_id)).size;
  const diversityScore = Math.min((uniqueCategories / 6) * 100, 100);

  // 5. Impacto comunitario
  const totalImpact = codes.reduce((sum, c) => sum + c.verified_count, 0);
  const impactScore = Math.min((totalImpact / 1000) * 100, 100);

  // Weighted average
  const reputationScore = (
    karmaScore * 0.5 +
    verificationScore * 0.2 +
    streakScore * 0.15 +
    diversityScore * 0.1 +
    impactScore * 0.05
  );

  return Math.round(reputationScore);
};

### Visualización de Reputación

**En el perfil del usuario:**

Reputación: 87/100

📊 Flujo Total: 92/100
✅ Tasa Verificación: 85% positivo
🔥 Consistencia: 45 días streak
🎯 Diversidad: 4/6 categorías
💪 Impacto: 324 personas ayudadas

---

## Anti-Abuso y Fairness

### Problemas Potenciales y Soluciones

#### 1. Farming de Puntos (Spam de Códigos)

**Problema:** Usuario sube 100 códigos fake para ganar Flujo rápido.

**Soluciones:**

- Rate limiting: Máximo 5 códigos/hora por usuario
- Verificación manual inicial: Primeros 3 códigos de usuarios nuevos requieren aprobación
- Penalización por spam: Si 3+ códigos son reportados como spam → ban temporal + pérdida de Flujo
- Honeypot codes: Códigos trampa que solo bots subirían

// src/middleware/spamDetection.js
export const detectSpamCode = (code) => {
  const spamPatterns = [
    /TEST\d+/i,
    /FAKE\d+/i,
    /^(.)\1{5,}$/, // Mismo carácter repetido
    /^(123|ABC|XXX)/i
  ];

  if (spamPatterns.some(pattern => pattern.test(code.code))) {
    return true;
  }

  // Detectar códigos duplicados con pequeñas variaciones
  const similar = await supabase
    .from('codes')
    .select('code')
    .eq('app_name', code.app_name)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000));

  const levenshteinDistance = (a, b) => { /* ... */ };

  if (similar.some(s => levenshteinDistance(s.code, code.code) < 3)) {
    return true;
  }

  return false;
};

#### 2. Votación Coordinada (Vote Rings)

**Problema:** Grupo de usuarios se votan entre sí para inflar Flujo.

**Soluciones:**

- Análisis de grafos: Detectar clusters de usuarios que solo se votan entre sí
- Weighted votes: Votos de usuarios con mayor diversidad pesan más
- Penalización por reciprocidad excesiva: Si >80% de tus votos son a mismas 5 personas → votos valen menos

// src/services/voteRingDetection.js
export const detectVoteRing = async (userId) => {
  const votes = await supabase
    .from('votes')
    .select('code_id, codes(user_id)')
    .eq('user_id', userId)
    .eq('type', 'up');

  const votedUsers = votes.map(v => v.codes.user_id);
  const voteCounts = votedUsers.reduce((acc, uid) => {
    acc[uid] = (acc[uid] || 0) + 1;
    return acc;
  }, {});

  const topFive = Object.entries(voteCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topFiveVotes = topFive.reduce((sum, [, count]) => sum + count, 0);
  const reciprocityRate = topFiveVotes / votedUsers.length;

  if (reciprocityRate > 0.8) {
    await flagUser(userId, 'vote_ring_suspected');
    return true;
  }

  return false;
};

#### 3. Bots Automatizados

**Problema:** Bots suben códigos scrapeados de otras webs.

**Soluciones:**

- Captcha en acciones críticas
- Análisis de timing: ¿Subes códigos cada exactamente 60s? → Probablemente bot
- Fingerprinting: IP, User-Agent, patrones de click

// src/middleware/botDetection.js
export const detectBot = (userActions) => {
  // 1. Timing analysis
  const timings = userActions.map((a, i) =>
    i > 0 ? a.timestamp - userActions[i-1].timestamp : 0
  ).filter(t => t > 0);

  const avgTiming = timings.reduce((sum, t) => sum + t, 0) / timings.length;
  const variance = timings.reduce((sum, t) =>
    sum + Math.pow(t - avgTiming, 2), 0
  ) / timings.length;

  if (variance < 100 && avgTiming < 2000) {
    return true;
  }

  // 2. User-Agent check
  const botAgents = [/bot/i, /crawler/i, /python/i, /curl/i];
  if (botAgents.some(pattern => pattern.test(userActions[0].userAgent))) {
    return true;
  }

  // 3. Behavioral patterns
  const actionsPerMinute = userActions.length /
    ((Date.now() - userActions[0].timestamp) / 60000);

  if (actionsPerMinute > 10) {
    return true;
  }

  return false;
};

#### 4. Downvote Brigading

**Problema:** Usuarios coordinan downvotes masivos a códigos de un competidor.

**Soluciones:**

- Cooldown entre downvotes: 1 minuto mínimo
- Límite de downvotes diarios: 10 downvotes/día por usuario
- Revisión manual: Si código recibe 5+ downvotes en <1 hora → revisión de moderador

// src/middleware/downvoteLimits.js
const downvoteCooldowns = new Map();

export const checkDownvoteAllowed = (userId) => {
  const now = Date.now();
  const lastDownvote = downvoteCooldowns.get(userId);

  if (lastDownvote && (now - lastDownvote) < 60000) {
    return false;
  }

  downvoteCooldowns.set(userId, now);
  return true;
};

---

## Implementación Técnica

### Base de Datos

#### Tabla de Karma Log (Auditoría Completa)

CREATE TABLE karma_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_code_id UUID REFERENCES codes(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_karma_log_user ON karma_log(user_id, created_at DESC);
CREATE INDEX idx_karma_log_reason ON karma_log(reason);

#### Tabla de Streaks

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

### API Endpoints

#### GET /api/users/:id/stats

// netlify/functions/users/stats.js
export const handler = async (event) => {
  const userId = event.pathParameters.id;

  const user = await supabase
    .from('users')
    .select('karma, level, created_at')
    .eq('id', userId)
    .single();

  const codesSubmitted = await supabase
    .from('codes')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  const verificationsGiven = await supabase
    .from('votes')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  const badges = await supabase
    .from('user_badges')
    .select('badges(name, emoji, description)')
    .eq('user_id', userId);

  const streak = await supabase
    .from('user_streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', userId)
    .single();

  const reputationScore = await calculateReputationScore(userId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      user: {
        karma: user.karma,
        level: user.level,
        reputation_score: reputationScore,
        joined_at: user.created_at
      },
      stats: {
        codes_submitted: codesSubmitted.count,
        verifications_given: verificationsGiven.count,
        current_streak: streak.current_streak,
        longest_streak: streak.longest_streak
      },
      badges: badges.data
    })
  };
};

#### GET /api/leaderboard

// netlify/functions/leaderboard.js
export const handler = async (event) => {
  const period = event.queryStringParameters.period || 'all';

  let query = supabase
    .from('users')
    .select('id, username, karma, level, avatar_url')
    .order('karma', { ascending: false })
    .limit(100);

  if (period === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    query = query.gte('last_active_at', weekAgo.toISOString());
  } else if (period === 'month') {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    query = query.gte('last_active_at', monthAgo.toISOString());
  }

  const { data: users } = await query;

  return {
    statusCode: 200,
    body: JSON.stringify({
      period,
      leaderboard: users.map((u, index) => ({
        rank: index + 1,
        user: u,
        badge: calculateLevel(u.karma).badge
      }))
    })
  };
};

---

## Pruebas A/B y Métricas

### Hipótesis a Testear

#### Experimento 1: Valor de Karma por Verificación

**Hipótesis:** Aumentar de +3 a +5 Flujo por verificación incrementará engagement.

**Variantes:**

- Control (A): +3 Flujo por verificación
- Variante (B): +5 Flujo por verificación

**Métricas:**

- Verificaciones/usuario/día
- Retención 7 días
- Tasa de verificación (¿usuarios verifican más spam?)

**Duración:** 2 semanas

#### Experimento 2: Visualización de Progreso

**Hipótesis:** Mostrar barra de progreso hacia siguiente nivel incrementará actividad.

**Variantes:**

- Control (A): Sin barra de progreso
- Variante (B): Barra de progreso prominente en header

**Métricas:**

- Códigos subidos/usuario/semana
- Tiempo en sitio
- Tasa de conversión a Nivel 2

**Duración:** 3 semanas

#### Experimento 3: Frecuencia de Badges

**Hipótesis:** Más badges frecuentes aumentará motivación.

**Variantes:**

- Control (A): Badges cada 50, 100, 200 códigos
- Variante (B): Badges cada 10, 25, 50, 100, 200 códigos

**Métricas:**

- Códigos subidos/usuario/mes
- Satisfacción (NPS survey)

**Duración:** 4 semanas

### Implementación de A/B Testing

// src/utils/abTesting.js
export const getExperimentVariant = (userId, experimentName) => {
  const hash = simpleHash(userId + experimentName);
  const variant = hash % 2 === 0 ? 'A' : 'B';

  supabase.from('ab_test_assignments').insert({
    user_id: userId,
    experiment_name: experimentName,
    variant: variant,
    assigned_at: new Date().toISOString()
  });

  return variant;
};

const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

### Métricas de Éxito del Sistema de Gamificación

| Métrica | Baseline | Target Mes 1 | Target Mes 3 |
|---------|----------|--------------|--------------|
| Códigos subidos/usuario/mes | - | 3 | 5 |
| Verificaciones/usuario/mes | - | 10 | 20 |
| % usuarios con streak >7 días | - | 15% | 25% |
| Retención 30 días | - | 30% | 45% |
| Usuarios Nivel 3+ | - | 5% | 15% |
| NPS (Net Promoter Score) | - | 40 | 60 |

---

## Referencias y Recursos

### Inspiración de Diseño Ético

1. **Russell T Davies - Years and Years (2019)**
   - Crítica al sistema de crédito social
   - Análisis de vigilancia tecnológica

2. **Black Mirror: Nosedive (3x01)**
   - Distopía de gamificación social
   - Lecciones sobre autenticidad vs optimización

3. **Stack Overflow Reputation System**
   - Sistema de reputación técnica verificable
   - Balance entre contribución y calidad

4. **Wikipedia Contribution Model**
   - Medición de impacto comunitario
   - Transparencia en proceso editorial

### Papers Académicos

- Deterding, S. et al. (2011). "From Game Design Elements to Gamefulness"
- Hamari, J. (2017). "Do Badges Increase User Activity?"
- Zichermann, G. & Cunningham, C. (2011). "Gamification by Design"

---

## Conclusión

El sistema de Flujo de VerificaCodigos es un sistema de reputación ético que:

1. ✅ Mide trabajo real y verificable
2. ✅ Es completamente transparente (reglas públicas)
3. ✅ No afecta tu vida real (solo dentro de la plataforma)
4. ✅ No penaliza asociación (no pierdes puntos por tus amigos)
5. ✅ Permite recuperación (siempre puedes subir nuevos códigos)
6. ✅ Es resistente a abuso (rate limits, detección de spam, análisis de patrones)

**No es un juego de popularidad. Es un sistema de reconocimiento por contribución real.**

Flujo es una forma de decir "gracias" a quienes hacen el trabajo que hace que la comunidad funcione.

---

**Nota técnica:** En la base de datos, el campo se llama `karma` (convención técnica estándar), pero el nombre público del sistema es **Flujo**.
$$
