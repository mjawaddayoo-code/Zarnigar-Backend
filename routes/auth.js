import { Router } from 'express'; import jwt from 'jsonwebtoken'; import bcrypt from 'bcryptjs';
import { User } from '../models/index.js'; import { protect } from '../middleware/auth.js';
const r = Router(); const tok = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const out = u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, token: tok(u) });
r.post('/register', async (q, s) => { const { name, email, password } = q.body; if (!name || !email || (password || '').length < 6) return s.status(400).json({ message: 'Name, email and 6+ char password required' }); if (await User.findOne({ email })) return s.status(400).json({ message: 'Email already used' }); s.status(201).json(out(await User.create({ name, email, password }))); });
r.post('/login', async (q, s) => { const u = await User.findOne({ email: q.body.email }); if (!u || !(await bcrypt.compare(q.body.password || '', u.password))) return s.status(401).json({ message: 'Invalid credentials' }); s.json(out(u)); });
r.put('/profile', protect, async (q, s) => { const u = await User.findById(q.user._id); u.name = q.body.name || u.name; if (q.body.password) u.password = q.body.password; await u.save(); s.json(out(u)); });
export default r;
