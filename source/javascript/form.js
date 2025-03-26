document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formulario-ahorro');
  const fileInput = document.getElementById('factura');
  const fileInfo = document.getElementById('file-info');

  // Actualizar la información del archivo seleccionado
  if (fileInput && fileInfo) {
    fileInput.addEventListener('change', function () {
      if (fileInput.files.length > 0) {
        fileInfo.textContent = fileInput.files[0].name;
      } else {
        fileInfo.textContent = 'No se ha seleccionado ningún archivo.';
      }
    });
  }

  // Manejar el envío del formulario
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // Validar campos requeridos
      const nombre = document.getElementById('nombre');
      const email = document.getElementById('email');
      const privacidad = document.getElementById('privacidad');

      if (!nombre.value.trim()) {
        alert('Por favor, introduce tu nombre y apellidos.');
        nombre.focus();
        return;
      }

      if (!email.value.trim()) {
        alert('Por favor, introduce tu email.');
        email.focus();
        return;
      }

      if (!privacidad.checked) {
        alert('Debes aceptar la política de privacidad.');
        return;
      }

      // Cambiar estado del botón
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Enviando...';
      submitButton.disabled = true;

      // Crear FormData para enviar (incluye archivos)
      const formData = new FormData(form);

      // Enviar al endpoint de Vercel
      fetch('/api/enviar-formulario', {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
          }
          return response.json();
        })
        .then(data => {
          if (data.success) {
            alert(
              '¡Gracias por contactar con nosotros! En breve nos pondremos en contacto contigo.'
            );
            form.reset();
            fileInfo.textContent = 'No se ha seleccionado ningún archivo.';
          } else {
            alert(
              'Ha ocurrido un error al enviar el formulario. Por favor, inténtalo de nuevo más tarde.'
            );
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert(
            'Ha ocurrido un error al enviar el formulario. Por favor, inténtalo de nuevo más tarde.'
          );
        })
        .finally(() => {
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        });
    });
  }
});
