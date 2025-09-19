import transporter from "../config/email.js";

export default class Mailer {

  static async sendVerifyEmailMail(token, to, html) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject: "Verifica tu correo",
        text: "Por favor da click en el boton para confirmar tu correo",
        html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  </head>
  <body>
    <h1>Bienvenido a MateriaLab</h1>
    <p>
      Para poder acceder a la app por favor confirma tu correo dando click en este link
         <a class="confirm-link" href="http://localhost:5173/api/users/verify_email?token=${token}">Confirmar Email</a>
    </p>
     </body>
</html>`
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

}
