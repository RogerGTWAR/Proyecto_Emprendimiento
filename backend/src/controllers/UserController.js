import { OAuth2Client } from "google-auth-library";
import prisma from "../database.js";
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import Mailer from "../utils/Mailer.js";

const { AuthorizationCode } = await import("simple-oauth2");

const client = new AuthorizationCode({
  client: {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET
  },
  auth: {
    tokenHost: "https://oauth2.googleapis.com",
    authorizePath: "https://accounts.google.com/o/oauth2/auth",
    tokenPath: "/token"
  }
});

const redirectUri = 'http://localhost:3000/api/users/register/oauth';

export default class UserController {

  static async register(req, res) {

    const {
      company_name,
      company_type,
      email,
      password
    } = req.body;

    const saltRounds = 10;

    try {
      const hashedPass = await bcrypt.hash(password, saltRounds);

      const user = await prisma.users.findUnique({
        where: {
          email
        }
      });

      if (user) {
        return res.status(400).json({
          ok: false,
          msg: "Ya existe una cuenta con dichas credenciales"
        });
      }

      const newUser = await prisma.users.create({
        data: {
          email,
          password: hashedPass,
          is_owner: true
        }
      });

      await prisma.companies.create({
        data: {
          name: company_name,
          type: company_type,
          user_id: newUser.id
        }
      });

      const jwt = JWT.sign({
        userId: newUser.id
      }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d'
      });

      if (!await Mailer.sendVerifyEmailMail(jwt, newUser.email)) {
        return res.status(500).json({
          ok: false,
          msg: "Hubo un error al enviar el correo de verificacion"
        });
      };

      return res.json({
        ok: true,
        msg: "Se ha mandado un correo con instrucciones a tu email"
      });

    } catch (error) {
      res.status(500).json({
        ok: false,
        msg: "Something went wrong"
      });
    }

  }

  static async verifyMail(req, res) {

    const { token } = req.query;

    const payload = JWT.verify(token, process.env.JWT_SECRET_KEY);

    if (!payload) {
      return res.status(401).json({
        ok: false,
        msg: "Token invalido o expirado"
      });
    }

    try {

      const user = await prisma.users.findUnique({
        where: {
          id: payload.userId
        }
      });

      if (!user) {
        return res.json({
          ok: false,
          msg: "No se encontro el usuario a verificar"
        });
      }

      if (user.is_verified) {
        return res.json({
          ok: true,
          msg: "Tu cuenta ya estaba verificada"
        });
      }

      await prisma.users.update({
        where: {
          id: user.id
        },
        data: {
          is_verified: true
        }
      });

      return res.json({
        ok: true,
        msg: "Se ha verificado tu cuenta"
      });

    } catch (error) {
      return res.status(500).json({
        ok: false,
        msg: "Something went wrong"
      });
    }
  }

  static async login(req, res) {

    const { email, password } = req.body;

    try {
      const user = await prisma.users.findUnique({
        where: {
          email
        }
      });

      if (!user) {
        return res.status(401).json({
          ok: false,
          msg: "Usuario no encontrado"
        });
      }

      if (!user.is_verified) {
        return res.status(401).json({
          ok: false,
          msg: "Usuario no verificado"
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          ok: false,
          msg: "Crontaseña incorrecta"
        });
      }

      const jwt = JWT.sign({
        userId: user.id,
        is_owner: user.is_owner
      }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d'
      });

      res.cookie('token', jwt, { httpOnly: true, secure: true });
      res.json({
        ok: true,
        msg: "Usuario autenticado correctamente"
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        msg: "Something went wrong"
      });
    }
  }

  static async oauthGoogle(req, res) {

    const authorizationUri = client.authorizeURL({
      redirect_uri: redirectUri,
      scope: [
        "openid",
        "profile",
        "email"
      ].join(' '),
      state: "random_state_string",
    });

    res.redirect(authorizationUri);
  }

  static async oauthRegister(req, res) {

    const { code } = req.query;

    const options = {
      code,
      redirect_uri: redirectUri,
      scope: [
        "openid",
        "profile",
        "email"
      ].join(' ')
    };

    const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
      const { token } = await client.getToken(options);

      const ticket = await oauthClient.verifyIdToken({
        idToken: token.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();

      const { email } = payload;

      const user = await prisma.users.findUnique({
        where: {
          email
        }
      });

      let jwt = '';

      if (!user) {
        const newUser = await prisma.users.create({
          data: {
            email,
            google_oauth: true,
            is_verified: true
          }
        });

        jwt = JWT.sign({
          userId: newUser.id,
          isOwner: false
        }, process.env.JWT_SECRET_KEY,
          {
            expiresIn: '1d'
          });
      } else {

        jwt = JWT.sign({
          userId: user.id,
          isOwner: user.is_owner
        }, process.env.JWT_SECRET_KEY
          , {
            expiresIn: '1d'
          });
      }
      res.cookie('token', jwt, { httpOnly: true, secure: true });
      res.json({
        ok: true,
        msg: "Usuario autenticado correctamente"
      });
    } catch (error) {
      res.cookie('error', "Error de autenticacion", { httpOnly: true, secure: true });
      res.json({
        ok: false,
        msg: "Ocurrio un error al autenticar al usuario"
      });
    }

  }

  static async isAuth(req, res) {

    if (!req.user) {
      return res.redirect('http://localhost:5173/login');
    }

    res.json({
      ok: true,
      userInfo: req.user
    });

  }
}
