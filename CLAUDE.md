# Instrucciones SEO para Claude - Proyecto Apaga Luz

## 🎯 Objetivo Principal
Mantener y mejorar el posicionamiento SEO de apaga-luz.com en el competitivo mercado de información sobre precios de electricidad en España.

## 📋 Checklist SEO para Nuevas Páginas

Antes de crear o modificar cualquier página HTML, verifica:

### Meta Tags Esenciales
```html
<!-- Title: 50-60 caracteres, incluir keyword principal -->
<title>Keyword Principal | Keyword Secundaria | Apaga Luz</title>

<!-- Description: 155-160 caracteres, incluir CTA -->
<meta name="description" content="Descripción atractiva con keyword principal. ✓ Beneficio claro ➤ Call to action">

<!-- Canonical (evitar contenido duplicado) -->
<link rel="canonical" href="https://www.apaga-luz.com/url-definitiva/">

<!-- Open Graph (compartir en redes) -->
<meta property="og:title" content="Título para redes sociales">
<meta property="og:description" content="Descripción para redes sociales">
<meta property="og:image" content="https://www.apaga-luz.com/images/imagen-1200x630.jpg">
<meta property="og:url" content="https://www.apaga-luz.com/url-pagina/">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Título para Twitter">
<meta name="twitter:description" content="Descripción para Twitter">
<meta name="twitter:image" content="https://www.apaga-luz.com/images/imagen-twitter.jpg">
```

### Estructura de Contenido
- [ ] **H1 único** con keyword principal (solo uno por página)
- [ ] **H2-H6** en orden jerárquico correcto
- [ ] **Mínimo 800 palabras** para artículos
- [ ] **Párrafos cortos** (3-4 líneas máximo)
- [ ] **Listas y tablas** para mejorar legibilidad
- [ ] **Negritas** en keywords importantes (sin abusar)

### Enlaces Internos
- [ ] Mínimo **3 enlaces internos** relevantes
- [ ] Usar **anchor text descriptivo** (no "click aquí")
- [ ] Enlaces a páginas de **mayor autoridad** (home, categorías)
- [ ] Verificar que no hay **enlaces rotos**

### Imágenes
- [ ] **Formato WebP** cuando sea posible
- [ ] **Alt text descriptivo** con keywords
- [ ] **Nombres de archivo** descriptivos (precio-luz-enero-2025.jpg)
- [ ] **Lazy loading** para imágenes below the fold
- [ ] **Dimensiones especificadas** en HTML

## 🔧 Comandos Útiles para SEO

### Validar HTML y Estructura
```bash
# Verificar que no hay H1 duplicados
grep -n "<h1" *.html | awk -F: '{print $1}' | sort | uniq -c | awk '$1 > 1'

# Buscar imágenes sin alt text
grep -E '<img[^>]+>' *.html | grep -v 'alt='

# Encontrar enlaces rotos internos
grep -oh 'href="[^"]*"' *.html | sort | uniq | xargs -I {} sh -c 'if [[ {} == href=\"/* ]]; then echo {}; fi'
```

### Generar Sitemap
```javascript
// Script para generar sitemap.xml automáticamente
const pages = [
  { url: '/', priority: 1.0, changefreq: 'hourly' },
  { url: '/precio-luz-manana/', priority: 0.9, changefreq: 'daily' },
  { url: '/graficas/', priority: 0.8, changefreq: 'daily' },
  // Añadir todas las páginas
];
```

## 📊 Schema Markup Templates

### Para la página principal (Dataset)
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Precios de electricidad por hora",
  "description": "Dataset con los precios de la electricidad actualizados cada hora",
  "temporalCoverage": "2024/..",
  "spatialCoverage": {
    "@type": "Place",
    "name": "España"
  },
  "distribution": {
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://www.apaga-luz.com/data/today_price.json"
  }
}
```

### Para artículos del blog
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Título del artículo",
  "author": {
    "@type": "Organization",
    "name": "Apaga Luz",
    "url": "https://www.apaga-luz.com"
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-15",
  "image": "https://www.apaga-luz.com/images/articulo.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "Apaga Luz",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.apaga-luz.com/logo.png"
    }
  }
}
```

### Para páginas de preguntas frecuentes
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "¿Pregunta frecuente?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Respuesta detallada a la pregunta."
    }
  }]
}
```

## 🚀 Optimización de Core Web Vitals

### Checklist de rendimiento
- [ ] **LCP < 2.5s** (Largest Contentful Paint)
- [ ] **FID < 100ms** (First Input Delay)
- [ ] **CLS < 0.1** (Cumulative Layout Shift)

### Técnicas de optimización
```html
<!-- Preload fuentes críticas -->
<link rel="preload" href="/fonts/principal.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preconnect a dominios externos -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://www.google-analytics.com">

<!-- Lazy loading nativo para imágenes -->
<img src="imagen.jpg" loading="lazy" alt="Descripción">

<!-- Defer para JavaScript no crítico -->
<script src="script.js" defer></script>
```

## 📝 Estructura de URLs SEO-Friendly

### Buenas prácticas
- ✅ `/precio-luz-madrid/` (corta, descriptiva, con keywords)
- ✅ `/noticias/bono-social-electrico-2024/` (jerárquica)
- ❌ `/page.php?id=123` (no descriptiva)
- ❌ `/noticias/art_12345_final_v2/` (confusa)

### Redirecciones 301
Cuando cambies una URL, siempre implementa redirección 301:
```apache
# En .htaccess o configuración del servidor
Redirect 301 /url-antigua/ https://www.apaga-luz.com/url-nueva/
```

## 🎯 Keywords Objetivo por Tipo de Página

### Página principal
- precio luz hoy
- tarifa luz por horas
- precio kwh hoy
- pvpc hoy

### Páginas regionales
- precio luz [ciudad]
- tarifa luz [comunidad]
- luz barata [ciudad]

### Artículos informativos
- como ahorrar luz
- mejor tarifa luz 2024
- bono social eléctrico
- cambiar compañía luz

## 📈 Monitorización y Reportes

### Métricas clave a revisar semanalmente
1. **Posiciones**: Top 10 keywords en Search Console
2. **CTR**: Click-through rate por página
3. **Tráfico orgánico**: Sesiones desde búsqueda
4. **Páginas indexadas**: Coverage report
5. **Core Web Vitals**: En PageSpeed Insights

### Herramientas de validación
- [Google Search Console](https://search.google.com/search-console)
- [Schema Markup Validator](https://validator.schema.org/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)

## 🔄 Actualizaciones de Contenido

### Contenido que requiere actualización regular
- **Mensual**: Comparativas de tarifas, mejores ofertas
- **Trimestral**: Guías completas, rankings de compañías
- **Anual**: Contenido evergreen con año en el título
- **Según cambios**: Normativa, tarifas PVPC

### Script para actualizar fechas automáticamente
```javascript
// Actualizar fecha en títulos y contenido
const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const mesActual = meses[new Date().getMonth()];
const añoActual = new Date().getFullYear();
```

## ⚠️ Errores Comunes a Evitar

1. **NO** duplicar H1 en una página
2. **NO** usar misma meta description en múltiples páginas
3. **NO** crear páginas con menos de 300 palabras
4. **NO** usar JavaScript para contenido crítico SEO
5. **NO** bloquear recursos CSS/JS en robots.txt
6. **NO** olvidar actualizar el sitemap.xml
7. **NO** usar URLs con parámetros cuando sea evitable
8. **NO** ignorar errores 404 (crear redirecciones)

## 🏆 Objetivos SEO 2025

1. **Alcanzar 1M de visitas mensuales orgánicas**
2. **Posicionar 50 keywords en top 3**
3. **Conseguir featured snippets para 20 búsquedas**
4. **Reducir bounce rate al 45%**
5. **Aumentar páginas por sesión a 3.5**

---

**Recuerda**: El SEO es un proceso continuo. Cada cambio debe ser medido y optimizado basándose en datos reales. ¡Mantén siempre al usuario como prioridad!