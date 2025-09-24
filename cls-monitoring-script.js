// CLS Monitoring Script - Para identificar fuentes específicas de layout shift
// Análisis detallado del problema crítico identificado

const puppeteer = require('puppeteer');

class CLSMonitor {
  constructor() {
    this.url = 'http://localhost:8001';
    this.shifts = [];
    this.observations = [];
  }

  async analyzeLayoutShifts() {
    console.log('🔍 ANÁLISIS ESPECÍFICO DE CUMULATIVE LAYOUT SHIFT');
    console.log('='.repeat(55));

    const browser = await puppeteer.launch({
      headless: false, // Visible para debugging
      devtools: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 667 }); // Mobile viewport

    // Configurar monitoring detallado de CLS
    await page.evaluateOnNewDocument(() => {
      window.clsData = {
        shifts: [],
        timeline: [],
        sources: new Map()
      };

      // PerformanceObserver para layout shifts
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = {
              value: entry.value,
              startTime: entry.startTime,
              hadRecentInput: entry.hadRecentInput,
              sources: []
            };

            // Capturar información de los elementos afectados
            if (entry.sources) {
              entry.sources.forEach(source => {
                shift.sources.push({
                  node: source.node.tagName,
                  className: source.node.className || '',
                  id: source.node.id || '',
                  currentRect: source.currentRect,
                  previousRect: source.previousRect
                });
              });
            }

            window.clsData.shifts.push(shift);
            window.clsData.timeline.push({
              time: entry.startTime,
              type: 'layout-shift',
              value: entry.value,
              elements: shift.sources.length
            });

            console.warn('🚨 Layout Shift detectado:', {
              value: entry.value,
              time: entry.startTime,
              sources: shift.sources.length,
              hadInput: entry.hadRecentInput
            });
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
      }

      // Mutation Observer para cambios DOM
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Element node
                window.clsData.timeline.push({
                  time: performance.now(),
                  type: 'dom-addition',
                  element: node.tagName,
                  className: node.className || '',
                  id: node.id || ''
                });
              }
            });
          }

          if (mutation.type === 'attributes') {
            window.clsData.timeline.push({
              time: performance.now(),
              type: 'attribute-change',
              element: mutation.target.tagName,
              attribute: mutation.attributeName,
              className: mutation.target.className || ''
            });
          }
        });
      });

      // Observar cambios en containers críticos
      document.addEventListener('DOMContentLoaded', () => {
        const containers = [
          '.container-table-price-left',
          '.container-table-price-right',
          '.container-wrapper',
          'main',
          'body'
        ];

        containers.forEach(selector => {
          const element = document.querySelector(selector);
          if (element) {
            mutationObserver.observe(element, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['style', 'class']
            });
          }
        });
      });
    });

    try {
      console.log('🚀 Navegando y monitoreando CLS...');
      await page.goto(this.url, { waitUntil: 'domcontentloaded' });

      // Esperar y monitorear durante carga
      console.log('⏱️ Monitoreando durante carga inicial...');
      await page.waitForSelector('.container-table-price-left', { timeout: 15000 });

      // Esperar estabilización
      await page.waitForTimeout(5000);

      console.log('📊 Simulando interacciones para detectar CLS...');

      // Simular interacciones que podrían causar CLS
      try {
        const checkboxes = await page.$$('input[type="checkbox"]');
        for (let i = 0; i < Math.min(2, checkboxes.length); i++) {
          console.log(`   Clickeando checkbox ${i + 1}...`);
          await checkboxes[i].click();
          await page.waitForTimeout(1000); // Esperar posibles cambios de layout
        }
      } catch (e) {
        console.warn('⚠️ Error simulando interacciones:', e.message);
      }

      // Obtener datos de CLS recopilados
      console.log('📋 Recopilando datos de CLS...');
      const clsData = await page.evaluate(() => window.clsData);

      // Obtener información adicional de la página
      const pageInfo = await page.evaluate(() => {
        return {
          containers: {
            leftTable: {
              element: '.container-table-price-left',
              height: document.querySelector('.container-table-price-left')?.offsetHeight || 0,
              hasContent: !!document.querySelector('.container-table-price-left')?.innerHTML.trim(),
              computedStyle: window.getComputedStyle(document.querySelector('.container-table-price-left') || document.body)
            },
            rightTable: {
              element: '.container-table-price-right',
              height: document.querySelector('.container-table-price-right')?.offsetHeight || 0,
              hasContent: !!document.querySelector('.container-table-price-right')?.innerHTML.trim()
            }
          },
          images: Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            width: img.width,
            height: img.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            hasSize: !!(img.width && img.height)
          })),
          ads: {
            containers: document.querySelectorAll('[id*="ad"], [class*="ad"]').length,
            scripts: document.querySelectorAll('script[src*="googlesyndication"], script[src*="adsystem"]').length
          }
        };
      });

      // Análisis de resultados
      this.analyzeResults(clsData, pageInfo);

    } catch (error) {
      console.error('❌ Error durante análisis:', error);
    } finally {
      await browser.close();
    }
  }

  analyzeResults(clsData, pageInfo) {
    console.log('\n📊 RESULTADOS DEL ANÁLISIS CLS');
    console.log('='.repeat(40));

    const totalCLS = clsData.shifts.reduce((sum, shift) =>
      sum + (shift.hadRecentInput ? 0 : shift.value), 0);

    console.log(`\n🎯 CLS Total: ${totalCLS.toFixed(4)} ${this.getCLSRating(totalCLS)}`);
    console.log(`📈 Layout Shifts detectados: ${clsData.shifts.length}`);

    // Análizar shifts individuales
    if (clsData.shifts.length > 0) {
      console.log('\n🔍 LAYOUT SHIFTS DETECTADOS:');
      console.log('─'.repeat(35));

      clsData.shifts.forEach((shift, i) => {
        console.log(`\n${i + 1}. Shift Value: ${shift.value.toFixed(4)}`);
        console.log(`   Tiempo: ${shift.startTime.toFixed(0)}ms`);
        console.log(`   Input reciente: ${shift.hadRecentInput ? 'Sí' : 'No'}`);
        console.log(`   Elementos afectados: ${shift.sources.length}`);

        shift.sources.forEach((source, j) => {
          console.log(`     ${j + 1}. ${source.node}${source.className ? '.' + source.className : ''}${source.id ? '#' + source.id : ''}`);
          if (source.currentRect && source.previousRect) {
            const heightChange = source.currentRect.height - source.previousRect.height;
            const yChange = source.currentRect.y - source.previousRect.y;
            if (heightChange !== 0) console.log(`        Δ altura: ${heightChange}px`);
            if (yChange !== 0) console.log(`        Δ posición Y: ${yChange}px`);
          }
        });
      });

      // Identificar patrones
      this.identifyPatterns(clsData);
    }

    // Análizar información de containers
    console.log('\n🏗️ ANÁLISIS DE CONTAINERS:');
    console.log('─'.repeat(30));

    Object.entries(pageInfo.containers).forEach(([name, info]) => {
      console.log(`\n${name}:`);
      console.log(`  Altura: ${info.height}px`);
      console.log(`  Tiene contenido: ${info.hasContent ? 'Sí' : 'No'}`);
      if (info.computedStyle) {
        console.log(`  Min-height: ${info.computedStyle.minHeight}`);
        console.log(`  Display: ${info.computedStyle.display}`);
        console.log(`  Position: ${info.computedStyle.position}`);
      }
    });

    // Análizar imágenes
    console.log('\n🖼️ ANÁLISIS DE IMÁGENES:');
    console.log('─'.repeat(25));
    pageInfo.images.forEach((img, i) => {
      console.log(`${i + 1}. ${img.src.split('/').pop()}`);
      console.log(`   Dimensiones especificadas: ${img.hasSize ? 'Sí' : 'No'}`);
      console.log(`   Tamaño: ${img.width}x${img.height}`);
      if (!img.hasSize) {
        console.log(`   ⚠️ SIN DIMENSIONES - Posible causa de CLS`);
      }
    });

    // Recomendaciones específicas
    this.generateSpecificRecommendations(clsData, pageInfo);
  }

  identifyPatterns(clsData) {
    console.log('\n🔍 PATRONES IDENTIFICADOS:');
    console.log('─'.repeat(25));

    // Análizar elementos más afectados
    const elementCounts = {};
    clsData.shifts.forEach(shift => {
      shift.sources.forEach(source => {
        const key = `${source.node}.${source.className}`;
        elementCounts[key] = (elementCounts[key] || 0) + 1;
      });
    });

    const sortedElements = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    if (sortedElements.length > 0) {
      console.log('Elementos más problemáticos:');
      sortedElements.forEach(([element, count], i) => {
        console.log(`  ${i + 1}. ${element}: ${count} shifts`);
      });
    }

    // Análizar timing
    const avgShiftTime = clsData.shifts.length > 0
      ? clsData.shifts.reduce((sum, s) => sum + s.startTime, 0) / clsData.shifts.length
      : 0;

    console.log(`\nTiming promedio de shifts: ${avgShiftTime.toFixed(0)}ms`);

    if (avgShiftTime < 1000) {
      console.log('📊 Shifts ocurren durante carga inicial - Optimizar critical path');
    } else if (avgShiftTime > 3000) {
      console.log('📊 Shifts tardíos - Posible contenido lazy load o ads');
    }
  }

  generateSpecificRecommendations(clsData, pageInfo) {
    console.log('\n💡 RECOMENDACIONES ESPECÍFICAS:');
    console.log('─'.repeat(35));

    const recommendations = [];

    // CLS alto
    const totalCLS = clsData.shifts.reduce((sum, shift) =>
      sum + (shift.hadRecentInput ? 0 : shift.value), 0);

    if (totalCLS > 0.1) {
      recommendations.push({
        priority: 'CRÍTICA',
        issue: `CLS total ${totalCLS.toFixed(4)} excede límite (0.1)`,
        solutions: [
          'Implementar skeleton loading para tablas de precios',
          'Reservar espacio específico para contenido dinámico',
          'Precargar y dimensionar elementos variables'
        ]
      });
    }

    // Containers sin altura fija
    Object.entries(pageInfo.containers).forEach(([name, info]) => {
      if (info.height < 100 && info.hasContent) {
        recommendations.push({
          priority: 'ALTA',
          issue: `Container ${name} muy bajo (${info.height}px)`,
          solutions: [
            `Establecer min-height para ${info.element}`,
            'Implementar CSS containment',
            'Precargar estructura del contenido'
          ]
        });
      }
    });

    // Imágenes sin dimensiones
    const imagesWithoutSize = pageInfo.images.filter(img => !img.hasSize);
    if (imagesWithoutSize.length > 0) {
      recommendations.push({
        priority: 'MEDIA',
        issue: `${imagesWithoutSize.length} imágenes sin dimensiones`,
        solutions: [
          'Especificar width/height en HTML',
          'Usar aspect-ratio CSS',
          'Implementar lazy loading con placeholders'
        ]
      });
    }

    // Mostrar recomendaciones
    recommendations.forEach((rec, i) => {
      const emoji = rec.priority === 'CRÍTICA' ? '🚨' : rec.priority === 'ALTA' ? '🔴' : '🟡';
      console.log(`\n${i + 1}. ${emoji} [${rec.priority}] ${rec.issue}`);
      rec.solutions.forEach((sol, j) => {
        console.log(`   ${j === 0 ? '💡' : '  '} ${sol}`);
      });
    });

    // Código específico para fix
    console.log('\n🔧 CÓDIGO SUGERIDO PARA FIX:');
    console.log('─'.repeat(30));

    console.log(`
/* CSS - Añadir a critical styles */
.container-table-price-left,
.container-table-price-right {
  min-height: 400px;
  contain: layout style;
}

/* Skeleton loader */
.price-skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  height: 60px;
  margin: 8px 0;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`);

    console.log(`
// JavaScript - Prevenir CLS durante carga
function loadPricesWithCLSProtection() {
  const containers = ['.container-table-price-left', '.container-table-price-right'];

  containers.forEach(selector => {
    const container = document.querySelector(selector);
    if (container) {
      // Reservar altura antes de cargar
      const currentHeight = container.offsetHeight;
      container.style.minHeight = Math.max(currentHeight, 400) + 'px';

      // Mostrar skeleton
      container.innerHTML = '<div class="price-skeleton"></div>'.repeat(6);
    }
  });

  // Luego cargar datos reales...
}
`);

    console.log('\n='.repeat(55));
  }

  getCLSRating(cls) {
    if (cls <= 0.1) return '✅ Good';
    if (cls <= 0.25) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }
}

// Ejecutar análisis
async function runCLSAnalysis() {
  const monitor = new CLSMonitor();
  await monitor.analyzeLayoutShifts();
}

if (require.main === module) {
  runCLSAnalysis();
}

module.exports = CLSMonitor;