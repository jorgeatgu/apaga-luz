import './../styles/styles.css';

document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      header.classList.toggle('menu-open');
      const isExpanded = header.classList.contains('menu-open');
      this.setAttribute('aria-expanded', isExpanded);

      if (isExpanded) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function (e) {
      if (window.innerWidth < 992) {
        e.preventDefault();
        const parent = this.closest('.has-dropdown');
        parent.classList.toggle('open');
      }
    });
  });

  const navLinks = document.querySelectorAll(
    '.nav-link:not(.dropdown-toggle), .dropdown-item'
  );

  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      if (window.innerWidth < 992) {
        header.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth >= 992) {
      header.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';

      document.querySelectorAll('.has-dropdown.open').forEach(item => {
        item.classList.remove('open');
      });
    }
  });
});
