const adminAuth = (req, res, next) => {
  try {
    // Requiere autenticación previa (middleware auth debe haber seteado req.user)
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Endurecer verificación de rol:
    // - Si el token incluye 'role' y no es 'admin' => 403
    // - Si no incluye 'role', permitir por compatibilidad, pero registrar advertencia
    if (typeof req.user.role !== 'undefined') {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
      }
    } else {
      // Compatibilidad temporal: permitir pero loguear para detectar tokens sin rol
      console.warn('adminAuth: token sin propiedad role. Considera incluir role=admin en el JWT.');
    }

    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = adminAuth;
