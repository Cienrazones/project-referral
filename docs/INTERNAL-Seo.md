# 📊 SEO.md - Estrategia SEO Completa

> Documentación de estrategia SEO técnico y de contenido para VerificaCodigos.com  
> **Objetivo:** Posicionar en Top 3 para búsquedas de códigos de descuento en España  
> **Stack:** Schema.org JSON-LD, Sitemap dinámico, Google Search Console API

---

## 📋 Índice

1. [Visión General SEO](#visión-general-seo)
2. [Arquitectura de URLs](#arquitectura-de-urls)
3. [Meta Tags y Open Graph](#meta-tags-y-open-graph)
4. [Structured Data (JSON-LD)](#structured-data-json-ld)
5. [Sitemap Dinámico](#sitemap-dinámico)
6. [Robots.txt Estratégico](#robotstxt-estratégico)
7. [Estrategia de Palabras Clave](#estrategia-de-palabras-clave)
8. [Content Strategy](#content-strategy)
9. [Enlaces Internos](#enlaces-internos)
10. [Core Web Vitals](#core-web-vitals)
11. [Indexación Rápida](#indexación-rápida)
12. [Analytics y Tracking](#analytics-y-tracking)
13. [Link Building](#link-building)
14. [SEO Local (España)](#seo-local-españa)
15. [Métricas de Éxito](#métricas-de-éxito)

---

## 1. Visión General SEO

### Objetivo Principal

Posicionar **VerificaCodigos.com** como la plataforma #1 de códigos de descuento verificados en España.

### Ventaja Competitiva SEO

A diferencia de sitios tradicionales de cupones (CupónDescuento, Picodi, etc.), nuestro contenido es:

1. **Verificado en tiempo real** → Señal de frescura para Google
2. **Generado por usuarios** → Contenido único (no scrapeado)
3. **Actualizado constantemente** → Crawl budget optimizado
4. **Con datos estructurados ricos** → Rich snippets garantizados
5. **Gamificación (Flujo)** → Mayor engagement = menor bounce rate

### Estrategia de 3 Fases

**Fase 1: Fundación (Mes 1-2)**

- Arquitectura técnica impecable (Core Web Vitals, mobile-first)
- Structured data completo (Organization, Offer, BreadcrumbList)
- Sitemap dinámico funcional
- 50 códigos seed de marcas top

**Fase 2: Crecimiento (Mes 3-6)**

- Posicionamiento para long-tail keywords ("código descuento revolut 2026")
- Link building estratégico (partnerships con blogs de finanzas)
- Contenido evergreen (guías de ahorro por categoría)
- Rich snippets en 80%+ de páginas

**Fase 3: Dominio (Mes 7-12)**

- Top 3 posiciones para keywords principales
- Featured snippets ("¿cómo funcionan los códigos de descuento?")
- Brand recognition ("verificacodigos netflix", "verificacodigos amazon")
- Autoridad de dominio (DA 40+)

---

## 2. Arquitectura de URLs

### Estructura Jerárquica Clara

```
verificacodigos.com/
├── /                              # Homepage
├── /categoria/fintech             # Página de categoría
├── /categoria/streaming           # Otra categoría
├── /codigo/revolut-20-euros       # Código individual
├── /codigo/netflix-mes-gratis     # Otro código
├── /marca/revolut                 # Agregador de marca
├── /marca/netflix                 # Otra marca
├── /ranking                       # Ranking usuarios por Flujo
├── /como-funciona                 # Contenido informativo
├── /guia/ahorrar-fintech          # Guías SEO
└── /blog/mejores-neobancos-2026   # Blog posts
```

### Reglas de URLs

1. **Siempre lowercase**: `/categoria/fintech` (no `/Categoria/Fintech`)
2. **Guiones, no guiones bajos**: `revolut-20-euros` (no `revolut_20_euros`)
3. **Sin extensiones**: `/codigo/revolut` (no `/codigo.html` ni `/codigo.php`)
4. **Keywords en URL**: `/codigo/revolut-20-euros-gratis` incluye keywords naturales
5. **Máximo 3 niveles de profundidad**: `/categoria/fintech/revolut` ✓ (no `/categoria/fintech/bancos/digitales/revolut` ✗)

### Canonicalización

Casos especiales:

- **Paginación**: `/categoria/fintech?page=2` → canonical apunta a `/categoria/fintech`
- **Parámetros de filtro**: `/categoria/fintech?sort=recent` → canonical apunta a `/categoria/fintech`
- **Contenido duplicado**: Si código existe en múltiples categorías, canonical apunta a URL original

### Redirects

```toml
# netlify.toml
[[redirects]]
  from = "/cupones/*"
  to = "/categoria/:splat"
  status = 301
  force = true

[[redirects]]
  from = "/codigo/:slug/edit"
  to = "/codigo/:slug"
  status = 301
  conditions = {Role = ["!admin"]}
```

---

## 3. Meta Tags y Open Graph

### Template de Homepage

```html
<title>
  VerificaCodigos - Códigos de Descuento Verificados por Usuarios Reales
</title>
<meta
  name="description"
  content="Los mejores códigos de descuento de Revolut, Netflix, Amazon y más. Verificados por +15,000 usuarios cada día. No más códigos caducados."
/>
<meta
  name="keywords"
  content="códigos descuento, cupones verificados, descuentos online, códigos promocionales"
/>

<!-- Open Graph -->
<meta
  property="og:title"
  content="VerificaCodigos - Códigos Verificados por Usuarios"
/>
<meta
  property="og:description"
  content="Códigos de descuento verificados en tiempo real. +15,000 usuarios. Sin códigos caducados."
/>
<meta
  property="og:image"
  content="https://verificacodigos.com/og-image-home.png"
/>
<meta property="og:url" content="https://verificacodigos.com" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="VerificaCodigos - Códigos Verificados" />
<meta
  name="twitter:description"
  content="Códigos de descuento verificados en tiempo real por la comunidad."
/>
<meta
  name="twitter:image"
  content="https://verificacodigos.com/og-image-home.png"
/>
```

### Template de Página de Código Individual

```html
<title>Revolut - 20€ Gratis al Abrir Cuenta | VerificaCodigos</title>
<meta
  name="description"
  content="✓ Código verificado hace 2h ✓ 156 personas lo usaron ✓ Válido hasta 28/02/2026. Consigue 20€ gratis en Revolut."
/>

<!-- Open Graph -->
<meta property="og:title" content="Revolut: 20€ Gratis - Código Verificado" />
<meta
  property="og:description"
  content="Código verificado hace 2 horas. 156 usuarios confirmaron que funciona. Válido hasta 28/02/2026."
/>
<meta
  property="og:image"
  content="https://verificacodigos.com/og-revolut.png"
/>
<meta
  property="og:url"
  content="https://verificacodigos.com/codigo/revolut-20-euros"
/>
<meta property="og:type" content="article" />
```

### Template de Página de Categoría

```html
<title>Códigos de Descuento Fintech y Neobancos 2026 | VerificaCodigos</title>
<meta
  name="description"
  content="Códigos de descuento verificados para Revolut, N26, Wise, Vivid y más. Actualizados cada hora. 156 códigos activos."
/>

<!-- Open Graph -->
<meta property="og:title" content="Códigos Fintech 2026 - Verificados" />
<meta
  property="og:description"
  content="156 códigos activos de neobancos verificados por usuarios. Revolut, N26, Wise, Vivid."
/>
<meta
  property="og:image"
  content="https://verificacodigos.com/og-category-fintech.png"
/>
<meta
  property="og:url"
  content="https://verificacodigos.com/categoria/fintech"
/>
```

### Generación Dinámica de Meta Tags

```javascript
// src/utils/metaTags.js
export const generateMetaTags = (page, data) => {
  const templates = {
    homepage: {
      title:
        "VerificaCodigos - Códigos de Descuento Verificados por Usuarios Reales",
      description:
        "Los mejores códigos de descuento de Revolut, Netflix, Amazon y más. Verificados por +15,000 usuarios cada día. No más códigos caducados.",
      ogImage: "/og-image-home.png",
    },

    code: {
      title: `${data.app_name} - ${data.description} | VerificaCodigos`,
      description: `✓ Código verificado hace ${data.lastVerifiedHours}h ✓ ${data.verified_count} personas lo usaron ✓ ${data.description}. ${data.expires_at ? `Válido hasta ${formatDate(data.expires_at)}` : "Sin fecha de caducidad"}.`,
      ogImage: `/og-${slugify(data.app_name)}.png`,
    },

    category: {
      title: `Códigos de Descuento ${data.category_name} 2026 | VerificaCodigos`,
      description: `Códigos de descuento verificados para ${data.topBrands.join(", ")}. Actualizados cada hora. ${data.activeCodesCount} códigos activos.`,
      ogImage: `/og-category-${data.slug}.png`,
    },
  };

  const template = templates[page];

  return {
    title: template.title,
    description: truncate(template.description, 160), // Máximo 160 caracteres
    keywords: generateKeywords(page, data),
    canonical: `https://verificacodigos.com${data.path}`,
    ogImage: `https://verificacodigos.com${template.ogImage}`,
  };
};

const generateKeywords = (page, data) => {
  if (page === "code") {
    return [
      `código ${data.app_name.toLowerCase()}`,
      `${data.app_name.toLowerCase()} descuento`,
      `${data.app_name.toLowerCase()} promo`,
      `código promocional ${data.app_name.toLowerCase()} 2026`,
    ].join(", ");
  }
  // ... más casos
};
```

---

## 4. Structured Data (JSON-LD)

### Schema.org para Homepage (Organization)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VerificaCodigos",
  "url": "https://verificacodigos.com",
  "logo": "https://verificacodigos.com/logo.png",
  "description": "Plataforma comunitaria de códigos de descuento verificados por usuarios reales",
  "sameAs": [
    "https://twitter.com/verificacodigos",
    "https://instagram.com/verificacodigos"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@verificacodigos.com"
  }
}
```

### Schema.org para Código Individual (Offer)

```json
{
  "@context": "https://schema.org",
  "@type": "Offer",
  "name": "Revolut - 20€ Gratis al Abrir Cuenta",
  "description": "Consigue 20€ gratis al abrir tu cuenta Revolut y realizar tu primera transacción",
  "url": "https://verificacodigos.com/codigo/revolut-20-euros",
  "priceSpecification": {
    "@type": "PriceSpecification",
    "price": "20",
    "priceCurrency": "EUR"
  },
  "validFrom": "2026-01-15T00:00:00Z",
  "validThrough": "2026-03-30T23:59:59Z",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": 156,
    "bestRating": "5",
    "worstRating": "1"
  },
  "seller": {
    "@type": "Organization",
    "name": "Revolut"
  }
}
```

### BreadcrumbList (Migas de Pan)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Inicio",
      "item": "https://verificacodigos.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Fintech",
      "item": "https://verificacodigos.com/categoria/fintech"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Revolut 20€",
      "item": "https://verificacodigos.com/codigo/revolut-20-euros"
    }
  ]
}
```

### FAQPage (Preguntas Frecuentes)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Cómo funcionan los códigos verificados?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los usuarios de VerificaCodigos votan cada código indicando si funciona o no. Los códigos con +70% de votos positivos se marcan como verificados."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué es el sistema de Flujo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Flujo es nuestro sistema de puntos: ganas +10 por subir un código, +5 cuando alguien lo verifica, y +3 por verificar códigos de otros usuarios."
      }
    }
  ]
}
```

### WebSite (Buscador en SERPs)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://verificacodigos.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://verificacodigos.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### ItemList (Lista de Códigos en Categoría)

```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://verificacodigos.com/codigo/revolut-20-euros"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "url": "https://verificacodigos.com/codigo/n26-15-euros"
    }
  ]
}
```

### Generación Dinámica de JSON-LD

```javascript
// netlify/functions/codes/:id.js
export const handler = async (event) => {
  const codeId = event.pathParameters.id;

  const code = await supabase
    .from("codes")
    .select(`*, categories(name, slug), users(username)`)
    .eq("id", codeId)
    .single();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: `${code.app_name} - ${code.description}`,
    description: code.description,
    url: `https://verificacodigos.com/codigo/${code.slug}`,
    priceSpecification: {
      "@type": "PriceSpecification",
      price: code.discount_value.toString(),
      priceCurrency: "EUR",
    },
    validFrom: code.created_at,
    validThrough: code.expires_at || undefined,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: calculateRating(code),
      reviewCount: code.verified_count,
    },
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonLd),
  };
};

const calculateRating = (code) => {
  const total = code.verified_count + code.downvote_count;
  if (total === 0) return 5; // Default para códigos nuevos
  return ((code.verified_count / total) * 5).toFixed(1);
};
```

---

## 5. Sitemap Dinámico

### Generación con Netlify Function

```javascript
// netlify/functions/sitemap.js
import { createClient } from "@supabase/supabase-js";

export const handler = async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Fetch todos los códigos activos
  const { data: codes } = await supabase
    .from("codes")
    .select("slug, updated_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  // Fetch categorías
  const { data: categories } = await supabase.from("categories").select("slug");

  // Generar XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://verificacodigos.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Categorías -->
  ${categories
    .map(
      (cat) => `
  <url>
    <loc>https://verificacodigos.com/categoria/${cat.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`,
    )
    .join("")}
  
  <!-- Códigos individuales -->
  ${codes
    .map(
      (code) => `
  <url>
    <loc>https://verificacodigos.com/codigo/${code.slug}</loc>
    <lastmod>${code.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join("")}
  
  <!-- Páginas estáticas -->
  <url>
    <loc>https://verificacodigos.com/ranking</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://verificacodigos.com/como-funciona</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600", // Cache 1 hora
    },
    body: sitemap,
  };
};
```

### Cron Job para Regeneración Automática

```toml
# netlify.toml
[[plugins]]
  package = "@netlify/plugin-scheduled-functions"

  [plugins.inputs]
    # Regenerar sitemap cada 6 horas
    schedule = "0 */6 * * *"
```

```javascript
// netlify/functions/sitemap-cron.js
export const handler = async () => {
  // Llamar a función sitemap.js
  const response = await fetch(
    "https://verificacodigos.com/.netlify/functions/sitemap",
  );
  const sitemap = await response.text();

  // Guardar en Supabase Storage (opcional, para histórico)
  await supabase.storage
    .from("sitemaps")
    .upload(`sitemap-${Date.now()}.xml`, sitemap, {
      contentType: "application/xml",
    });

  // Notificar a Google
  await fetch(
    `https://www.google.com/ping?sitemap=${encodeURIComponent("https://verificacodigos.com/sitemap.xml")}`,
  );

  return { statusCode: 200, body: "Sitemap regenerated" };
};
```

---

## 6. Robots.txt Estratégico

```txt
# public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /perfil/edit
Disallow: /*?sort=
Disallow: /*?page=

# Sitemap
Sitemap: https://verificacodigos.com/sitemap.xml

# Googlebot específico
User-agent: Googlebot
Crawl-delay: 1

# Bingbot
User-agent: Bingbot
Crawl-delay: 2

# Bloquear scrapers malintencionados
User-agent: AhrefsBot
User-agent: SemrushBot
User-agent: DotBot
Disallow: /
```

---

## 7. Estrategia de Palabras Clave

### Keywords Principales (Head Terms)

| Keyword               | Volumen/mes | Dificultad | Intención     | Prioridad |
| --------------------- | ----------- | ---------- | ------------- | --------- |
| códigos descuento     | 22,000      | Alta       | Transaccional | Alta      |
| cupones descuento     | 18,000      | Alta       | Transaccional | Alta      |
| códigos promocionales | 12,000      | Media      | Transaccional | Alta      |
| descuentos online     | 9,000       | Media      | Navegacional  | Media     |

### Keywords Long-Tail (Money Keywords)

| Keyword                        | Volumen/mes | Dificultad | Intención     | Prioridad |
| ------------------------------ | ----------- | ---------- | ------------- | --------- |
| código descuento revolut       | 1,200       | Baja       | Transaccional | Alta      |
| código promocional netflix     | 890         | Baja       | Transaccional | Alta      |
| cupón descuento amazon 2026    | 750         | Baja       | Transaccional | Alta      |
| código n26 15 euros            | 420         | Muy baja   | Transaccional | Media     |
| descuento glovo primera compra | 360         | Muy baja   | Transaccional | Media     |

### Keywords Informacionales

| Keyword                       | Volumen/mes | Dificultad | Intención     | Prioridad |
| ----------------------------- | ----------- | ---------- | ------------- | --------- |
| cómo ahorrar dinero online    | 3,200       | Media      | Informacional | Media     |
| qué es un código de descuento | 1,800       | Baja       | Informacional | Media     |
| mejores neobancos españa      | 1,400       | Media      | Comparativa   | Alta      |
| trucos para ahorrar online    | 980         | Baja       | Informacional | Media     |

---

## 8. Content Strategy

### 1. Páginas de Código (Transaccionales)

**Template:**

- **Título**: `[Marca] - [Descuento] | Código Verificado [Año]`
- **H1**: `[Marca]: [Descuento]`
- **H2**: Cómo usar este código
- **H2**: ¿Qué incluye este código?
- **H2**: Requisitos y condiciones
- **H2**: Códigos relacionados de [Marca]

**Ejemplo:**

```markdown
# Revolut: 20€ Gratis al Abrir Cuenta

✓ Verificado hace 2 horas  
✓ 156 personas lo usaron hoy  
✓ Válido hasta: 28/02/2026

**Código:** `REFAMIGO20`

[Botón: Copiar Código]

## Cómo usar este código

1. Abre tu cuenta Revolut usando este enlace
2. Completa verificación de identidad
3. Añade dinero a tu cuenta (mínimo 10€)
4. Realiza una transacción de al menos 5€
5. Recibirás 20€ en tu cuenta en 24-48h

## ¿Qué incluye este código?

• 20€ gratis acreditados en tu cuenta Revolut  
• Sin comisiones ocultas  
• Válido para nuevos usuarios  
• Acumulable con otras promociones de Revolut

## Requisitos y condiciones

• Ser mayor de 18 años  
• No haber tenido cuenta Revolut antes  
• Verificar identidad con documento oficial  
• Realizar primera transacción en 30 días

## Códigos relacionados de Revolut

[Card: N26 - 15€ Gratis]  
[Card: Vivid - 20€ Bono Bienvenida]  
[Card: Wise - Sin Comisiones 1er Envío]
```

### 2. Páginas de Categoría (Navegacionales)

**Template:**

- **Título**: `Códigos de Descuento [Categoría] [Año] | Verificados`
- **H1**: `Códigos de Descuento [Categoría]`
- Intro: Descripción de la categoría (150-200 palabras)
- **H2**: Códigos destacados de [Categoría]
- [Grid de 12 códigos]
- **H2**: Marcas populares en [Categoría]
- **H2**: Guía: Cómo ahorrar en [Categoría]

### 3. Guías SEO (Informacionales)

**Template:**

- **Título**: `Guía Completa: [Tema] [Año]`
- **H1**: `Guía Completa: [Tema]`
- **H2**: ¿Qué es [Tema]?
- **H2**: Cómo funciona [Tema]
- **H2**: Mejores opciones de [Tema]
- **H2**: Comparativa
- **H2**: Preguntas frecuentes
- **H2**: Conclusión

**Ejemplo:** "Guía Completa: Mejores Neobancos en España 2026"

### 4. Blog Posts (Link Magnets)

Ideas de contenido:

- "10 Trucos para Ahorrar Dinero Online en 2026"
- "Revolut vs N26 vs Vivid: Comparativa Completa"
- "Cómo Conseguir Netflix Gratis Legalmente"
- "Black Friday 2026: Mejores Códigos Verificados"

### Calendario Editorial

| Semana | Tipo de Contenido    | Cantidad        | Objetivo                |
| ------ | -------------------- | --------------- | ----------------------- |
| 1-2    | Páginas de código    | 50 códigos seed | Indexación inicial      |
| 3-4    | Páginas de categoría | 6 categorías    | Estructura navegacional |
| 5-8    | Guías SEO            | 4 guías         | Long-tail keywords      |
| 9-12   | Blog posts           | 8 artículos     | Link magnets            |

---

## 9. Enlaces Internos

### Estrategia de Enlazado Interno

**Principio 1: Estructura Piramidal**

```
Homepage (DA más alto)
    ↓
Categorías (DA medio-alto)
    ↓
Códigos individuales (DA medio)
    ↓
Guías y blog (DA medio-bajo)
```

Link juice fluye de arriba hacia abajo, pero también lateral entre códigos relacionados.

**Principio 2: Anchor Text Natural**

❌ **No hacer:**

- "haz clic aquí"
- "ver más"
- "este enlace"

✅ **Hacer:**

- "códigos verificados de Revolut"
- "descuentos de Netflix actualizados hoy"
- "comparativa de neobancos 2026"

### Ejemplo de Enlazado en Código Individual

```markdown
# Revolut: 20€ Gratis

...contenido del código...

## Códigos relacionados

¿Buscas más opciones? Mira estos [códigos de Fintech verificados](#) o la [guía completa de neobancos](#).

Si prefieres otras marcas, tenemos [códigos de N26](#) y [Vivid](#) actualizados hoy.
```

### Reglas de Enlazado Interno

1. Mínimo **3 enlaces internos** por página (excepto homepage)
2. Máximo **100 enlaces internos** por página (evitar dilución)
3. **Enlaces contextuales** > Enlaces de navegación (más peso SEO)
4. Evitar enlaces recíprocos excesivos (A→B, B→A es OK; pero no A⇄B⇄C⇄A en loop)

### Plugin de Sugerencias Automáticas

```javascript
// src/utils/internalLinkSuggestions.js
export const suggestInternalLinks = async (codeId) => {
  const code = await supabase
    .from("codes")
    .select("app_name, category_id, description")
    .eq("id", codeId)
    .single();

  // 1. Enlaces a misma categoría
  const relatedByCategory = await supabase
    .from("codes")
    .select("slug, app_name, description")
    .eq("category_id", code.category_id)
    .neq("id", codeId)
    .limit(3);

  // 2. Enlaces a misma marca
  const relatedByBrand = await supabase
    .from("codes")
    .select("slug, app_name, description")
    .ilike("app_name", `%${code.app_name}%`)
    .neq("id", codeId)
    .limit(3);

  // 3. Guías relacionadas (basado en keywords en descripción)
  const keywords = extractKeywords(code.description);
  const relatedGuides = await supabase
    .from("guides")
    .select("slug, title")
    .or(keywords.map((kw) => `content.ilike.%${kw}%`).join(","))
    .limit(2);

  return {
    sameCategory: relatedByCategory.data,
    sameBrand: relatedByBrand.data,
    guides: relatedGuides.data,
  };
};
```

---

## 10. Core Web Vitals

### Objetivos

| Métrica                             | Target  | Estrategia                       |
| ----------------------------------- | ------- | -------------------------------- |
| **LCP** (Largest Contentful Paint)  | < 2.5s  | Edge CDN + lazy loading imágenes |
| **FID** (First Input Delay)         | < 100ms | JS mínimo, defer scripts         |
| **CLS** (Cumulative Layout Shift)   | < 0.1   | Fixed dimensions, font preload   |
| **TTFB** (Time to First Byte)       | < 600ms | Netlify Edge Functions           |
| **INP** (Interaction to Next Paint) | < 200ms | Optimizar event handlers         |

### Implementación LCP < 2.5s

```html
<!-- Preload imagen crítica -->
<link rel="preload" as="image" href="/hero-codes.webp" />

<!-- Lazy loading para imágenes no críticas -->
<img
  src="placeholder.png"
  data-src="revolut-logo.png"
  loading="lazy"
  width="200"
  height="200"
  alt="Revolut logo"
/>
```

### Implementación CLS < 0.1

```css
/* Fixed dimensions para evitar layout shifts */
.code-card {
  width: 100%;
  aspect-ratio: 16 / 9; /* Mantiene ratio aunque imagen no cargue */
}

.code-card img {
  width: 100%;
  height: auto;
  display: block;
}

/* Reservar espacio para elementos dinámicos */
.verification-badge {
  min-height: 32px; /* Evita shift cuando badge aparece */
}
```

### Font Loading Optimizado

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>

<style>
  /* Fallback font mientras carga Inter */
  body {
    font-family:
      "Inter",
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }
</style>
```

### Lighthouse CI (Automatización)

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://verificacodigos.com/
            https://verificacodigos.com/categoria/fintech
            https://verificacodigos.com/codigo/revolut-20-euros
          uploadArtifacts: true
          temporaryPublicStorage: true
```

---

## 11. Indexación Rápida

### Google Indexing API

```javascript
// src/services/googleIndexing.js
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "./service-account-key.json",
  scopes: ["https://www.googleapis.com/auth/indexing"],
});

export const submitUrlToGoogle = async (url, type = "URL_UPDATED") => {
  const indexing = google.indexing({ version: "v3", auth });

  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: url,
        type: type, // 'URL_UPDATED' o 'URL_DELETED'
      },
    });

    console.log(`URL submitted to Google: ${url}`);
    return response.data;
  } catch (error) {
    console.error("Error submitting URL:", error);
    throw error;
  }
};
```

### Trigger Automático al Crear Código

```javascript
// netlify/functions/codes.js (POST handler)
export const handler = async (event) => {
  // ... crear código en Supabase ...

  const newCode = await supabase
    .from("codes")
    .insert(codeData)
    .select()
    .single();

  // Notificar a Google inmediatamente
  const codeUrl = `https://verificacodigos.com/codigo/${newCode.slug}`;
  await submitUrlToGoogle(codeUrl, "URL_UPDATED");

  return {
    statusCode: 201,
    body: JSON.stringify({ code: newCode }),
  };
};
```

---

## 12. Analytics y Tracking

### Google Analytics 4 (GA4)

```html
<!-- Global Site Tag (gtag.js) - Google Analytics -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");
</script>
```

### Eventos Custom

```javascript
// src/utils/analytics.js
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof gtag !== "undefined") {
    gtag("event", eventName, eventParams);
  }
};

// Ejemplo de uso
trackEvent("code_copied", {
  code_id: "revolut-20-euros",
  category: "fintech",
  verified_count: 156,
});

trackEvent("code_upvoted", {
  code_id: "netflix-mes-gratis",
  user_flujo: 350,
});
```

### Google Search Console

**Setup:**

1. Verificar propiedad del dominio (método DNS)
2. Enviar sitemap: `https://verificacodigos.com/sitemap.xml`
3. Monitorear:
   - Impresiones por keyword
   - CTR promedio
   - Posición promedio
   - Errores de indexación

---

## 13. Link Building

### Estrategias de Link Building

**1. Guest Posts en Blogs de Finanzas**

Targets:

- Finect.com
- HelpMyCash.com
- Rankia.com

**2. Partnerships con Influencers**

- Micro-influencers de finanzas personales (10K-50K seguidores)
- Contenido: "Mis códigos favoritos verificados"

**3. Directorios de Calidad**

- ProductHunt (lanzamiento)
- BetaList
- AlternativeTo

**4. HARO (Help A Reporter Out)**

- Responder consultas de periodistas sobre cupones/ahorro
- Conseguir backlinks de medios nacionales

---

## 14. SEO Local (España)

### Optimización para España

```html
<!-- hreflang para España -->
<link rel="alternate" hreflang="es-ES" href="https://verificacodigos.com/" />
<link
  rel="alternate"
  hreflang="x-default"
  href="https://verificacodigos.com/"
/>
```

### Schema.org con Ubicación

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VerificaCodigos",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "ES"
  }
}
```
