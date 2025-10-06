import './../styles/styles.css';
import { throttle } from './performance-utils.js';
import { inpOptimizer } from './inp-optimizer.js';
import { adsOptimizer } from './ads-optimizer.js';

document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');

  if (menuToggle) {
    // Optimizar click handler con INP optimizer
    const optimizedMenuToggle = inpOptimizer.createOptimizedHandler(
      function () {
        header.classList.toggle('menu-open');
        const isExpanded = header.classList.contains('menu-open');
        menuToggle.setAttribute('aria-expanded', isExpanded);

        if (isExpanded) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      },
      { priority: 'high' }
    );

    menuToggle.addEventListener('click', optimizedMenuToggle, {
      passive: false
    });
  }

  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    // Usar passive listener donde sea posible
    const handleDropdownClick = function (e) {
      if (window.innerWidth < 992) {
        e.preventDefault();
        const parent = this.closest('.has-dropdown');
        parent.classList.toggle('open');
      }
    };

    toggle.addEventListener('click', handleDropdownClick, { passive: false });
  });

  const navLinks = document.querySelectorAll(
    '.nav-link:not(.dropdown-toggle), .dropdown-item'
  );

  navLinks.forEach(link => {
    // Optimizar con passive listener
    const handleNavClick = function () {
      if (window.innerWidth < 992) {
        requestAnimationFrame(() => {
          header.classList.remove('menu-open');
          if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
          }
          document.body.style.overflow = '';
        });
      }
    };

    link.addEventListener('click', handleNavClick, { passive: true });
  });

  // Optimizar resize con throttling
  const handleResize = throttle(
    function () {
      if (window.innerWidth >= 992) {
        requestAnimationFrame(() => {
          header.classList.remove('menu-open');
          if (menuToggle) {
            menuToggle.setAttribute('aria-expanded', 'false');
          }
          document.body.style.overflow = '';

          document.querySelectorAll('.has-dropdown.open').forEach(item => {
            item.classList.remove('open');
          });
        });
      }
    },
    250,
    { trailing: true }
  );

  window.addEventListener('resize', handleResize, { passive: true });

  // Cleanup
  window.addEventListener(
    'beforeunload',
    () => {
      window.removeEventListener('resize', handleResize);
    },
    { once: true }
  );
});
