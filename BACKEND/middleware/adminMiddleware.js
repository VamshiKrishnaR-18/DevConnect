import protect from "./authMiddleware.js";

const adminProtect = (req, res, next) => {
  protect(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        msg: "Access denied. Admins only.",
      });
    }
    next();
  });
};

export default adminProtect;
