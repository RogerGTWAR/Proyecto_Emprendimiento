import { OAuth2Client } from "google-auth-library";
import prisma from "../database.js";
import JWT from "jsonwebtoken";
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
    res.json(req.body);
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
            google_oauth: true
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
      res.redirect("http://localhost:5173/dashboard");
    } catch (error) {
      res.cookie('error', "Error de autenticacion", { httpOnly: true, secure: true });
      res.redirect("http://localhost:5173/login");
    }

  }

  static async login(req, res) {

    res.json(req.body);

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
