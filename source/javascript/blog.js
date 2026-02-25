/**
 * Script para la funcionalidad de los artículos del blog
 * Incluye: tiempo de lectura, efectos de tablas, compartir en redes sociales
 */

document.addEventListener('DOMContentLoaded', () => {
  // Añadir la clase single-post al body para aplicar estilos específicos
  document.body.classList.add('single-post');

  // Calcular tiempo de lectura automáticamente
  calcularTiempoLectura();

  // Añadir efectos interactivos a las tablas
  inicializarEfectosTablas();

  // Configurar botones de compartir
  configurarBotonesCompartir();
});

/**
 * Calcula el tiempo estimado de lectura basado en el número de palabras
 * Asume una velocidad de lectura de 200 palabras por minuto
 */
function calcularTiempoLectura() {
  const article = document.querySelector('.post-container');
  if (!article) return;

  const text = article.textContent;
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // 200 palabras por minuto

  const readingTimeEl = document.querySelector('.reading-time');
  if (readingTimeEl) {
    readingTimeEl.textContent = `${readingTime} min de lectura`;
  }
}

/**
 * Añade efectos interactivos a las tablas del artículo
 * En dispositivos táctiles no hay hover real, se omite completamente
 */
function inicializarEfectosTablas() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  const tables = document.querySelectorAll('.post-table');

  tables.forEach(table => {
    table.addEventListener('mouseover', e => {
      const cell = e.target.closest('td');
      if (!cell) return;
      const idx = Array.from(cell.parentNode.children).indexOf(cell);
      table
        .querySelectorAll(`td:nth-child(${idx + 1})`)
        .forEach(el => el.classList.add('highlighted'));
    });

    table.addEventListener('mouseout', e => {
      if (!e.relatedTarget?.closest('.post-table')) {
        table
          .querySelectorAll('td.highlighted')
          .forEach(el => el.classList.remove('highlighted'));
      }
    });
  });
}

/**
 * Configura los botones de compartir para redes sociales
 */
function configurarBotonesCompartir() {
  const shareButtons = document.querySelectorAll('.social-share-button');
  if (shareButtons.length === 0) return;

  const pageUrl = encodeURIComponent(window.location.href);
  const pageTitle = encodeURIComponent(document.title);

  shareButtons.forEach(button => {
    if (button.classList.contains('share-twitter')) {
      button.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
    } else if (button.classList.contains('share-facebook')) {
      button.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
    } else if (button.classList.contains('share-whatsapp')) {
      button.href = `https://api.whatsapp.com/send?text=${pageTitle}%20${pageUrl}`;
    }
  });
}

/**
 * Función para manejar la animación de entrada al desplazarse
 * Esto añade una animación suave a los elementos cuando aparecen en la pantalla
 */
function inicializarAnimacionesDesplazamiento() {
  const elementos = document.querySelectorAll(
    '.post-subtitle, .post-minititle, .post-table, .cta-container'
  );

  const opciones = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1 // 10% del elemento debe ser visible
  };

  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('animated');
        observador.unobserve(entrada.target); // Dejar de observar una vez animado
      }
    });
  }, opciones);

  elementos.forEach(elemento => {
    observador.observe(elemento);
  });
}

// Inicializar animaciones en carga diferida para no bloquear el renderizado inicial
window.addEventListener('load', () => {
  inicializarAnimacionesDesplazamiento();
});
