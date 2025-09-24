# 📊 Page Analysis Template: Chrome DevTools MCP + Performance Benchmarker

**Página analizada:** `[PÁGINA_URL]`
**Fecha de análisis:** `[FECHA]`
**Analista:** `[NOMBRE]`

---

## 🎯 Objetivo del Análisis

**Determinar optimizaciones específicas para mejorar Core Web Vitals, especialmente:**
- **CLS < 0.1** (Prioridad crítica)
- **INP < 200ms** (Interacciones fluidas)
- **LCP < 2.5s** (Carga rápida)

---

## 📋 Paso 1: Pre-Análisis - Identificación de Elementos

### **Elementos Dinámicos Identificados**
- [ ] **Tablas/Listas que se cargan dinámicamente**
  - Containers: `[SELECTORES_CSS]`
  - Contenido esperado: `[TIPO_CONTENIDO]`
  - Altura estimada: `[ALTURA]px`

- [ ] **Elementos Third-Party**
  - Ads: `[UBICACIÓN_ADS]`
  - Analytics: `[SCRIPTS_ANALYTICS]`
  - Widgets externos: `[WIDGETS]`

- [ ] **Imágenes**
  - Lazy-loaded: `[CANTIDAD]`
  - Sin dimensiones: `[CANTIDAD]`
  - Formato: `[WEBP/JPG/PNG]`

- [ ] **Interacciones Principales**
  - Botones críticos: `[BOTONES]`
  - Formularios: `[FORMULARIOS]`
  - Filtros/ordenación: `[ELEMENTOS_INTERACTIVOS]`

---

## 🔬 Paso 2: Análisis Baseline con Performance Benchmarker

### **Comando de Análisis**
```bash
# Usar Task tool con performance-benchmarker
# Objetivo: Analizar [PÁGINA_URL] para identificar problemas CLS específicos
```

### **Métricas Baseline Obtenidas**

| Métrica | Desktop | Mobile | Target | Status |
|---------|---------|--------|---------|---------|
| **CLS** | `[VALOR]` | `[VALOR]` | < 0.1 | `[❌/✅]` |
| **INP** | `[VALOR]ms` | `[VALOR]ms` | < 200ms | `[❌/✅]` |
| **LCP** | `[VALOR]ms` | `[VALOR]ms` | < 2.5s | `[❌/✅]` |
| **FCP** | `[VALOR]ms` | `[VALOR]ms` | < 1.8s | `[❌/✅]` |
| **TTFB** | `[VALOR]ms` | `[VALOR]ms` | < 800ms | `[❌/✅]` |
| **Performance Score** | `[VALOR]/100` | `[VALOR]/100` | >90/>75 | `[❌/✅]` |

### **Problemas Críticos Identificados**

#### **🚨 CLS Issues (Si CLS > 0.1)**
1. **Culpable Principal:** `[ELEMENTO_PRINCIPAL]`
   - **Impacto estimado:** `[VALOR_CLS]`
   - **Causa:** `[DESCRIPCIÓN_CAUSA]`
   - **Ubicación:** `[SELECTOR_CSS]`

2. **Culpable Secundario:** `[ELEMENTO_SECUNDARIO]`
   - **Impacto estimado:** `[VALOR_CLS]`
   - **Causa:** `[DESCRIPCIÓN_CAUSA]`
   - **Ubicación:** `[SELECTOR_CSS]`

#### **⚡ INP Issues (Si INP > 200ms)**
- **Interacción lenta:** `[DESCRIPCIÓN]`
- **Duración:** `[VALOR]ms`
- **Element target:** `[SELECTOR]`

#### **🎨 LCP Issues (Si LCP > 2.5s)**
- **LCP Element:** `[DESCRIPCIÓN_ELEMENTO]`
- **Tiempo de carga:** `[VALOR]ms`
- **Optimización sugerida:** `[ACCIÓN]`

---

## 🛠 Paso 3: Optimizaciones Específicas Propuestas

### **CSS Critical Path Fixes**

#### **Container Dynamic Heights**
```css
/* Aplicar a containers que cargan contenido dinámicamente */
[SELECTOR_CONTAINER] {
  min-height: [ALTURA_CALCULADA]px !important;
  contain: layout style paint;
}

/* Ejemplo específico para esta página */
[SELECTOR_ESPECÍFICO] {
  min-height: [ALTURA]px !important;
  contain: layout style paint;
}
```

#### **Skeleton Loading Implementation**
```css
/* Skeleton específico para esta página */
.[CLASE_SKELETON] {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  height: [ALTURA]px;
  margin: [MARGEN];
  border-radius: 8px;
}
```

#### **Third-Party Optimization**
```css
/* Ads/Widgets optimization */
[SELECTOR_AD] {
  min-height: [ALTURA]px;
  contain: layout style;
  display: block;
  position: relative;
}
```

### **JavaScript Implementation**

#### **Skeleton Loading System**
```javascript
// Función específica para esta página
function showPageSkeleton(element, config = {}) {
  const container = document.querySelector(element);
  if (!container) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  const count = config.count || [NÚMERO_ELEMENTOS];
  const height = config.height || [ALTURA_DEFAULT];

  for (let i = 0; i < count; i++) {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.className = '[CLASE_SKELETON]';
    skeletonDiv.style.height = `${height}px`;
    fragment.appendChild(skeletonDiv);
  }

  container.appendChild(fragment);
}
```

#### **Dynamic Content Loading Pattern**
```javascript
// Pattern optimizado para esta página
function loadPageContent(data, element) {
  const container = document.querySelector(element);
  if (!container) return;

  // Clear completamente
  container.innerHTML = '';

  // Mostrar skeleton si no hay datos
  if (!data || data.length === 0) {
    showPageSkeleton(element, { count: [NÚMERO], height: [ALTURA] });
    return;
  }

  // Cargar contenido real
  [FUNCIÓN_RENDER_REAL](data, container);
}
```

### **Image Optimization**
```html
<!-- Template para imágenes optimizadas -->
<img src="[SRC]"
     width="[WIDTH]"
     height="[HEIGHT]"
     loading="lazy"
     alt="[ALT_TEXT]"
     style="aspect-ratio: [RATIO];">
```

---

## 📊 Paso 4: Impacto Esperado

### **Predicción de Mejoras**

| Optimización | CLS Impact | Esfuerzo | Prioridad |
|-------------|------------|----------|-----------|
| Container heights | `-[VALOR]` | 2-3h | 🔴 Alta |
| Skeleton loading | `-[VALOR]` | 3-4h | 🔴 Alta |
| Third-party optimization | `-[VALOR]` | 1-2h | 🟡 Media |
| Image optimization | `-[VALOR]` | 1-2h | 🟡 Media |

### **Métricas Target Post-Optimización**

| Métrica | Actual | Target | Gap |
|---------|---------|--------|-----|
| **CLS** | `[ACTUAL]` | `< 0.1` | `[GAP]` |
| **Performance Score** | `[ACTUAL]` | `> 90` | `[GAP]` |

---

## 🎯 Paso 5: Plan de Implementación

### **Fase 1: CSS Critical Path (1-2 días)**
1. [ ] Añadir min-heights a containers dinámicos
2. [ ] Implementar skeletons CSS
3. [ ] Optimizar third-party containers
4. [ ] Build y test inicial

### **Fase 2: JavaScript Optimization (1-2 días)**
1. [ ] Implementar skeleton loading system
2. [ ] Aplicar clear → skeleton → data pattern
3. [ ] Optimizar event handlers si es necesario
4. [ ] Test de interacciones

### **Fase 3: Validación (1 día)**
1. [ ] Re-ejecutar Performance Benchmarker
2. [ ] Comparar métricas before/after
3. [ ] Documentar mejoras reales
4. [ ] Identificar próximos pasos si es necesario

---

## 📋 Checklist de Implementación

### **Pre-Implementación**
- [ ] Backup del código actual
- [ ] Identificar todos los elementos dinámicos
- [ ] Medir alturas reales de contenidos
- [ ] Documentar selectores CSS específicos

### **Durante Implementación**
- [ ] Aplicar CSS fixes progresivamente
- [ ] Test en diferentes dispositivos
- [ ] Verificar que no se rompe funcionalidad
- [ ] Monitorear métricas durante desarrollo

### **Post-Implementación**
- [ ] Ejecutar Performance Benchmarker final
- [ ] Validar CLS < 0.1
- [ ] Verificar otras métricas estables
- [ ] Documentar cambios específicos realizados

---

## 📈 Paso 6: Validación Final

### **Métricas Post-Optimización**

| Métrica | Baseline | Optimizada | Mejora | Status |
|---------|----------|------------|---------|---------|
| **CLS** | `[ANTES]` | `[DESPUÉS]` | `[%]` | `[❌/✅]` |
| **INP** | `[ANTES]` | `[DESPUÉS]` | `[%]` | `[❌/✅]` |
| **LCP** | `[ANTES]` | `[DESPUÉS]` | `[%]` | `[❌/✅]` |
| **Performance Score** | `[ANTES]` | `[DESPUÉS]` | `[+PUNTOS]` | `[❌/✅]` |

### **Validación con Performance Benchmarker**
```bash
# Comando final de validación
# Comparar con métricas baseline
# Generar reporte final
```

---

## 🚀 Paso 7: Next Steps

### **Si CLS < 0.1 alcanzado ✅**
- [ ] Documentar caso de éxito
- [ ] Aplicar aprendizajes a páginas similares
- [ ] Monitoreo continuo

### **Si CLS aún > 0.1 ⚠️**
- [ ] Identificar elementos restantes que causan shift
- [ ] Implementar optimizaciones adicionales:
  - Aumentar min-heights específicos
  - Añadir `contain: size` donde sea posible
  - Optimizar timing de third-party scripts
- [ ] Re-analizar con MCP + Performance Benchmarker

### **Optimizaciones Futuras**
- [ ] Lazy loading más agresivo
- [ ] Code splitting adicional
- [ ] Resource hints optimization
- [ ] Service worker caching

---

## 📝 Notas y Observaciones

### **Desafíos Específicos de esta Página**
- `[DESAFÍO_1]`: `[DESCRIPCIÓN_Y_SOLUCIÓN]`
- `[DESAFÍO_2]`: `[DESCRIPCIÓN_Y_SOLUCIÓN]`

### **Lecciones Aprendidas**
- `[APRENDIZAJE_1]`
- `[APRENDIZAJE_2]`

### **Recomendaciones para Páginas Similares**
- `[RECOMENDACIÓN_1]`
- `[RECOMENDACIÓN_2]`

---

**Template versión:** 1.0
**Basado en metodología validada:** Chrome DevTools MCP + Performance Benchmarker
**Referencias:** OPTIMIZATION_PLAYBOOK.md

---

*Este template debe ser copiado y personalizado para cada página específica a analizar*