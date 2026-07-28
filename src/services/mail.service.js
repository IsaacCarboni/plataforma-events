import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false, // TLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export class MailService {
  /**
   * Envía correo de confirmación con el código de reserva
   */
  static async sendTicketConfirmation(userEmail, ticketDetails) {
    try {
      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: userEmail,
        subject: `Confirmación de Inscripción - Código #${ticketDetails.reservationCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #2c3e50;">¡Inscripción Confirmada! 🎉</h2>
            <p>Hola, tu lugar en el evento está asegurado.</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Evento:</strong> ${ticketDetails.eventTitle}</p>
              <p style="margin: 5px 0;"><strong>Código de Reserva:</strong> <span style="color: #27ae60; font-weight: bold;">${ticketDetails.reservationCode}</span></p>
              <p style="margin: 5px 0;"><strong>Entradas:</strong> ${ticketDetails.quantity}</p>
            </div>
            <p style="color: #7f8c8d; font-size: 12px;">Plataforma de Eventos e Inscripciones.</p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      console.error('Error enviando email con Nodemailer:', error);
      // No arrojamos el error para no romper la respuesta HTTP del ticket si falla el SMTP
    }
  }
}