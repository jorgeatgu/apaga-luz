# 📋 Mensaje Prototipo para Optimizaciones INP

## Copiar y pegar este mensaje en futuras conversaciones:

---

Hola, necesito continuar con las optimizaciones de INP (Interaction to Next Paint) para el proyecto apaga-luz.com.

## Contexto del Proyecto:
- **Stack**: HTML, CSS, JavaScript vanilla + Vite (sin framework)
- **Problema**: INP > 200ms en móvil según Google Search Console
- **Restricciones**: Mantener Google AdSense y Analytics funcionando
- **Documentos de referencia**:
  - `/OPTIMIZACIONES_INP_ROADMAP.md` - Plan completo de optimización
  - `/OPTIMIZACIONES_INP.md` - Detalles técnicos de refactorización
  - `/CLAUDE.md` - Instrucciones SEO del proyecto
  - `/source/javascript/inp-optimizer.js` - Clase helper para optimizaciones

## Métricas Actuales:
| Página | INP | Performance |
|--------|-----|-------------|
| Homepage (/) | 244ms | 98/100 |
| Precio luz mañana (/precio-luz-manana/) | 165ms | 98/100 |
| Gráficas (/graficas/) | 196ms | 73/100 |

## Problema Principal Identificado:
- D3.js en página de gráficas causa TBT de 1,720ms con long tasks de hasta 975ms
- Event handlers sin optimizar (sin throttling/debouncing apropiado)
- Scripts third-party (AdSense) bloqueando main thread

## Trabajo Ya Completado:
- ✅ Análisis completo de performance con agentes especializados
- ✅ Refactorización inicial del código (archivos en /source/javascript/)
- ✅ Creación de inp-optimizer.js con utilidades de optimización
- ✅ Documentación del plan en OPTIMIZACIONES_INP_ROADMAP.md

## Tarea Específica para Esta Sesión:
[ESPECIFICAR AQUÍ LA FASE O TAREA ESPECÍFICA]

### Ejemplos de tareas específicas:
- "Implementar Fase 1.1: Event Handlers y Task Scheduling"
- "Optimizar D3.js en /source/javascript/line_chart.js con Web Workers"
- "Configurar Partytown para aislar scripts de AdSense"
- "Implementar DOM batching en las tablas de precios"
- "Configurar code splitting en Vite para reducir bundle size"

## Comandos Útiles:
```bash
# Servidor local
npm run serve

# Build de producción
npm run build

# Analizar bundle
npm run build -- --analyze

# Lighthouse móvil
npx lighthouse http://localhost:5173 --view --form-factor=mobile
```

## Resultados Esperados:
- Reducir INP a < 200ms en todas las páginas
- Mantener funcionalidad de ads y analytics
- No romper ninguna funcionalidad existente
- Seguir las mejores prácticas SEO del proyecto

---

## 📝 Notas Adicionales para la Conversación:

### Si es la primera optimización práctica:
"Esta es mi primera sesión implementando las optimizaciones. Por favor, revisa primero el estado actual del código y el documento OPTIMIZACIONES_INP_ROADMAP.md"

### Si es una continuación:
"En la sesión anterior completamos [DESCRIBIR LO COMPLETADO]. Ahora necesito continuar con [SIGUIENTE TAREA]"

### Si hay problemas específicos:
"He notado que [DESCRIBIR PROBLEMA]. Necesito ayuda para solucionarlo manteniendo las optimizaciones INP"

### Para validar cambios:
"Después de implementar [CAMBIOS], necesito validar que:
1. INP se ha reducido
2. AdSense/Analytics siguen funcionando
3. No hay errores en consola
4. Performance score mejora en Lighthouse"

---

## 🎯 Checklist Rápido Pre-Conversación:

Antes de iniciar una nueva conversación, verifica:
- [ ] ¿Tienes claro qué fase/tarea específica quieres abordar?
- [ ] ¿Has revisado qué archivos se modificarán?
- [ ] ¿El servidor local está funcionando? (`npm run serve`)
- [ ] ¿Tienes backup del código actual?
- [ ] ¿Sabes cómo validarás los cambios?

## 🔗 Referencias Rápidas:

### Archivos Clave a Optimizar:
- `/source/javascript/main.js` - Archivo principal
- `/source/javascript/line_chart.js` - Gráficos D3 (problema crítico)
- `/source/javascript/table.js` - Tablas de precios
- `/source/javascript/visualizations.js` - Carga de visualizaciones
- `/index.html`, `/precio-luz-manana/index.html`, `/graficas/index.html` - Páginas afectadas

### Métricas a Monitorear:
- INP (Interaction to Next Paint) < 200ms
- TBT (Total Blocking Time) < 300ms
- Long Tasks < 50ms
- Performance Score > 90

### Herramientas de Validación:
- [PageSpeed Insights](https://pagespeed.web.dev/analysis/https-www-apaga-luz-com/fm6t0v5x05?form_factor=mobile)
- Chrome DevTools Performance Tab
- Search Console Core Web Vitals (validar después de 7 días en producción)

---

**Tip**: Copia solo las secciones relevantes según tu necesidad específica. Para tareas simples, usa la versión corta. Para implementaciones complejas o primeras sesiones, usa la versión completa.