// Módulo centralizado de navegación - Optimizado para INP
class NavigationManager {
  constructor() {
    this.header = null;
    this.menuToggle = null;
    this.dropdownToggles = null;
    this.navLinks = null;
    this.isMenuOpen = false;
    this.resizeTimer = null;
    this.initialized = false;
  }

  init() {
    // Evitar inicialización múltiple
    if (this.initialized) return;

    // Cache de elementos DOM
    this.header = document.querySelector('.site-header');
    this.menuToggle = document.querySelector('.menu-toggle');
    this.dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    this.navLinks = document.querySelectorAll(
      '.nav-link:not(.dropdown-toggle), .dropdown-item'
    );

    if (!this.menuToggle || !this.header) return;

    // Usar delegación de eventos para reducir listeners
    this.setupEventDelegation();
    this.setupResizeHandler();

    this.initialized = true;
  }

  setupEventDelegation() {
    // Un solo listener para todo el header usando delegación
    this.header.addEventListener('click', this.handleHeaderClick.bind(this), {
      passive: true
    });

    // Menu toggle específico con passive para mejor INP
    this.menuToggle.addEventListener(
      'click',
      this.handleMenuToggle.bind(this),
      { passive: false }
    );
  }

  handleHeaderClick(e) {
    const target = e.target;

    // Handle dropdown toggles
    if (
      target.classList.contains('dropdown-toggle') &&
      window.innerWidth < 992
    ) {
      e.preventDefault();
      requestAnimationFrame(() => {
        const parent = target.closest('.has-dropdown');
        if (parent) {
          parent.classList.toggle('open');
        }
      });
      return;
    }

    // Handle nav links
    if (
      (target.classList.contains('nav-link') &&
        !target.classList.contains('dropdown-toggle')) ||
      target.classList.contains('dropdown-item')
    ) {
      if (window.innerWidth < 992 && this.isMenuOpen) {
        requestAnimationFrame(() => {
          this.closeMenu();
        });
      }
    }
  }

  handleMenuToggle(e) {
    e.preventDefault();

    // Usar requestAnimationFrame para operaciones DOM
    requestAnimationFrame(() => {
      this.isMenuOpen = !this.isMenuOpen;

      if (this.isMenuOpen) {
        this.openMenu();
      } else {
        this.closeMenu();
      }
    });
  }

  openMenu() {
    this.header.classList.add('menu-open');
    this.menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.header.classList.remove('menu-open');
    this.menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    this.isMenuOpen = false;
  }

  setupResizeHandler() {
    // Throttled resize handler para mejor performance
    let resizing = false;

    window.addEventListener(
      'resize',
      () => {
        if (!resizing) {
          resizing = true;
          requestAnimationFrame(() => {
            this.handleResize();
            resizing = false;
          });
        }
      },
      { passive: true }
    );
  }

  handleResize() {
    if (window.innerWidth >= 992) {
      this.closeMenu();

      // Cerrar todos los dropdowns abiertos
      const openDropdowns = document.querySelectorAll('.has-dropdown.open');
      openDropdowns.forEach(item => {
        item.classList.remove('open');
      });
    }
  }

  // Método para limpiar event listeners si es necesario
  destroy() {
    if (this.header) {
      this.header.removeEventListener('click', this.handleHeaderClick);
    }
    if (this.menuToggle) {
      this.menuToggle.removeEventListener('click', this.handleMenuToggle);
    }
    this.initialized = false;
  }
}

// Singleton para evitar múltiples instancias
let navigationInstance = null;

export function initNavigation() {
  if (!navigationInstance) {
    navigationInstance = new NavigationManager();
  }
  navigationInstance.init();
  return navigationInstance;
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation, { once: true });
} else {
  // DOM ya está cargado
  initNavigation();
}
