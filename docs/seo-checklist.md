# SEO Checklist para Nuevas Páginas - Apaga Luz

## ✅ Pre-Publicación Checklist

### 📝 Contenido
- [ ] **Título H1** único y descriptivo con keyword principal
- [ ] **Mínimo 800 palabras** para artículos (300 para páginas de categoría)
- [ ] **Estructura de headings** correcta (H1 → H2 → H3)
- [ ] **Keywords objetivo** distribuidas naturalmente
- [ ] **Párrafos cortos** (máximo 4 líneas)
- [ ] **Listas y tablas** donde sea apropiado
- [ ] **CTAs claros** y visibles

### 🏷️ Meta Tags
- [ ] **Title tag** optimizado (50-60 caracteres)
  ```html
  <title>Keyword Principal | Secundaria | Apaga Luz</title>
  ```
- [ ] **Meta description** única (155-160 caracteres)
  ```html
  <meta name="description" content="Descripción atractiva con CTA...">
  ```
- [ ] **Canonical URL** definida
  ```html
  <link rel="canonical" href="https://www.apaga-luz.com/url-definitiva/">
  ```
- [ ] **Open Graph tags** completos
  ```html
  <meta property="og:title" content="">
  <meta property="og:description" content="">
  <meta property="og:image" content="">
  <meta property="og:url" content="">
  ```

### 🖼️ Imágenes
- [ ] **Alt text** descriptivo en todas las imágenes
- [ ] **Nombres de archivo** SEO-friendly (precio-luz-enero-2025.jpg)
- [ ] **Formato optimizado** (WebP preferido, JPG/PNG como fallback)
- [ ] **Dimensiones definidas** en HTML
- [ ] **Lazy loading** implementado
  ```html
  <img src="imagen.webp" alt="Descripción" width="800" height="600" loading="lazy">
  ```

### 🔗 Enlaces
- [ ] **Mínimo 3 enlaces internos** relevantes
- [ ] **Anchor text variado** y descriptivo
- [ ] **Enlaces externos** con rel="noopener" si target="_blank"
- [ ] **Sin enlaces rotos** (verificar antes de publicar)

### 📊 Schema Markup
- [ ] **Tipo apropiado** de schema implementado:
  - Article (blog posts)
  - FAQPage (preguntas frecuentes)
  - HowTo (guías paso a paso)
  - Dataset (páginas de datos)
  - LocalBusiness (páginas regionales)
- [ ] **Validado** con Google Rich Results Test

### 🚀 Rendimiento
- [ ] **Tiempo de carga < 3 segundos**
- [ ] **Core Web Vitals** en verde:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] **CSS crítico** inline
- [ ] **JavaScript** defer/async donde sea posible

### 📱 Mobile
- [ ] **Responsive design** verificado
- [ ] **Touch targets** mínimo 48x48px
- [ ] **Texto legible** sin zoom (mínimo 16px)
- [ ] **Sin scroll horizontal**

## 🔄 Post-Publicación Checklist

### Inmediato (Día 1)
- [ ] **Verificar indexación** en Google Search Console
- [ ] **Enviar URL** a indexación si es necesario
- [ ] **Actualizar sitemap.xml**
- [ ] **Compartir en redes sociales**
- [ ] **Añadir enlaces internos** desde páginas existentes

### Semana 1
- [ ] **Monitorear rankings** para keywords objetivo
- [ ] **Verificar Core Web Vitals** en PageSpeed Insights
- [ ] **Revisar CTR** en Search Console
- [ ] **Comprobar errores 404** generados

### Mes 1
- [ ] **Analizar métricas**:
  - Tráfico orgánico
  - Tiempo en página
  - Bounce rate
  - Conversiones
- [ ] **Optimizar según datos**:
  - Mejorar meta description si CTR bajo
  - Añadir más contenido si tiempo en página bajo
  - Ajustar CTAs si conversiones bajas

## 📋 Checklist por Tipo de Página

### 🏠 Homepage
- [ ] Schema WebSite + Organization
- [ ] Enlaces a todas las secciones principales
- [ ] Contenido actualizado dinámicamente
- [ ] Meta description con propuesta de valor clara

### 📰 Artículos de Blog
- [ ] Schema Article
- [ ] Fecha de publicación visible
- [ ] Autor definido
- [ ] Categorías y etiquetas
- [ ] Compartir en redes sociales
- [ ] Artículos relacionados

### 📍 Páginas Regionales
- [ ] Schema LocalBusiness
- [ ] Información específica de la región
- [ ] Mapa o referencia geográfica
- [ ] Enlaces a páginas de ciudades cercanas

### 📊 Páginas de Datos
- [ ] Schema Dataset
- [ ] Actualización automática de datos
- [ ] Visualizaciones interactivas
- [ ] Opción de descarga/compartir

### 🛠️ Páginas de Herramientas
- [ ] Schema WebApplication
- [ ] Instrucciones claras de uso
- [ ] Ejemplos prácticos
- [ ] CTA para compartir resultados

## 🚨 Red Flags - Evitar Siempre

❌ **Contenido duplicado** entre páginas
❌ **Keyword stuffing** (repetición excesiva)
❌ **Enlaces rotos** o páginas 404
❌ **Imágenes sin optimizar** (>200KB)
❌ **Títulos genéricos** ("Página 1", "Artículo")
❌ **Meta descriptions duplicadas**
❌ **Contenido thin** (<300 palabras)
❌ **Pop-ups intrusivos** en móvil
❌ **Texto en imágenes** sin alternativa
❌ **JavaScript rendering** para contenido crítico

## 🎯 Quick Wins SEO

### Para implementar rápidamente:
1. **Actualizar fecha** en títulos de contenido evergreen
2. **Añadir FAQ schema** a páginas existentes
3. **Optimizar imágenes** a WebP
4. **Mejorar meta descriptions** con CTAs
5. **Crear enlaces internos** entre contenido relacionado
6. **Añadir breadcrumbs** con schema
7. **Implementar tabla de contenidos** en artículos largos

## 📊 Plantilla de Reporte SEO

### Métricas a reportar mensualmente:
```markdown
## Reporte SEO - [Mes] [Año]

### Tráfico Orgánico
- Sesiones: X (±X% vs mes anterior)
- Usuarios: X (±X%)
- Páginas vistas: X (±X%)

### Rankings
- Keywords en Top 3: X
- Keywords en Top 10: X
- Nuevas keywords rankeando: X

### Páginas Top
1. /url/ - X visitas
2. /url/ - X visitas
3. /url/ - X visitas

### Mejoras Implementadas
- [Lista de cambios SEO realizados]

### Próximas Acciones
- [Lista de tareas SEO pendientes]
```

---

💡 **Tip**: Usa esta checklist como plantilla para cada nueva página. Copia y pega en tu gestor de tareas favorito para no olvidar ningún paso importante.