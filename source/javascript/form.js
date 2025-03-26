document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('factura');
  const fileInfo = document.getElementById('file-info');
  const formularioAhorro = document.getElementById('formulario-ahorro');

  // Manejo de la visualización del archivo seleccionado
  if (fileInput && fileInfo) {
    fileInput.addEventListener('change', function () {
      if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        const fileSize = (fileInput.files[0].size / 1024).toFixed(2);
        fileInfo.textContent = `Archivo seleccionado: ${fileName} (${fileSize} KB)`;
      } else {
        fileInfo.textContent = 'No se ha seleccionado ningún archivo.';
      }
    });
  }

  // Manejar el envío del formulario a la API
  if (formularioAhorro) {
    formularioAhorro.addEventListener('submit', async function (event) {
      event.preventDefault();

      // Validación básica
      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const privacidad = document.getElementById('privacidad').checked;

      if (!nombre || !email || !privacidad) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }

      // Cambiar el estado del botón
      const submitButton = formularioAhorro.querySelector(
        'button[type="submit"]'
      );
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Enviando...';
      submitButton.disabled = true;

      try {
        // Crear FormData para enviar el formulario con archivos
        const formData = new FormData(formularioAhorro);

        // Enviar el formulario a la API
        const response = await fetch('/api/enviar-formulario', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          // Mostrar mensaje de éxito
          formularioAhorro.innerHTML = `
            <div style="text-align: center; padding: 20px;">
              <h3 style="color: #ec7f00; margin-bottom: 15px;">¡Gracias por contactarnos!</h3>
              <p>Hemos recibido tu solicitud y nos pondremos en contacto contigo lo antes posible.</p>
            </div>
          `;
        } else {
          // Restaurar el botón y mostrar error
          submitButton.textContent = originalText;
          submitButton.disabled = false;
          alert(
            'Ha ocurrido un error al enviar el formulario. Por favor, inténtalo de nuevo.'
          );
        }
      } catch (error) {
        console.error('Error al enviar formulario:', error);
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        alert(
          'Ha ocurrido un error de conexión. Por favor, inténtalo de nuevo más tarde.'
        );
      }
    });
  }
});
