const AuthService = require("./auth/auth-service");

function requireAuth(req, res, next) {
  const authToken = req.get("Authorization") || "";

  let bearerToken;
  // check bearer token exists, extract token
  if (!authToken.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "NOT AUTHORIZED" });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = AuthService.verifyJwt(bearerToken);

    AuthService.getAdminWithAdminName(req.app.get("db"), payload.sub)
      .then((admin) => {
        if (!admin)
          return res.status(401).json({ error: "Unauthorized request" });

        req.admin = admin;
        next();
      })
      .catch((err) => {
        console.error(err);
        next(err);
      });
  } catch (error) {
    res.status(401).json({ error: "Unauthorized request" });
  }
}

module.exports = {
  requireAuth,
};
