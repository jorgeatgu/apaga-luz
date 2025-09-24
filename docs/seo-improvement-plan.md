# Plan de Mejora SEO para apaga-luz.com

## 📊 Análisis Comparativo con la Competencia

### tarifaluzhora.es (Líder del Mercado)
- **Tráfico**: 5.56M visitas/mes (SEMrush, Abril 2025)
- **Domain Rating**: 68 (Ahrefs)
- **Backlinks**: 1.7K sitios enlazando
- **Fortalezas principales**:
  - Contenido muy completo y actualizado
  - Múltiples canales de comunicación (email, teléfono)
  - Herramientas interactivas y calculadoras
  - Estructura de sitemap optimizada
  - Páginas regionales específicas

### tarifadeluz.com
- **Fortalezas principales**:
  - Diseño visual muy atractivo
  - Gráficos interactivos en tiempo real
  - Monetización efectiva con Amazon
  - Explicaciones detalladas del sistema de precios
  - Tablas de precios con código de colores

### apaga-luz.com (Estado Actual)
- **Fortalezas identificadas**:
  - Estructura HTML semántica correcta
  - Schema markup básico implementado
  - Meta tags esenciales presentes
  - Buen rendimiento base
  - Contenido de calidad en el blog

- **Áreas de mejora prioritarias**:
  - Sitemap actualizado pero páginas principales con fecha antigua (2022)
  - Falta de meta tags Open Graph
  - Sin implementación de páginas regionales
  - Optimización de imágenes pendiente
  - CTAs limitados comparado con la competencia

## 🎯 Plan de Implementación por Fases

### Fase 1: Mejoras Técnicas Críticas (Semana 1)

#### 1.1 Mejora del Sitemap
- [ ] Actualizar lastmod de páginas principales (home, gráficas, etc.)
- [ ] Implementar sitemap de noticias (Google News)
- [ ] Crear sitemap de imágenes
- [ ] Configurar actualización automática del lastmod
- [ ] Añadir changefreq apropiado para cada tipo de página

#### 1.2 Meta Tags y Open Graph
```html
<!-- Ejemplo de implementación para cada página -->
<meta property="og:title" content="Precio Luz Hoy | Tarifas por Horas Actualizadas | Apaga Luz">
<meta property="og:description" content="Consulta el precio de la luz hoy hora a hora. Ahorra hasta 30% en tu factura con información actualizada en tiempo real">
<meta property="og:image" content="https://www.apaga-luz.com/images/precio-luz-hoy.jpg">
<meta property="og:url" content="https://www.apaga-luz.com/">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
```

#### 1.3 Schema Markup Adicional
- [ ] HowTo schema para guías paso a paso
- [ ] Product schema para comparativas de tarifas
- [ ] LocalBusiness schema para cada región
- [ ] Event schema para cambios de tarifas importantes
- [ ] BreadcrumbList en todas las páginas

### Fase 2: Estructura de Contenido (Semanas 2-3)

#### 2.1 Creación de Hubs de Contenido
```
/compañias/
  ├── /iberdrola/
  ├── /endesa/
  ├── /naturgy/
  └── /totalenergies/

/tramites/
  ├── /cambiar-compania/
  ├── /bono-social/
  └── /reclamaciones/

/calculadoras/
  ├── /ahorro-mensual/
  ├── /consumo-electrodomesticos/
  └── /comparador-tarifas/
```

#### 2.2 Landing Pages Regionales
- [ ] /precio-luz-madrid/
- [ ] /precio-luz-barcelona/
- [ ] /precio-luz-valencia/
- [ ] /precio-luz-sevilla/
- [ ] /precio-luz-bilbao/
- [ ] Una página por cada comunidad autónoma

#### 2.3 Contenido Evergreen Actualizable
- [ ] "Mejores tarifas luz [MES] [AÑO]" (actualización mensual)
- [ ] "Precio medio luz [AÑO]" (actualización anual)
- [ ] "Guía completa PVPC [AÑO]"
- [ ] "Comparativa comercializadoras [AÑO]"

### Fase 3: Optimización de Conversión (Semana 4)

#### 3.1 Implementación de CTAs Múltiples
- [ ] Newsletter con alertas de precios bajos
- [ ] Calculadora de ahorro personalizada
- [ ] Widget embebible de precio actual
- [ ] Notificaciones push para cambios de precio
- [ ] Formulario de contacto optimizado

#### 3.2 Herramientas Interactivas
- [ ] Comparador visual de tarifas (tipo tarifadeluz.com)
- [ ] Simulador de factura interactivo
- [ ] Gráfico histórico de precios (D3.js mejorado)
- [ ] Sistema de alertas personalizadas

### Fase 4: Enlaces Internos y Arquitectura (Ongoing)

#### 4.1 Estrategia de Clustering
- Crear grupos temáticos de contenido
- Enlaces contextuales entre artículos relacionados
- Implementar "Artículos relacionados" automático
- Breadcrumbs mejorados en todas las páginas

#### 4.2 Footer Optimizado
```
Precio de la luz          Recursos               Compañías
├── Hoy                   ├── Calculadoras       ├── Iberdrola
├── Mañana                ├── Glosario           ├── Endesa
├── Histórico             ├── Guías              ├── Naturgy
└── Por regiones          └── FAQ                └── Ver todas
```

### Fase 5: Core Web Vitals y Rendimiento

#### 5.1 Optimización de Imágenes
- [ ] Conversión a formato WebP
- [ ] Implementar lazy loading nativo
- [ ] Srcset para imágenes responsive
- [ ] CDN para recursos estáticos

#### 5.2 Optimización de Código
- [ ] Minificar CSS/JS en producción
- [ ] Implementar Critical CSS
- [ ] Defer para JavaScript no crítico
- [ ] Service Worker para caché offline

### Fase 6: Monetización y Analytics

#### 6.1 Diversificación de Ingresos
- [ ] Programa afiliados con comercializadoras
- [ ] Marketplace de productos eficiencia energética
- [ ] Consultoría/asesoría energética
- [ ] Contenido premium (informes detallados)

#### 6.2 Tracking Avanzado
- [ ] Eventos de micro-conversiones
- [ ] Heatmaps con Hotjar/Clarity
- [ ] A/B testing de CTAs y títulos
- [ ] Dashboard personalizado en Data Studio

## 📈 KPIs y Métricas de Éxito

### Objetivos a 6 meses:
- **Tráfico orgánico**: +50% (baseline actual)
- **CTR en SERPs**: Del 3% al 5%
- **Bounce rate**: Del 70% al 50%
- **Páginas/sesión**: De 1.5 a 3
- **Backlinks**: +500 de calidad (DR>30)
- **Keywords top 10**: +100 nuevas

### Métricas mensuales a trackear:
1. Posiciones para keywords principales
2. Tráfico orgánico por página
3. Conversiones (newsletter, formularios, etc.)
4. Core Web Vitals scores
5. Páginas indexadas vs enviadas
6. CTR por tipo de resultado (featured snippets, etc.)

## 🚀 Quick Wins (Implementar Ya)

1. **Actualizar sitemap.xml** - 2 horas
2. **Añadir Open Graph tags** - 3 horas
3. **Crear 5 páginas regionales** - 1 día
4. **Optimizar meta descriptions** - 4 horas
5. **Implementar formulario de contacto mejorado** - 2 horas

## 📅 Calendario de Contenido Sugerido

### Publicación semanal:
- **Lunes**: Análisis semanal de precios
- **Miércoles**: Guía educativa o tutorial
- **Viernes**: Comparativa o actualización de datos

### Tipos de contenido mensual:
- 4 análisis de mercado
- 3 guías educativas
- 2 comparativas de compañías
- 2 actualizaciones de datos/estadísticas
- 1 caso de estudio/testimonio

## 🔗 Estrategia de Link Building

### Tácticas prioritarias:
1. **Guest posting** en blogs de finanzas personales
2. **Digital PR** con estudios propios del sector
3. **Infografías** sobre consumo eléctrico
4. **Widgets embebibles** de precio actual
5. **Colaboraciones** con influencers de ahorro
6. **Directorios** especializados en energía

### Anchor text distribution:
- 40% Branded ("Apaga Luz", "apaga-luz.com")
- 30% Naked URLs
- 20% Keywords objetivo
- 10% Genéricos ("aquí", "ver más")

## 🛠️ Herramientas Necesarias

### Imprescindibles:
- Google Search Console (configurado)
- Google Analytics 4 (migrar si necesario)
- Ahrefs/SEMrush (monitoreo competencia)
- Screaming Frog (auditorías técnicas)
- PageSpeed Insights (Core Web Vitals)

### Recomendadas:
- Hotjar/Microsoft Clarity (comportamiento usuarios)
- Google Tag Manager (gestión de tags)
- Schema Markup Validator
- Mobile-Friendly Test
- Rich Results Test

## ✅ Checklist Pre-Publicación

Antes de publicar cualquier contenido nuevo:
- [ ] Title tag optimizado (50-60 caracteres)
- [ ] Meta description única (155-160 caracteres)
- [ ] URL amigable y corta
- [ ] Schema markup apropiado
- [ ] Open Graph tags
- [ ] Imágenes optimizadas con alt text
- [ ] Enlaces internos relevantes (mínimo 3)
- [ ] H1 único y descriptivo
- [ ] Contenido mínimo 800 palabras
- [ ] CTA claro y visible

## 📞 Próximos Pasos

1. Validar plan con stakeholders
2. Asignar recursos y responsables
3. Comenzar con Quick Wins
4. Establecer calendario de revisión mensual
5. Configurar dashboards de monitoreo