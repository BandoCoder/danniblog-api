const express = require("express");
const AuthService = require("./auth-service");
const { requireAuth } = require("../jwt");

const authRouter = express.Router();
const json = express.json();

//Auth endpoint with router, all post endpoints gather values from a form

authRouter.post("/login", json, (req, res, next) => {
  //Knex instance
  let db = req.app.get("db");

  const { admin_name, password } = req.body;
  const loginAdmin = { admin_name, password };

  // Validate Request
  for (const [key, value] of Object.entries(loginAdmin))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      });

  //Make Request
  AuthService.getAdminWithAdminName(db, loginAdmin.admin_name)
    .then((dbAdmin) => {
      //Compare Credentials
      if (!dbAdmin)
        return res.status(400).json({
          error: "Incorrect login credentials",
        });
      return AuthService.comparePasswords(
        loginAdmin.password,
        dbAdmin.password
      ).then((compareMatch) => {
        if (!compareMatch)
          return res.status(400).json({
            error: "Incorrect login credentials",
          });
        //Return JWT
        const sub = dbAdmin.admin_name;
        const payload = { admin_id: dbAdmin.id };
        res.send({
          authToken: AuthService.createJwt(sub, payload),
        });
      });
    })
    .catch(next);
});

//Refresh JWT
authRouter.put("/refresh", requireAuth, (req, res) => {
  const sub = req.admin.admin_name;
  const payload = { admin_id: req.admin.id };
  res.send({
    authToken: AuthService.createJwt(sub, payload),
  });
});

module.exports = authRouter;
