import prisma from "../database.js";
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

    try {
      const accessToken = await client.getToken(options);

      res.json(accessToken.token);
    } catch (error) {
      console.error("Access Token Error", error.message);
      res.status(500).json("Authentication failed");
    }

  }

  static async login(req, res) {

    res.json(req.body);

  }

}
