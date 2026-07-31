const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. No tienes los permisos necesarios para realizar esta acción.',
      });
    }
    next();
  };
};

module.exports = authorizeRoles;
