import { Router } from 'express'; import { Order, Product, Coupon } from '../models/index.js'; import { protect } from '../middleware/auth.js';
const r = Router();
r.post('/', protect, async (q, s) => { const { items, shipping, coupon } = q.body; if (!items?.length || !shipping?.address) return s.status(400).json({ message: 'Cart and address required' });
  let total = 0; const lines = [];
  for (const i of items) { const p = await Product.findById(i.product); if (!p || p.stock < i.qty) return s.status(400).json({ message: `${p?.name || 'Item'} out of stock` }); const price = p.salePrice || p.price; total += price * i.qty; lines.push({ product: p._id, name: p.name, image: p.images[0], price, qty: i.qty, size: i.size, color: i.color }); }
  const c = coupon && await Coupon.findOne({ code: coupon.toUpperCase(), active: true }); if (c) total = Math.round(total * (1 - c.percent / 100));
  for (const l of lines) await Product.findByIdAndUpdate(l.product, { $inc: { stock: -l.qty } });
  s.status(201).json(await Order.create({ user: q.user._id, items: lines, shipping, total })); });
r.get('/mine', protect, async (q, s) => s.json(await Order.find({ user: q.user._id }).sort('-createdAt')));
r.get('/:id', protect, async (q, s) => { const o = await Order.findById(q.params.id); if (!o || (String(o.user) !== String(q.user._id) && q.user.role !== 'admin')) return s.status(404).json({ message: 'Not found' }); s.json(o); });
export default r;
