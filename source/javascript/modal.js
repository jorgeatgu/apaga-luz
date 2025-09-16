import { inpOptimizer } from './inp-optimizer.js';

export function show_modal() {
  // Usar requestIdleCallback para mejor INP
  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        initModal();
      },
      { timeout: 5000 }
    );
  } else {
    setTimeout(() => {
      initModal();
    }, 4250);
  }
}

function initModal() {
  const modalState = JSON.parse(localStorage.getItem('modalState'));
  if (
    !modalState ||
    (modalState.closed && Date.now() > modalState.expiration)
  ) {
    let user_hour = new Date().getHours();
    let user_minutes = new Date().getMinutes();
    const QUARTER_PAST_ONE = 790;
    user_hour = user_hour < 10 ? `0${user_hour}` : user_hour;
    user_minutes = user_minutes < 10 ? `0${user_minutes}` : user_minutes;

    const its_time_to_show_the_content =
      user_hour * 60 + +user_minutes >= QUARTER_PAST_ONE && user_hour < 24;

    const currentURL = window.location.href;
    const modalHtml = its_time_to_show_the_content
      ? `
      <div class="modal-container">
      <div class="modal-background"></div>
        <div id="modal" class="modal-adsense">
          <center>
            <h3>Precio de la luz mañana</h3>
            <p><a href="https://www.apaga-luz.com/precio-luz-manana/" class="button">VER</a></p>
            <p><a href="?=" class="reload-button">CERRAR</a></p>
          </center>
        </div>
      `
      : `
      <div class="modal-container">
      <div class="modal-background"></div>
        <div id="modal" class="modal-adsense">
          <center>
            <h3>Datos del precio de la luz</h3>
            <p><a href="https://www.apaga-luz.com/graficas/" class="button">VER</a></p>
            <p><a href="?=" class="reload-button">CERRAR</a></p>
          </center>
        </div>
      `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;

    document.body.appendChild(modalContainer);

    const cerrarEnlaces = document.querySelectorAll('.reload-button, .button');
    // Usar delegación de eventos para optimizar INP
    const modalContainer = document.querySelector('.modal-container');
    if (modalContainer) {
      const optimizedModalClick = inpOptimizer.createOptimizedHandler(
        function (e) {
          const target = e.target;

          if (
            target.classList.contains('reload-button') ||
            target.classList.contains('button')
          ) {
            e.preventDefault();

            const now = new Date();
            const expirationDate = new Date(now.getTime() + 3600000);
            const modalState = {
              closed: true,
              expiration: expirationDate.getTime()
            };
            localStorage.setItem('modalState', JSON.stringify(modalState));

            requestAnimationFrame(() => {
              const modal = document.getElementById('modal');
              if (modal) {
                modal.style.display = 'none';
              }
            });
          }
        },
        { priority: 'high' }
      );

      modalContainer.addEventListener('click', optimizedModalClick, {
        passive: false
      });
    }
  }
}
