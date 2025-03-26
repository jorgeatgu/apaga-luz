const nodemailer = require('nodemailer');
const formidable = require('formidable-serverless');
const fs = require('fs');
const util = require('util');
const unlinkAsync = util.promisify(fs.unlink);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Límite de tiempo de ejecución para evitar timeouts
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 10000)
  );

  try {
    // Crear una promesa para el parsing del formulario
    const parseForm = () => {
      return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm({
          maxFileSize: 5 * 1024 * 1024, // 5MB máximo
          keepExtensions: true,
        });

        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });
    };

    // Parsear el formulario con control de timeout
    const { fields, files } = await Promise.race([parseForm(), timeoutPromise]);

    // Validar campos requeridos
    if (!fields.nombre || !fields.email) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y email son campos obligatorios'
      });
    }

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Añadir timeout al transporte para evitar esperas largas
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });

    // Preparar adjuntos si hay archivos
    const attachments = [];
    if (files.factura) {
      const file = files.factura;

      // Validar tipo de archivo permitido
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const mimeType = file.type || 'application/octet-stream';

      if (!allowedTypes.includes(mimeType)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de archivo no permitido. Solo se aceptan PDF, JPG o PNG'
        });
      }

      attachments.push({
        filename: file.name,
        path: file.path
      });
    }

    // Formatear el HTML con mejor presentación
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #007bff; margin-bottom: 20px;">Nuevo lead de Apaga Luz</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Nombre:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${fields.nombre}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${fields.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Teléfono:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${fields.telefono || 'No proporcionado'}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Mensaje:</strong></td>
            <td style="padding: 10px;">${fields.mensaje || 'No proporcionado'}</td>
          </tr>
        </table>
        <p style="font-size: 12px; color: #777; margin-top: 20px;">Este correo fue enviado automáticamente desde el formulario de Apaga Luz.</p>
      </div>
    `;

    // Agregar texto plano como alternativa para clientes de correo que no muestran HTML
    const textContent = `
      Nuevo lead de Apaga Luz

      Nombre: ${fields.nombre}
      Email: ${fields.email}
      Teléfono: ${fields.telefono || 'No proporcionado'}
      Mensaje: ${fields.mensaje || 'No proporcionado'}
    `;

    // Configurar email
    const mailOptions = {
      from: `"Formulario Apaga Luz" <${process.env.SMTP_USER}>`,
      to: process.env.EMAIL_TO,
      bcc: process.env.EMAIL_BCC,
      subject: 'Apaga Luz Lead',
      html: htmlContent,
      text: textContent,
      attachments: attachments
    };

    // Enviar email con manejo de errores mejorado
    await transporter.sendMail(mailOptions);

    // Limpiar archivos temporales después de enviar el correo
    if (files.factura) {
      try {
        await unlinkAsync(files.factura.path);
      } catch (cleanupError) {
        console.error('Error al limpiar archivo temporal:', cleanupError);
        // Continuamos a pesar del error de limpieza
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al procesar formulario:', error);

    // Manejar diferentes tipos de errores
    if (error.message === 'Timeout') {
      return res.status(408).json({
        success: false,
        error: 'La solicitud ha tardado demasiado tiempo en procesarse'
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        error: 'Error de conexión con el servidor de correo'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error al enviar el formulario'
    });
  }
}
