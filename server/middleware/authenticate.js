exports.protect = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    }
    return res.redirect("/auth/login");
  };
  
  exports.loggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect("/dashboard");
    }
    next();
  };
  