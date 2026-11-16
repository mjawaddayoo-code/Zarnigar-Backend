import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
export const protect = async (req, res, next) => {
  try { const t = (req.headers.authorization || '').split(' ')[1]; req.user = await User.findById(jwt.verify(t, process.env.JWT_SECRET).id).select('-password'); if (!req.user) throw 0; next(); }
  catch { res.status(401).json({ message: 'Not authorized' }); }
};
export const admin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin only' });
