# 🎯 TEMPLATES PARA CONVERSACIONES SEO - APAGA LUZ

## 📋 INSTRUCCIONES DE USO
1. **Copia el template** de la conversación que necesites
2. **Pégalo en nueva conversación** con Claude
3. **Usa agentes SEO especializados** cuando se indique en cada template
4. **Ejecuta en orden recomendado** (Conversación 1 → 2 → monitoreo → resto)
5. **Verifica checklist** antes de pasar a siguiente conversación

## 🤖 AGENTES SEO ESPECIALIZADOS DISPONIBLES

### @seo-keyword-strategist
**Cuándo usar**: Analizar densidad de keywords y sugerir variaciones semánticas
**Ejemplo**: `@seo-keyword-strategist analiza la densidad de "precio luz mañana" en esta página y sugiere LSI keywords`

### @seo-cannibalization-detector
**Cuándo usar**: Detectar conflictos entre páginas por mismas keywords
**Ejemplo**: `@seo-cannibalization-detector compara homepage vs precio-mañana para detectar canibalización`

### @seo-content-planner
**Cuándo usar**: Crear outlines de contenido y identificar gaps de temas
**Ejemplo**: `@seo-content-planner crea outline para artículo sobre ahorro con precio luz por horas`

---

## 🚨 CONVERSACIÓN 1: OPTIMIZACIÓN TÉCNICA CRÍTICA
**⏱️ Duración**: 1-2 horas | **🚨 Prioridad**: MÁXIMA

### MENSAJE PARA CLAUDE:

```
Necesito recuperar urgentemente el tráfico perdido en "precio luz mañana". La keyword ha caído de top 3 (12K impresiones diarias) a posición 7.74 (300 impresiones). Necesito optimizar la página /precio-luz-manana/index.html.

## PASO 1: ANÁLISIS CON AGENTES SEO

**USAR PRIMERO ESTOS AGENTES**:

1. `@seo-cannibalization-detector` - Analiza conflicto keywords entre homepage y precio-mañana
2. `@seo-keyword-strategist` - Revisa densidad actual "precio luz mañana" y sugiere LSI keywords
3. `@seo-content-planner` - Valida estructura de contenido propuesta para 1500+ palabras

## PASO 2: TAREAS ESPECÍFICAS IMPLEMENTACIÓN:

### 1. OPTIMIZAR META TAGS
Cambiar el title y description de la página /precio-luz-manana/index.html:

**NUEVO TITLE**: "Precio Luz Mañana 【ACTUALIZADO DIARIO 20:15h】| Apaga Luz"
**NUEVA DESCRIPTION**: "✓ Precio luz mañana hora por hora ➤ Actualizado diariamente 20:15h ⚡ Planifica tu consumo y ahorra hasta 30% ➤ Datos oficiales ESIOS"

### 2. EXPANDIR CONTENIDO (de ~800 a 1500+ palabras)
Añadir estas 5 nuevas secciones H2 con contenido útil:

- **H2**: "Comparativa Precio Hoy vs Mañana" (tabla comparativa visual)
- **H2**: "Mejores Horas para Electrodomésticos Mañana" (recomendaciones prácticas)
- **H2**: "Cómo Planificar tu Consumo para Mañana" (consejos paso a paso)
- **H2**: "Tendencias de Precio por Día de la Semana" (patrones identificables)
- **H2**: "Preguntas Frecuentes Precio Mañana" (FAQ con Schema FAQ)

### 3. MEJORAR SCHEMA MARKUP
Añadir Schema tipo "Dataset" con estos datos:
```json
{
  "@type": "Dataset",
  "name": "Precios electricidad próximo día",
  "description": "Precios oficiales de electricidad para cada hora del día siguiente",
  "temporalCoverage": "Día siguiente",
  "updateFrequency": "Diario a las 20:15h",
  "dataSource": "ESIOS - Red Eléctrica de España"
}
```

### 4. RESOLVER CANIBALIZACIÓN
- Verificar que homepage se enfoca solo en "precio hoy"
- Asegurar que precio-mañana se enfoca solo en keywords "mañana"
- Crear 5-7 enlaces internos desde homepage hacia /precio-luz-manana/

## CHECKLIST OBLIGATORIO:
- [ ] Title y meta description optimizados
- [ ] Contenido expandido con 5 nuevas secciones H2
- [ ] Schema markup Dataset implementado
- [ ] Internal linking desde homepage verificado
- [ ] Canonical tag correcto
- [ ] No duplicación de keywords con homepage

## CRITERIO ÉXITO:
La página debe tener 1500+ palabras, contenido único sobre "mañana" y meta tags optimizados para CTR.

---

**IMPORTANTE**:
- No crear archivos innecesarios. Editar solo /precio-luz-manana/index.html
- Usar agentes SEO antes de implementar cambios
- Verificar que no compite con homepage
```

---

## 📝 CONVERSACIÓN 2: MEJORA CONTENIDO EXISTENTE
**⏱️ Duración**: 1 hora | **🚨 Prioridad**: ALTA

### MENSAJE PARA CLAUDE:

```
Necesito optimizar la homepage y estructura de enlaces para evitar canibalización con /precio-luz-manana/. La homepage debe enfocarse SOLO en "precio hoy".

## PASO 1: VALIDACIÓN CON AGENTES SEO

**USAR PRIMERO**:
1. `@seo-cannibalization-detector` - Verificar que Conversación 1 eliminó la canibalización
2. `@seo-keyword-strategist` - Analizar keywords homepage para asegurar foco en "hoy"

## PASO 2: TAREAS IMPLEMENTACIÓN:

### 1. OPTIMIZAR HOMEPAGE /index.html
**NUEVO TITLE**: "Precio Luz Hoy Hora a Hora ⚡ Actualizado Cada Hora | Apaga Luz"
**NUEVA DESCRIPTION**: "✓ Precio luz HOY actualizado cada hora ➤ Consulta tarifas en tiempo real ⚡ Descubre cuándo es más barata la electricidad"

### 2. CREAR ENLACES INTERNOS ESTRATÉGICOS
Desde homepage hacia /precio-luz-manana/ con estos anchor texts variados:
- "consulta el precio de mañana"
- "precio luz mañana"
- "planifica para mañana"
- "precios del día siguiente"
- "precio electricidad mañana"

Mínimo 5-7 enlaces distribuidos naturalmente en el contenido.

### 3. VERIFICAR SEPARACIÓN DE KEYWORDS
- **Homepage**: Solo "precio hoy", "precio luz hoy", "tarifa hoy"
- **Precio-mañana**: Solo "precio mañana", "precio luz mañana", "tarifa mañana"
- Eliminar cualquier mención de "mañana" en homepage
- Eliminar cualquier mención de "hoy" en precio-mañana

## CHECKLIST OBLIGATORIO:
- [ ] Homepage enfocada exclusivamente en "precio hoy"
- [ ] 5-7 enlaces internos hacia precio-mañana implementados
- [ ] Anchor text diversificado (exact match, partial, branded)
- [ ] Separación clara de keywords entre páginas
- [ ] Meta tags homepage optimizados para "hoy"
- [ ] Verificar que no hay conflicto de keywords

## CRITERIO ÉXITO:
Homepage y precio-mañana deben tener keywords completamente separadas y enlaces internos optimizados.

---

**IMPORTANTE**:
- Solo editar homepage. No tocar /precio-luz-manana/ en esta conversación
- Validar con agentes SEO antes de hacer cambios
```

---

## 📊 CONVERSACIÓN 7: MONITOREO (Usar después de Conversación 1 y 2)
**⏱️ Duración**: 30 minutos | **🚨 Prioridad**: CONTINUA

### MENSAJE PARA CLAUDE:

```
Necesito revisar el estado actual del SEO después de las optimizaciones. Ayúdame a crear un reporte de seguimiento.

## TAREAS DE ANÁLISIS:

### 1. VERIFICAR IMPLEMENTACIÓN
- [ ] ¿Title y description de precio-mañana están optimizados?
- [ ] ¿Homepage tiene enlaces internos hacia precio-mañana?
- [ ] ¿Keywords están separadas correctamente?
- [ ] ¿Schema markup está implementado?

### 2. CREAR TEMPLATE DE MONITOREO
Crear documento para trackear en Google Search Console:

**MÉTRICAS CLAVE**:
- Posición "precio luz mañana" (objetivo: 7.74 → 6.0)
- CTR precio-mañana (objetivo: 1.52% → 2.5%+)
- Impresiones diarias (objetivo: 300 → 500+)
- Clics desde homepage hacia precio-mañana

### 3. PLAN SIGUIENTE FASE
Basado en implementación actual:
- Si todo correcto → Continuar con Conversación 3 (artículo ahorro)
- Si faltan elementos → Completar implementación antes de continuar

## CHECKLIST OBLIGATORIO:
- [ ] Reporte estado implementación completo
- [ ] Template monitoreo para Search Console creado
- [ ] Recomendación clara para siguiente paso
- [ ] Identificar puntos de mejora si los hay

## ENTREGABLES:
1. Documento con estado actual optimizaciones
2. Template para tracking mensual en Search Console
3. Recomendación próxima conversación

---

**OBJETIVO**: Verificar calidad implementación antes de crear contenido adicional.
```

---

## 📝 CONVERSACIÓN 3: PRIMER ARTÍCULO NUEVO
**⏱️ Duración**: 1-2 horas | **🚨 Prioridad**: MEDIA (solo si Conversación 1-2 exitosas)

### MENSAJE PARA CLAUDE:

```
Necesito crear contenido de soporte para capturar keywords de ahorro. Solo ejecutar si las optimizaciones anteriores están completadas.

## PASO 1: PLANIFICACIÓN CON AGENTES SEO

**USAR ANTES DE ESCRIBIR**:
1. `@seo-content-planner` - Crear outline detallado y identificar gaps de contenido
2. `@seo-keyword-strategist` - Analizar keywords "como ahorrar precio luz horas" y variaciones
3. `@seo-cannibalization-detector` - Verificar que no compite con contenido existente

## PASO 2: CREAR ARTÍCULO: "Cómo Ahorrar con el Precio de la Luz por Horas"

### ESPECIFICACIONES:
- **URL**: /noticias/como-ahorrar-precio-luz-por-horas/index.html
- **Target Keywords**: "como ahorrar precio luz horas", "ahorrar luz por horas"
- **Longitud**: 1000 palabras mínimo
- **Objetivo**: Capturar tráfico búsquedas relacionadas con ahorro

### ESTRUCTURA OBLIGATORIA:

**H1**: Cómo Ahorrar con el Precio de la Luz por Horas (exact match keyword)

**H2**: ¿Por qué varía el precio de la luz por horas?
- Explicación simple mercado eléctrico
- Diferencias valle, llano, punta

**H2**: 5 Estrategias Prácticas para Ahorrar
- Electrodomésticos en horas valle
- Planificar consumo anticipado
- Identificar patrones precios
- Evitar horas punta
- Aprovechar fines de semana

**H2**: Ejemplos Reales de Ahorro Mensual
- Familia tipo: ahorro 25€/mes
- Piso pequeño: ahorro 15€/mes
- Casa grande: ahorro 45€/mes

**H2**: Errores Comunes que Debes Evitar
- No planificar consumo
- Usar todos electrodomésticos simultáneamente
- Ignorar precios mañana

**H2**: Herramientas para Optimizar tu Ahorro
- Enlaces internos a homepage y precio-mañana
- Mencionar herramientas apaga-luz

### KEYWORDS SECUNDARIAS INCLUIR:
- "precio luz valle punta"
- "electrodomésticos horas baratas"
- "planificar consumo eléctrico"
- "ahorro factura luz"

### ENLACES INTERNOS OBLIGATORIOS:
- 2 enlaces hacia homepage (precio hoy)
- 2 enlaces hacia /precio-luz-manana/
- 1 enlace hacia página principal desde contexto natural

## CHECKLIST OBLIGATORIO:
- [ ] Artículo 1000+ palabras creado
- [ ] Schema markup Article implementado
- [ ] 5 enlaces internos estratégicos incluidos
- [ ] Meta description optimizada para CTR
- [ ] Keywords secundarias distribuidas naturalmente
- [ ] Estructura H1-H6 correcta

## CRITERIO ÉXITO:
Artículo completo, útil, con enlaces internos optimizados y Schema markup correcto.

---

**IMPORTANTE**:
- Solo ejecutar después de verificar éxito Conversación 1-2
- Usar agentes SEO para planificar antes de escribir
- Validar outline con @seo-content-planner
```

---

## 📝 CONVERSACIÓN 4: SEGUNDO ARTÍCULO ÚTIL
**⏱️ Duración**: 1 hora | **🚨 Prioridad**: MEDIA

### MENSAJE PARA CLAUDE:

```
Crear guía práctica sobre horarios electrodomésticos. Solo ejecutar si artículo anterior está completo y funcionando.

## CREAR ARTÍCULO: "Mejores y Peores Horas para usar Electrodomésticos"

### ESPECIFICACIONES:
- **URL**: /noticias/mejores-horas-electrodomesticos/index.html
- **Target Keywords**: "mejores horas electrodomésticos", "cuando usar lavadora"
- **Longitud**: 800 palabras mínimo
- **Objetivo**: Keywords específicas horarios electrodomésticos

### ESTRUCTURA OBLIGATORIA:

**H1**: Mejores y Peores Horas para usar Electrodomésticos

**H2**: Electrodomésticos de Alto Consumo
Lista con consumos reales:
- Lavadora (1.5-2.5 kWh)
- Lavavajillas (1.5-2 kWh)
- Secadora (2.5-4 kWh)
- Horno (2-3 kWh)
- Vitrocerámica (1.5-3 kWh)

**H2**: Horarios Recomendados por Aparato
**TABLA PRÁCTICA OBLIGATORIA**:
```
Electrodoméstico | Mejores Horas | Peores Horas | Ahorro Estimado/Ciclo
Lavadora        | 01:00-07:00   | 18:00-22:00  | 0.15€
Lavavajillas    | 02:00-08:00   | 19:00-23:00  | 0.12€
Secadora        | 01:00-07:00   | 19:00-22:00  | 0.25€
Horno          | 14:00-16:00   | 20:00-22:00  | 0.20€
```

**H2**: Estrategias de Programación Inteligente
- Usar temporizadores
- Aprovechar tarifas nocturnas
- Concentrar uso en valle

**H2**: Consejos para Optimizar el Consumo
- Cargas completas
- Temperaturas eficientes
- Mantenimiento

### ENLACES INTERNOS:
- 2 enlaces hacia homepage
- 2 enlaces hacia precio-mañana
- 1 enlace hacia artículo ahorro (Conversación 3)

## CHECKLIST OBLIGATORIO:
- [ ] Tabla práctica horarios específicos creada
- [ ] Schema markup con tabla estructurada
- [ ] 5 enlaces internos implementados
- [ ] Cálculos ahorro realistas por aparato
- [ ] Keywords distribuidas naturalmente
- [ ] Meta tags optimizados

---

**IMPORTANTE**: Foco en utilidad práctica y datos concretos de ahorro.
```

---

## 📝 CONVERSACIÓN 5: TERCER ARTÍCULO DE SOPORTE
**⏱️ Duración**: 45 minutos | **🚨 Prioridad**: BAJA

### MENSAJE PARA CLAUDE:

```
Crear contenido para keywords estacionales fin de semana. Solo si artículos anteriores funcionan correctamente.

## CREAR ARTÍCULO: "Precio Luz Fin de Semana vs Entre Semana"

### ESPECIFICACIONES:
- **URL**: /noticias/precio-luz-fin-semana/index.html
- **Target Keywords**: "precio luz fin semana", "luz barata sábado domingo"
- **Longitud**: 600 palabras mínimo
- **Objetivo**: Capturar búsquedas estacionales fin de semana

### ESTRUCTURA SIMPLE:

**H1**: Precio Luz Fin de Semana vs Entre Semana

**H2**: Principales Diferencias de Precio
- Sábados y domingos más baratos
- Menos demanda industrial
- Patrones consumo familiar

**H2**: Mejores Estrategias para Fin de Semana
- Programar electrodomésticos sábado/domingo
- Aprovechar mañanas fin de semana
- Planificar tareas alto consumo

**H2**: Cuánto Puedes Ahorrar
- Comparativa semanal con datos
- Ejemplos prácticos ahorro

### ENLACES INTERNOS:
- 1 enlace homepage
- 1 enlace precio-mañana
- 1 enlace artículo electrodomésticos

## CHECKLIST OBLIGATORIO:
- [ ] Artículo 600+ palabras completo
- [ ] Comparativas claras fin semana vs semana
- [ ] 3 enlaces internos estratégicos
- [ ] Schema markup Article básico
- [ ] Meta description optimizada

---

**IMPORTANTE**: Solo ejecutar si métricas anteriores mejoran.
```

---

## 🎯 ORDEN RECOMENDADO EJECUCIÓN

### **FASE CRÍTICA** (Semanas 1-2):
1. **CONVERSACIÓN 1** → Esperar 1 semana
2. **CONVERSACIÓN 2** → Esperar 1 semana
3. **CONVERSACIÓN 7** (Monitoreo)

### **FASE EXPANSIÓN** (Solo si Fase Crítica exitosa):
4. **CONVERSACIÓN 3**
5. **CONVERSACIÓN 4**
6. **CONVERSACIÓN 7** (Monitoreo intermedio)

### **FASE OPCIONAL** (Solo si todo anterior exitoso):
7. **CONVERSACIÓN 5**

---

## 📊 CRITERIOS DECISIÓN

### ✅ **CONTINUAR** si:
- Posición "precio luz mañana" mejora (7.74 → 6.5 o menos)
- CTR aumenta (1.52% → 2%+)
- Impresiones aumentan (300 → 400+)

### ⚠️ **REVISAR** si:
- Posiciones no mejoran en 2 semanas
- CTR sigue bajo (<2%)
- Errores implementación

### ❌ **PARAR** si:
- Posiciones empeoran
- CTR baja más
- Penalizaciones Google
- Agentes detectan problemas graves canibalización

---

## 🤖 GUÍA ESTRATÉGICA USO AGENTES SEO

### 🔍 **@seo-keyword-strategist**

**Cuándo usarlo**:
- Antes de escribir cualquier contenido nuevo
- Para analizar densidad de keywords existentes
- Cuando necesites variaciones semánticas (LSI keywords)

**Ejemplos de prompts**:
```
@seo-keyword-strategist analiza el contenido de /precio-luz-manana/ y calcula densidad de "precio luz mañana". Sugiere LSI keywords para evitar sobreoptimización.

@seo-keyword-strategist revisa este outline de artículo y sugiere keywords semánticas relacionadas con "ahorrar precio luz horas"
```

### 🔍 **@seo-cannibalization-detector**

**Cuándo usarlo**:
- Antes de cualquier optimización de keywords existentes
- Al crear contenido nuevo que pueda competir
- Para validar separación correcta de keywords entre páginas

**Ejemplos de prompts**:
```
@seo-cannibalization-detector analiza homepage e index.html de precio-luz-manana para detectar solapamiento de keywords "precio luz"

@seo-cannibalization-detector verifica que el nuevo artículo sobre "ahorrar precio luz" no canibalize con contenido existente
```

### 📝 **@seo-content-planner**

**Cuándo usarlo**:
- Al planificar estructura de artículos nuevos
- Para identificar gaps de contenido en el sitio
- Crear outlines detallados con estructura H1-H6

**Ejemplos de prompts**:
```
@seo-content-planner crea outline completo para artículo "Cómo Ahorrar con Precio Luz por Horas" target 1000 palabras, keyword principal "como ahorrar precio luz horas"

@seo-content-planner identifica gaps de contenido en nuestro sitio relacionados con precios electricidad y ahorro energético
```

### 📈 **FLUJO RECOMENDADO CON AGENTES**

#### Para Optimizaciones (Conversaciones 1-2):
1. **@seo-cannibalization-detector** → Identificar problemas actuales
2. **@seo-keyword-strategist** → Analizar densidad y sugerir mejoras
3. **Implementar cambios**
4. **@seo-cannibalization-detector** → Validar que se resolvió conflicto

#### Para Contenido Nuevo (Conversaciones 3-5):
1. **@seo-content-planner** → Crear outline y estructura
2. **@seo-keyword-strategist** → Validar keywords y variaciones
3. **@seo-cannibalization-detector** → Verificar no competencia
4. **Escribir contenido**
5. **@seo-keyword-strategist** → Revisar densidad final

### ⚠️ **ERRORES COMUNES CON AGENTES**

**❌ NO HAGAS**:
- Usar agentes después de escribir contenido (usarlos ANTES)
- Ignorar recomendaciones de canibalización
- Sobreoptimizar keywords según sugerencias sin contexto

**✅ SÍ HACES**:
- Usar agentes como primer paso en cada conversación
- Seguir recomendaciones pero adaptarlas al contexto
- Validar con agentes después de implementar cambios

---

**📅 Última actualización**: 16 septiembre 2025
**👤 Responsable**: Jorge Aznar
**🔄 Próxima revisión**: Después de Conversación 7
**🤖 Agentes SEO**: @seo-keyword-strategist, @seo-cannibalization-detector, @seo-content-planner
**💡 Consejo**: Una conversación por semana máximo. Usar agentes ANTES de implementar.