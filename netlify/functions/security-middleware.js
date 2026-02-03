// netlify/functions/security-middleware.js
// Middleware de seguridad para Netlify Functions
// Integra rate limiting, CSRF, IP blocking, honeypot, sanitización y mensajes HTTP Quijote

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ============= CACHE DE CONFIGURACIÓN =============

let httpMessagesCache = null;
let allowedDomainsCache = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function loadHttpMessages() {
  if (httpMessagesCache && Date.now() - cachedAt < CACHE_TTL) {
    return httpMessagesCache;
  }

  try {
    const { data } = await supabase.from("http_error_messages").select("*");

    httpMessagesCache =
      data?.reduce((acc, msg) => {
        acc[msg.status_code] = msg;
        return acc;
      }, {}) || {};

    cachedAt = Date.now();
    return httpMessagesCache;
  } catch (error) {
    console.error("Error cargando mensajes HTTP:", error);
    return {};
  }
}

// ============= RATE LIMITING EN MEMORIA =============

const rateLimitMap = new Map();
const CLEANUP_INTERVAL = 60000; // Limpiar cada minuto

// Iniciar limpeza periódica
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

function checkRateLimit(identifier, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: null };
  }

  const record = rateLimitMap.get(key);

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { allowed: true, remaining: limit - 1, retryAfter: null };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, retryAfter: null };
}

// ============= VERIFICACIÓN DE IPS BLOQUEADAS =============

async function isIpBlocked(ipAddress) {
  try {
    const { data } = await supabase
      .from("blocked_ips")
      .select("*")
      .eq("ip_address", ipAddress)
      .or("expires_at.is.null,expires_at.gt.now()")
      .single();

    return !!data;
  } catch (error) {
    // No encontrado = no bloqueado
    return false;
  }
}

// ============= DETECCIÓN DE HONEYPOT =============

async function checkHoneypot(body, ipAddress, userAgent) {
  // Campo honeypot común: "_hp_field" (debe estar vacío)
  if (body && body._hp_field && body._hp_field !== "") {
    try {
      // Loguear intento
      await supabase.from("honeypot_log").insert({
        ip_address: ipAddress,
        user_agent: userAgent,
        honeypot_field: "_hp_field",
      });

      // Contar intentos en últimas 24 horas
      const { data: logs } = await supabase
        .from("honeypot_log")
        .select("id", { count: "exact" })
        .eq("ip_address", ipAddress)
        .gte(
          "detected_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        );

      if (logs && logs.length >= 3) {
        // Bloquear IP
        await supabase.from("blocked_ips").upsert(
          {
            ip_address: ipAddress,
            reason: "Múltiples intentos honeypot detectados",
            attempts_count: logs.length,
            expires_at: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
          { onConflict: "ip_address" },
        );
      }

      return true; // Es bot
    } catch (error) {
      console.error("Error en honeypot check:", error);
      return false;
    }
  }

  return false;
}

// ============= VALIDACIÓN DE CSRF =============

async function validateCsrfToken(token, userId, action) {
  try {
    const { data } = await supabase.rpc("validate_csrf_token", {
      p_token: token,
      p_user_id: userId,
      p_action: action,
    });

    return !!data;
  } catch (error) {
    console.error("Error validando CSRF token:", error);
    return false;
  }
}

// ============= SANITIZACIÓN XSS =============

function sanitizeInput(input) {
  if (typeof input !== "string") return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function deepSanitize(obj) {
  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }
  if (obj !== null && typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = deepSanitize(value);
    }
    return sanitized;
  }
  return obj;
}

// ============= GENERACIÓN DE RESPUESTAS DE ERROR =============

async function createErrorResponse(statusCode, additionalInfo = {}) {
  const messages = await loadHttpMessages();
  const msg = messages[statusCode] || {
    title: "Error",
    message: "Ha ocurrido un error inesperado.",
    emoji: "❌",
    technical_detail: "Error desconocido",
    style: "generic",
  };

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "X-Error-Style": msg.style || "generic",
    },
    body: JSON.stringify({
      error: {
        status: statusCode,
        title: msg.title,
        message: msg.message,
        technical_detail: msg.technical_detail,
        emoji: msg.emoji,
        timestamp: new Date().toISOString(),
        ...additionalInfo,
      },
    }),
  };
}

// ============= WRAPPER PRINCIPAL CON SEGURIDAD =============

export function withSecurity(handler, options = {}) {
  return async (event, context) => {
    const {
      requireAuth = false,
      rateLimit = { limit: 10, window: 60000 },
      checkCsrf = false,
      csrfAction = "default",
      allowedMethods = ["GET", "POST", "PUT", "DELETE"],
      sanitizeBody = true,
    } = options;

    try {
      // 1. VALIDAR MÉTODO HTTP
      if (!allowedMethods.includes(event.httpMethod)) {
        return await createErrorResponse(405, {
          allowed_methods: allowedMethods,
          message_es: "Método HTTP no permitido",
        });
      }

      // 2. OBTENER IP DEL CLIENTE
      const ipAddress =
        event.headers["x-nf-client-connection-ip"] ||
        event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        event.headers["cf-connecting-ip"] ||
        "unknown";

      // 3. VERIFICAR IP BLOQUEADA
      if (await isIpBlocked(ipAddress)) {
        return await createErrorResponse(403, {
          reason: "IP bloqueada por actividad sospechosa",
          contact: "support@verificacodigos.com",
        });
      }

      // 4. RATE LIMITING
      const rateLimitKey = `${ipAddress}:${event.path || "default"}`;
      const rateLimitResult = checkRateLimit(
        rateLimitKey,
        rateLimit.limit,
        rateLimit.window,
      );

      if (!rateLimitResult.allowed) {
        const errorResponse = await createErrorResponse(429, {
          retry_after: rateLimitResult.retryAfter,
          rate_limit: {
            limit: rateLimit.limit,
            window_seconds: rateLimit.window / 1000,
            remaining: 0,
          },
        });

        return {
          ...errorResponse,
          headers: {
            ...errorResponse.headers,
            "Retry-After": rateLimitResult.retryAfter,
            "X-RateLimit-Limit": rateLimit.limit,
            "X-RateLimit-Remaining": 0,
            "X-RateLimit-Reset": Math.ceil(
              (Date.now() + rateLimitResult.retryAfter * 1000) / 1000,
            ),
          },
        };
      }

      // 5. PARSEAR BODY
      let body = {};
      if (["POST", "PUT", "PATCH"].includes(event.httpMethod) && event.body) {
        try {
          body = JSON.parse(event.body);
        } catch (error) {
          return await createErrorResponse(400, {
            message_es: "Body JSON inválido",
            error: error.message,
          });
        }
      }

      // 6. VERIFICAR HONEYPOT
      if (["POST", "PUT"].includes(event.httpMethod)) {
        const isBot = await checkHoneypot(
          body,
          ipAddress,
          event.headers["user-agent"],
        );
        if (isBot) {
          return await createErrorResponse(418, {
            message_es: "Actividad sospechosa detectada",
          });
        }
      }

      // 7. VERIFICAR AUTENTICACIÓN
      if (requireAuth) {
        const token = event.headers.authorization?.replace("Bearer ", "");
        if (!token) {
          return await createErrorResponse(401, {
            message_es: "Token de autenticación requerido",
          });
        }

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);
        if (error || !user) {
          return await createErrorResponse(401, {
            message_es: "Token inválido o expirado",
          });
        }

        event.user = user;
      }

      // 8. VERIFICAR CSRF
      if (checkCsrf && requireAuth) {
        const csrfToken = body._csrf || event.headers["x-csrf-token"];

        if (!csrfToken) {
          return await createErrorResponse(403, {
            reason: "CSRF token faltante",
            message_es: "Token de seguridad requerido",
          });
        }

        const isValid = await validateCsrfToken(
          csrfToken,
          event.user.id,
          csrfAction,
        );
        if (!isValid) {
          return await createErrorResponse(403, {
            reason: "CSRF token inválido o expirado",
            message_es: "Token de seguridad rechazado",
          });
        }
      }

      // 9. SANITIZAR BODY
      if (sanitizeBody && Object.keys(body).length > 0) {
        body = deepSanitize(body);
      }

      // 10. EJECUTAR HANDLER
      event.body = JSON.stringify(body); // Actualizar body sanitizado
      event.ip = ipAddress; // Disponible para el handler
      event.rateLimit = {
        remaining: rateLimitResult.remaining,
        limit: rateLimit.limit,
        reset: Math.ceil((Date.now() + rateLimit.window) / 1000),
      };

      const response = await handler(event, context);

      // 11. AÑADIR HEADERS DE SEGURIDAD
      return {
        ...response,
        headers: {
          ...response.headers,
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
          "X-RateLimit-Limit": rateLimit.limit,
          "X-RateLimit-Remaining": rateLimitResult.remaining,
          "X-RateLimit-Reset": Math.ceil(
            (Date.now() + rateLimit.window) / 1000,
          ),
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      };
    } catch (error) {
      console.error("Security middleware error:", error);
      return await createErrorResponse(500, {
        message_es: "Error interno del servidor",
        debug:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
}

// ============= EXPORTAR FUNCIONES ÚTILES =============

export {
  checkRateLimit,
  isIpBlocked,
  checkHoneypot,
  validateCsrfToken,
  sanitizeInput,
  deepSanitize,
  createErrorResponse,
  loadHttpMessages,
};
