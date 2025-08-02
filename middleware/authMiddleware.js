import jwt from "jsonwebtoken";
import User from '../models/User.js';


//Middleware to protect routes

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
     

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select("-password");
      next();
    } catch (error) {
  
      return res.status(401).json({ message: "Token malformado ou inválido" });
    }
  } else {
    console.log("Token ausente ou header malformado");
    return res.status(401).json({ message: "Token ausente ou malformado" });
  }
};


// Middleware to protect routes for admin users only
const admin = (req, res, next) => {
    if(req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
}

export { protect, admin };