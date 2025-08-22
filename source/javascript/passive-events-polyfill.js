// Polyfill y configuración para passive event listeners
// Mejora el INP al permitir que el navegador optimice el scrolling

(function () {
  // Detectar soporte para passive listeners
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true;
        return true;
      }
    });
    window.addEventListener('testPassive', null, opts);
    window.removeEventListener('testPassive', null, opts);
  } catch (e) {}

  // Configurar opciones por defecto para eventos comunes
  const passiveEvents = [
    'scroll',
    'wheel',
    'touchstart',
    'touchmove',
    'touchenter',
    'touchend',
    'touchleave',
    'mouseout',
    'mouseleave',
    'mouseup',
    'mousedown',
    'mousemove',
    'mouseenter',
    'mousewheel',
    'mouseover'
  ];

  // Override addEventListener para usar passive por defecto en eventos de scroll/touch
  if (supportsPassive) {
    const originalAddEventListener = EventTarget.prototype.addEventListener;

    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options
    ) {
      const isPassiveEvent = passiveEvents.includes(type);

      // Si es un evento que debe ser passive y no se especificaron opciones
      if (
        isPassiveEvent &&
        (options === undefined || options === true || options === false)
      ) {
        options = { passive: true, capture: options === true };
      }
      // Si se pasó un objeto pero no tiene la propiedad passive definida
      else if (
        isPassiveEvent &&
        typeof options === 'object' &&
        !('passive' in options)
      ) {
        options.passive = true;
      }

      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  // Optimizar eventos de scroll globales
  if (supportsPassive) {
    // Throttle para scroll events
    let scrolling = false;
    let scrollEndTimer = null;

    const handleScrollStart = () => {
      if (!scrolling) {
        scrolling = true;
        document.body.classList.add('is-scrolling');
      }

      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        scrolling = false;
        document.body.classList.remove('is-scrolling');
      }, 150);
    };

    // Usar passive para mejor rendimiento
    window.addEventListener('scroll', handleScrollStart, { passive: true });
  }

  // Optimizar eventos touch para móvil
  if ('ontouchstart' in window && supportsPassive) {
    // Prevenir el delay de 300ms en clicks móviles
    let touchStartTime;
    let touchStartX;
    let touchStartY;

    document.addEventListener(
      'touchstart',
      e => {
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    document.addEventListener(
      'touchend',
      e => {
        const touchEndTime = Date.now();
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        // Si fue un tap rápido sin movimiento significativo
        const tapDuration = touchEndTime - touchStartTime;
        const tapDistance = Math.sqrt(
          Math.pow(touchEndX - touchStartX, 2) +
            Math.pow(touchEndY - touchStartY, 2)
        );

        if (tapDuration < 200 && tapDistance < 10) {
          // Fast tap detected
          e.target.classList.add('tap-feedback');
          setTimeout(() => {
            e.target.classList.remove('tap-feedback');
          }, 200);
        }
      },
      { passive: true }
    );
  }

  // Exportar función helper para usar en otros módulos
  window.getPassiveOptions = function (options = {}) {
    if (!supportsPassive) return options;

    return {
      ...options,
      passive: options.passive !== false
    };
  };

  // Marcar que el polyfill está cargado
  window.__passiveEventsPolyfill = true;
})();
