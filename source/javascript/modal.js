export function show_modal() {
  setTimeout(() => {
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
            <h1>Datos del precio de la luz</h1>
            <p><a href="https://www.apaga-luz.com/graficas/" class="button">VER</a></p>
            <p><a href="?=" class="reload-button">CERRAR</a></p>
          </center>
        </div>
      `;

      const modalContainer = document.createElement('div');
      modalContainer.innerHTML = modalHtml;

      document.body.appendChild(modalContainer);

      const cerrarEnlaces = document.querySelectorAll(
        '.reload-button, .button'
      );
      cerrarEnlaces.forEach(enlace => {
        enlace.addEventListener('click', () => {
          const now = new Date();
          const expirationDate = new Date(now.getTime() + 3600000);
          const modalState = {
            closed: true,
            expiration: expirationDate.getTime()
          };
          localStorage.setItem('modalState', JSON.stringify(modalState));

          const modal = document.getElementById('modal');
          if (modal) {
            modal.style.display = 'none';
          }
        });
      });
    }
  }, 4250);
}
