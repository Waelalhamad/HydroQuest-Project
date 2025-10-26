const { Router } = require("express");
const passport = require("passport");
const authController = require("../controller/authController");
const authMiddleware = require("../middleware/authenticate");
const router = Router();

router.get("/login", authMiddleware.loggedIn, authController.loginPage);
router.get("/signup", authMiddleware.loggedIn, authController.registerPage);
router.post("/register", authController.register);
router.post(
  "/login",

  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    successRedirect: "/dashboard",
    failureFlash: true,
  })
);
router.get("/logout", authController.logout);
module.exports = router;
