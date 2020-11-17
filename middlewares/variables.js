module.exports = function (req, res, next) {
  res.locals.isAuth = req.session.isAuthenticated; /* заводим локальную переменную isAuth */
  res.locals.csrf = req.csrfToken();
  next();
};
