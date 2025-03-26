const nodemailer = require('nodemailer');
const formidable = require('formidable-serverless');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Parsear el formulario con archivos
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al procesar el formulario' });
    }

    try {
      // Configurar transporte de correo
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      // Preparar adjuntos si hay archivos
      const attachments = [];
      if (files.factura) {
        attachments.push({
          filename: files.factura.name,
          path: files.factura.path
        });
      }

      // Configurar email
      const mailOptions = {
        from: `"Formulario Apaga Luz" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_TO,
        bcc: process.env.EMAIL_BCC,
        subject: 'Apaga Luz Lead',
        html: `
          <h2>Nuevo lead de Apaga Luz</h2>
          <p><strong>Nombre:</strong> ${fields.nombre}</p>
          <p><strong>Email:</strong> ${fields.email}</p>
          <p><strong>Teléfono:</strong> ${fields.telefono || 'No proporcionado'}</p>
          <p><strong>Mensaje:</strong> ${fields.mensaje || 'No proporcionado'}</p>
        `,
        attachments: attachments
      };

      // Enviar email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error al enviar email:', error);
      res.status(500).json({ error: 'Error al enviar el email' });
    }
  });
}
