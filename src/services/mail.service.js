import nodemailer from 'nodemailer';

// Transporter configurable mediante variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: process.env.MAIL_SECURE === 'true', // true para puerto 465, false para otros
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  // Buenas prácticas de conexión profesional
  pool: true, // Reutiliza conexiones SMTP para mejor rendimiento
  maxConnections: 5,
  maxMessages: 100,
});

export class MailService {
  /**
   * Envía correo de confirmación de reserva con sistema de reintentos
   */
  static async sendTicketConfirmation(userEmail, ticketDetails, retries = 2) {
    const fromAddress = process.env.MAIL_FROM || `"Plataforma de Eventos" <${process.env.MAIL_USER}>`;

    const mailOptions = {
      from: fromAddress,
      to: userEmail,
      subject: `Confirmación de Inscripción - Código #${ticketDetails.reservationCode}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
            .card { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; }
            .header h2 { color: #2c3e50; margin: 0; font-size: 22px; }
            .details { background-color: #f8f9fa; border-left: 4px solid #27ae60; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .details p { margin: 6px 0; color: #333; font-size: 14px; }
            .code { color: #27ae60; font-weight: bold; font-family: monospace; font-size: 16px; }
            .footer { text-align: center; color: #95a5a6; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>¡Inscripción Confirmada! 🎉</h2>
            </div>
            <p>Hola, tu lugar en el evento está asegurado. Presentá el siguiente código al ingresar:</p>
            <div class="details">
              <p><strong>Evento:</strong> ${ticketDetails.eventTitle}</p>
              <p><strong>Código de Reserva:</strong> <span class="code">${ticketDetails.reservationCode}</span></p>
              <p><strong>Entradas:</strong> ${ticketDetails.quantity}</p>
            </div>
            <div class="footer">
              <p>Plataforma de Eventos e Inscripciones • Notificación automática</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[MailService] Email enviado exitosamente a ${userEmail} (ID: ${info.messageId})`);
        return info;
      } catch (error) {
        console.error(`[MailService] Intento ${attempt} fallido para ${userEmail}:`, error.message);
        
        if (attempt > retries) {
          // Si agotó los reintentos, lo dejamos logueado sin romper el hilo del cliente
          console.error(`[MailService] Error crítico: No se pudo enviar el correo a ${userEmail} tras ${retries + 1} intentos.`);
          return null;
        }

        // Espera un segundo antes del reintento
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}