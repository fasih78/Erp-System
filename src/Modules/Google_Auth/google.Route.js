const routes = require("express").Router();

const isLoggedIn = require('../../../Middlewares/google-auth-login')
require('../../../Middlewares/google-auth')

const { Auth_google, after_auth, Callback, auth_fail } = require("./google");

routes.get("/", async (req, res) => {
  res.send(
    '<a href="/auth/google">Authenticate with Google <br><a href="/auth/facebook">Authenticate with Facebook'
  );
});

routes.get("/auth/google", async (req, res) => {
  await  Auth_google(req, res);
});

routes.get("/protected", isLoggedIn, async (req, res) => {
  await after_auth(req, res);
});

routes.get("/auth/failure", async (req, res) => {
  await auth_fail(req, res);
});

routes.get("/google/callback", async (req, res) => {
  await Callback(req, res);
});
routes.get("/logout", function (req, res) {
  res.redirect("https://accounts.google.com/logout");
  res.redirect("http://localhost:2000/google/callback");
});

module.exports = routes;
