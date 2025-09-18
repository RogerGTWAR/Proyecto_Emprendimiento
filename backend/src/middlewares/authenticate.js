import JWT from "jsonwebtoken";

export default function authenticate(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "Usuario no autenticado"
    });
  }

  try {

    const { userId, isOwner } = JWT.verify(token, process.env.JWT_SECRET_KEY);

    req.user = {
      userId,
      isOwner
    }
    next();
  } catch (error) {
    res.status(401).json({
      ok: false,
      msg: "Usuario no autenticado"
    });
  }

}
