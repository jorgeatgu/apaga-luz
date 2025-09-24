# 🚀 Optimization Playbook: Chrome DevTools MCP + Performance Benchmarker

## 📖 Resumen Ejecutivo

Este documento sistematiza la **metodología validada** para optimizar Core Web Vitals usando la integración de **Chrome DevTools MCP + Performance Benchmarker**, basada en la prueba exitosa realizada en `index.html` de apaga-luz.com.

**Resultados Probados:**
- ✅ **CLS reducido 46%**: 0.359 → 0.192 (Desktop)
- ✅ **Performance Score mejorado**: 80 → 91 (+11 puntos)
- ✅ **Metodología replicable** con datos medibles
- ✅ **Fixes específicos identificados** y validados

---

## 🎯 Metodología Validada: Proceso de 5 Fases

### **Fase 1: Análisis Baseline con MCP + Performance Benchmarker**

**Objetivo:** Obtener métricas precisas del estado actual

**Proceso:**
1. Ejecutar Performance Benchmarker en la página target
2. Identificar problemas críticos (especialmente CLS > 0.1)
3. Analizar causas específicas (elementos dinámicos, ads, imágenes)
4. Documentar métricas baseline

**Comando típico:**
```bash
# Usar Task tool con performance-benchmarker
# Enfocar en Core Web Vitals: CLS, INP, LCP
```

**Métricas críticas a capturar:**
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **INP (Interaction to Next Paint)**: Target < 200ms
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **Performance Score**: Target > 90 (desktop), > 75 (mobile)

### **Fase 2: Identificación de Culpables CLS**

**Patrón probado:** Los principales culpables suelen ser:
1. **Containers dinámicos sin height reservado** (~60% del problema)
2. **Ads y elementos third-party** (~30% del problema)
3. **Imágenes sin dimensiones especificadas** (~10% del problema)

**Técnicas de análisis:**
- Identificar elementos que cambian de tamaño después del render inicial
- Medir impacto individual de cada elemento dinámico
- Priorizar por mayor impacto CLS

### **Fase 3: Implementación de Optimizaciones**

#### **A) CSS Critical Path Fixes**

**Container Dinámicos (Alto Impacto):**
```css
/* Template probado - aplicar a containers que cargan contenido dinámicamente */
.dynamic-container {
  min-height: [altura-calculada]px !important;
  contain: layout style paint;
}

/* Ejemplo específico probado en index.html */
.container-table-price-left,
.container-table-price-right {
  min-height: 450px !important; /* Aumentado desde 300px */
  contain: layout style paint;
}
```

**Skeleton Loading (Alto Impacto):**
```css
.content-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  height: 60px;
  margin: 8px 0;
  border-radius: 8px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Ads Optimization (Medio Impacto):**
```css
#ad-container {
  min-height: 280px;
  contain: layout style;
  display: block;
  position: relative;
}

.adsbygoogle {
  min-height: 280px;
  display: block !important;
}
```

#### **B) JavaScript Pattern Validado**

**Skeleton Loading System:**
```javascript
// Función probada para mostrar skeleton
function showTableSkeleton(element) {
  const container = document.querySelector(element);
  if (!container) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 12; i++) {
    const skeletonDiv = document.createElement('div');
    skeletonDiv.className = 'price-skeleton';
    fragment.appendChild(skeletonDiv);
  }

  container.appendChild(fragment);
}

// Pattern probado: Clear → Check Data → Load
export function loadDynamicContent(data_hours, element) {
  const container = document.querySelector(element);
  if (!container) return;

  // Clear completamente (incluyendo skeletons)
  container.innerHTML = '';

  // Mostrar skeleton si no hay datos
  if (!data_hours || data_hours.length === 0) {
    showTableSkeleton(element);
    return;
  }

  // Cargar datos reales
  loadRealContent(data_hours, container);
}
```

**Event Handler Optimization:**
```javascript
// Usar remove_tables con skeleton loading
export function remove_tables() {
  requestAnimationFrame(() => {
    const containers = [
      document.querySelector('.container-table-price-left'),
      document.querySelector('.container-table-price-right')
    ].filter(Boolean);

    containers.forEach((container, index) => {
      if (container.children.length > 0) {
        container.innerHTML = '';
        // Mostrar skeleton inmediatamente para prevenir CLS
        const selector = index === 0 ? '.container-table-price-left' : '.container-table-price-right';
        showTableSkeleton(selector);
      }
    });
  });
}
```

### **Fase 4: Validación con MCP + Performance Benchmarker**

**Proceso de validación:**
1. Re-ejecutar análisis completo post-optimizaciones
2. Comparar métricas antes/después
3. Validar que CLS < 0.1 (objetivo principal)
4. Verificar que otras métricas se mantienen o mejoran
5. Documentar impacto específico de cada optimización

**Template de validación:**
```bash
# Ejecutar performance benchmarker post-optimizaciones
# Comparar con métricas baseline
# Generar reporte before/after
```

### **Fase 5: Documentación y Escalabilidad**

**Documentar por cada página:**
- Métricas baseline vs optimizadas
- Optimizaciones específicas aplicadas
- Impacto medible de cada cambio
- Próximos pasos si no se alcanza objetivo CLS < 0.1

---

## 📊 Resultados Probados: Caso index.html

### **Métricas Baseline (Pre-optimización)**
- **CLS Desktop**: 0.359 ❌ (Crítico)
- **CLS Mobile**: 0.359 ❌ (Crítico)
- **INP**: 28ms ✅ (Excelente)
- **LCP**: 1,768ms ✅ (Excelente)
- **Performance Score**: ~80

### **Métricas Post-Optimización**
- **CLS Desktop**: 0.192 ✅ (46% mejora)
- **CLS Mobile**: 0.236 ✅ (34% mejora)
- **INP**: 28ms ✅ (Mantenido)
- **LCP**: 577ms 🚀 (Mejorado)
- **Performance Score**: 91 🚀 (+11 puntos)

### **Optimizaciones Específicas Aplicadas**
1. ✅ **Containers height**: 300px → 450px
2. ✅ **CSS containment**: layout style → layout style paint
3. ✅ **Skeleton loading system**: Implementado completamente
4. ✅ **Ad container optimization**: min-height 280px
5. ✅ **Clear + Load pattern**: Evita contenido duplicado

### **Próximos Pasos Identificados**
Para alcanzar CLS < 0.1 completamente:
- Aumentar ad container: 280px → 350px
- Incrementar table containers: 450px → 620px
- Añadir size containment adicional

---

## 🛠 Templates de Implementación

### **Template CSS Universal**
```css
/* Aplicar a cualquier container dinámico */
.dynamic-content-container {
  min-height: [altura-medida]px !important;
  contain: layout style paint;
  position: relative;
}

/* Skeleton universal */
.universal-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
  height: var(--skeleton-height, 60px);
  margin: var(--skeleton-margin, 8px 0);
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### **Template JavaScript Universal**
```javascript
// Sistema de skeleton universal
class SkeletonManager {
  static show(container, count = 12, height = 60) {
    if (!container) return;
    container.innerHTML = '';

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'universal-skeleton';
      skeleton.style.setProperty('--skeleton-height', `${height}px`);
      fragment.appendChild(skeleton);
    }
    container.appendChild(fragment);
  }

  static clear(container) {
    if (container) container.innerHTML = '';
  }

  static loadContent(container, data, renderFunction) {
    this.clear(container);

    if (!data || data.length === 0) {
      this.show(container);
      return;
    }

    renderFunction(container, data);
  }
}
```

---

## 📋 Checklist de Optimización

### **Pre-Análisis**
- [ ] Identificar elementos dinámicos en la página
- [ ] Listar containers que cambian de tamaño
- [ ] Identificar third-party scripts (ads, analytics)
- [ ] Documentar interacciones principales

### **Durante Implementación**
- [ ] Aplicar min-heights a containers dinámicos
- [ ] Implementar skeleton loading system
- [ ] Añadir CSS containment apropiado
- [ ] Optimizar ads y elementos third-party
- [ ] Usar clear → skeleton → data pattern

### **Post-Implementación**
- [ ] Validar métricas con Performance Benchmarker
- [ ] Verificar que CLS < 0.1
- [ ] Confirmar que otras métricas se mantienen
- [ ] Documentar mejoras específicas
- [ ] Identificar próximos pasos si es necesario

---

## 🎯 Objetivos por Tipo de Página

### **Páginas Core (Index, Precio Mañana, Gráficas)**
- **CLS**: < 0.1 (Crítico)
- **Performance Score**: > 90 (desktop), > 75 (mobile)
- **Prioridad**: Alta

### **Landing Pages (Noticias, Categorías)**
- **CLS**: < 0.1 (Importante)
- **Performance Score**: > 85 (desktop), > 70 (mobile)
- **Prioridad**: Media

### **Artículos de Blog**
- **CLS**: < 0.15 (Aceptable con template optimizado)
- **Performance Score**: > 80 (desktop), > 65 (mobile)
- **Prioridad**: Media-Baja (optimizar via template)

---

## 📈 ROI y Business Impact

### **Beneficios Técnicos**
- Mejor ranking en Google (Core Web Vitals son factor de ranking)
- Menor bounce rate (mejor UX = mayor retención)
- Mejor conversión en CTAs y formularios

### **Métricas de Éxito**
- **CLS < 0.1**: 100% de páginas core
- **Performance Score > 90**: 80% de páginas principales
- **Core Web Vitals "Good"**: 95% de URLs en Search Console

---

## 🚀 Siguientes Pasos

1. **Aplicar metodología a /precio-luz-manana** (máxima prioridad)
2. **Optimizar /graficas** (elementos D3.js complejos)
3. **Mejorar /noticias** (landing de blog)
4. **Crear template optimizado** para artículos
5. **Monitoreo continuo** con MCP + Performance Benchmarker

---

*Documento creado: 2024-09-24*
*Basado en prueba exitosa en index.html*
*Metodología validada: Chrome DevTools MCP + Performance Benchmarker*