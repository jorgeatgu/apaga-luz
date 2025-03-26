document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('factura');
  const fileInfo = document.getElementById('file-info');

  if (fileInput && fileInfo) {
    fileInput.addEventListener('change', function () {
      if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        const fileSize = (fileInput.files[0].size / 1024).toFixed(2); // Convertir a KB
        fileInfo.textContent = `Archivo seleccionado: ${fileName} (${fileSize} KB)`;
      } else {
        fileInfo.textContent = 'No se ha seleccionado ningún archivo.';
      }
    });
  }

  // Manejar el envío del formulario
  const formularioAhorro = document.getElementById('formulario-ahorro');

  if (formularioAhorro) {
    formularioAhorro.addEventListener('submit', function (event) {
      event.preventDefault();

      // Validación básica
      const nombre = document.getElementById('nombre').value;
      const email = document.getElementById('email').value;
      const privacidad = document.getElementById('privacidad').checked;

      if (!nombre || !email || !privacidad) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      }

      // Simulación de envío de formulario
      // Aquí iría el código para enviar los datos del formulario
      const submitButton = formularioAhorro.querySelector(
        'button[type="submit"]'
      );
      submitButton.textContent = 'Enviando...';
      submitButton.disabled = true;

      // Simular una respuesta exitosa después de 1 segundo
      setTimeout(function () {
        formularioAhorro.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h3 style="color: #ec7f00; margin-bottom: 15px;">¡Gracias por contactarnos!</h3>
            <p>Hemos recibido tu solicitud y nos pondremos en contacto contigo lo antes posible.</p>
          </div>
        `;
      }, 1000);
    });
  }
});
