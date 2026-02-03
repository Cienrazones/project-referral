// utils/security.js
// Sistema de seguridad completo para VerificaCodigos
// Versión: 2.0.0 | Fecha: 31 Enero 2026

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================
// CACHE DE MENSAJES HTTP
// ============================================

let httpMessagesCache = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Carga mensajes HTTP desde base de datos con cache
 */
async function loadHttpMessages() {
  if (httpMessagesCache && Date.now() - cachedAt < CACHE_TTL) {
    return httpMessagesCache;
  }

  try {
    const { data } = await supabase.from('http_error_messages').select('*');
    httpMessagesCache = data?.reduce((acc, msg) => {
      acc[msg.status_code] = msg;
      return acc;
    }, {}) || {};
    cachedAt = Date.now();
    return httpMessagesCache;
  } catch (error) {
    console.error('Error cargando mensajes HTTP:', error);
    return {};
  }
}

// ============================================
// RATE LIMITING EN MEMORIA
// ============================================

const rateLimitMap = new Map();
const CLEANUP_INTERVAL = 60000; // Limpiar cada minuto

// Cleanup automático de entradas expiradas
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Verifica rate limit para un identificador
 * @param {string} identifier - IP o user_id
 * @param {number} limit - Número máximo de requests
 * @param {number} windowMs - Ventana de tiempo en ms
 * @returns {Object} { allowed, remaining, retryAfter }
 */
function checkRateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: null };
  }

  const record = rateLimitMap.get(key);

  // Ventana expiró, resetear
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { allowed: true, remaining: limit - 1, retryAfter: null };
  }

  // Límite alcanzado
  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Incrementar contador
  record.count++;
  return { allowed: true, remaining: limit - record.count, retryAfter: null };
}

// ============================================
// IP BLOCKING
// ============================================

/**
 * Verifica si una IP está bloqueada
 * @param {string} ipAddress - Dirección IP
 * @returns {boolean}
 */
async function isIpBlocked(ipAddress) {
  try {
    const { data } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .or('expires_at.is.null,expires_at.gt.now()')
      .single();
    return !!data;
  } catch {
    return false;
  }
}

// ============================================
// HONEYPOT ANTI-BOTS
// ============================================

/**
 * Verifica campo honeypot y registra intentos
 * @param {Object} body - Request body
 * @param {string} ipAddress - IP del cliente
 * @param {string} userAgent - User agent
 * @returns {boolean} true si es bot
 */
async function checkHoneypot(body, ipAddress, userAgent) {
  if (body && body._hp_field && body._hp_field !== '') {
    try {
      // Registrar intento
      await supabase.from('honeypot_log').insert({
        ip_address: ipAddress,
        user_agent: userAgent,
        honeypot_field: '_hp_field'
      });

      // Contar intentos en últimas 24h
      const { data: logs } = await supabase
        .from('honeypot_log')
        .select('id', { count: 'exact' })
        .eq('ip_address', ipAddress)
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Si >= 3 intentos, bloquear IP por 7 días
      if (logs && logs.length >= 3) {
        await supabase.from('blocked_ips').upsert({
          ip_address: ipAddress,
          reason: 'Múltiples intentos honeypot',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      return true; // Es bot
    } catch (error) {
      console.error('Error en honeypot:', error);
      return false;
    }
  }
  return false; // No es bot
}

// ============================================
// CSRF PROTECTION
// ============================================

/**
 * Valida token CSRF contra base de datos
 * @param {string} token - Token CSRF
 * @param {string} userId - UUID del usuario
 * @param {string} action - Acción específica
 * @returns {boolean}
 */
async function validateCsrfToken(token, userId, action) {
  try {
    const { data } = await supabase.rpc('validate_csrf_token', {
      p_token: token,
      p_user_id: userId,
      p_action: action
    });
    return !!data;
  } catch (error) {
    console.error('Error validando CSRF:', error);
    return false;
  }
}

// ============================================
// SANITIZACIÓN XSS
// ============================================

/**
 * Sanitiza input de string contra XSS
 * @param {string} input - String a sanitizar
 * @returns {string}
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitiza objetos recursivamente
 * @param {any} obj - Objeto a sanitizar
 * @returns {any}
 */
function deepSanitize(obj) {
  if (typeof obj === 'string') return sanitizeInput(obj);
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = deepSanitize(value);
    }
    return sanitized;
  }
  return obj;
}

// ============================================
// ERROR RESPONSES (Mensajes Quijote)
// ============================================

/**
 * Crea respuesta de error con mensajes personalizados
 * @param {number} statusCode - Código HTTP
 * @param {Object} additionalInfo - Info adicional
 * @returns {Object} Response object
 */
async function createErrorResponse(statusCode, additionalInfo = {}) {
  const messages = await loadHttpMessages();
  const msg = messages[statusCode] || {
    title: 'Error',
    message: 'Ha ocurrido un error inesperado.',
    emoji: '❌',
    style: 'generic'
  };

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Error-Style': msg.style || 'generic'
    },
    body: JSON.stringify({
      error: {
        status: statusCode,
        title: msg.title,
        message: msg.message,
        technical_detail: msg.technical_detail,
        emoji: msg.emoji,
        timestamp: new Date().toISOString(),
        ...additionalInfo
      }
    })
  };
}

// ============================================
// WRAPPER PRINCIPAL withSecurity()
// ============================================

/**
 * Middleware de seguridad que envuelve funciones Netlify
 * @param {Function} handler - Handler original
 * @param {Object} options - Opciones de seguridad
 * @returns {Function} Handler con seguridad
 */
export function withSecurity(handler, options = {}) {
  return async (event, context) => {
    const {
      requireAuth = false,
      rateLimit = { limit: 10, window: 60000 },
      checkCsrf = false,
      csrfAction = 'default',
      allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
      sanitizeBody = true
    } = options;

    try {
      // ========================================
      // 1. VALIDAR MÉTODO HTTP
      // ========================================
      if (!allowedMethods.includes(event.httpMethod)) {
        return await createErrorResponse(405, { allowed_methods: allowedMethods });
      }

      // ========================================
      // 2. OBTENER IP (Netlify/Cloudflare)
      // ========================================
      const ipAddress =
        event.headers['x-nf-client-connection-ip'] ||
        event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        'unknown';

      // ========================================
      // 3. VERIFICAR IP BLOQUEADA
      // ========================================
      if (await isIpBlocked(ipAddress)) {
        return await createErrorResponse(403, { reason: 'IP bloqueada' });
      }

      // ========================================
      // 4. RATE LIMITING
      // ========================================
      const rateLimitKey = `${ipAddress}:${event.path || 'default'}`;
      const rateLimitResult = checkRateLimit(rateLimitKey, rateLimit.limit, rateLimit.window);

      if (!rateLimitResult.allowed) {
        const errorResponse = await createErrorResponse(429, {
          retry_after: rateLimitResult.retryAfter
        });
        return {
          ...errorResponse,
          headers: {
            ...errorResponse.headers,
            'Retry-After': rateLimitResult.retryAfter,
            'X-RateLimit-Limit': rateLimit.limit,
            'X-RateLimit-Remaining': 0
          }
        };
      }

      // ========================================
      // 5. PARSEAR BODY
      // ========================================
      let body = {};
      if (['POST', 'PUT', 'PATCH'].includes(event.httpMethod) && event.body) {
        try {
          body = JSON.parse(event.body);
        } catch (error) {
          return await createErrorResponse(400, { error: 'JSON inválido' });
        }
      }

      // ========================================
      // 6. HONEYPOT (Detectar bots)
      // ========================================
      if (['POST', 'PUT'].includes(event.httpMethod)) {
        const isBot = await checkHoneypot(body, ipAddress, event.headers['user-agent']);
        if (isBot) {
          return await createErrorResponse(418); // I'm a teapot 🫖
        }
      }

      // ========================================
      // 7. AUTENTICACIÓN (Supabase Auth)
      // ========================================
      if (requireAuth) {
        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return await createErrorResponse(401);
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          return await createErrorResponse(401);
        }

        event.user = user; // Inyectar usuario en evento
      }

      // ========================================
      // 8. CSRF VALIDATION
      // ========================================
      if (checkCsrf && requireAuth) {
        const csrfToken = body._csrf || event.headers['x-csrf-token'];
        if (!csrfToken) {
          return await createErrorResponse(403, { reason: 'CSRF token faltante' });
        }

        const isValid = await validateCsrfToken(csrfToken, event.user.id, csrfAction);
        if (!isValid) {
          return await createErrorResponse(403, { reason: 'CSRF token inválido' });
        }
      }

      // ========================================
      // 9. SANITIZAR INPUT (XSS Protection)
      // ========================================
      if (sanitizeBody && Object.keys(body).length > 0) {
        body = deepSanitize(body);
      }

      // ========================================
      // 10. EJECUTAR HANDLER ORIGINAL
      // ========================================
      event.body = JSON.stringify(body);
      event.ip = ipAddress;
      event.rateLimit = {
        remaining: rateLimitResult.remaining,
        limit: rateLimit.limit
      };

      const response = await handler(event, context);

      // ========================================
      // 11. AÑADIR HEADERS DE SEGURIDAD
      // ========================================
      return {
        ...response,
        headers: {
          ...response.headers,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Strict-Transport-Security': 'max-age=31536000',
          'X-RateLimit-Limit': rateLimit.limit,
          'X-RateLimit-Remaining': rateLimitResult.remaining
        }
      };
    } catch (error) {
      console.error('Security middleware error:', error);
      return await createErrorResponse(500, {
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
}

// ============================================
// EXPORTS
// ============================================

export {
  // Rate limiting
  checkRateLimit,
  
  // IP blocking
  isIpBlocked,
  
  // Honeypot
  checkHoneypot,
  
  // CSRF
  validateCsrfToken,
  
  // Sanitización
  sanitizeInput,
  deepSanitize,
  
  // Error handling
  createErrorResponse,
  loadHttpMessages
};
