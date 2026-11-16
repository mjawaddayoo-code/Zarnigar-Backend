import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import products from "./routes/products.js";
import orders from "./routes/orders.js";
import adminR from "./routes/admin.js";
import { Newsletter, Banner, Coupon, User, Product } from "./models/index.js";
import { protect } from "./middleware/auth.js";
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }), express.json());
app.use("/api/auth", auth);
app.use("/api/products", products);
app.use("/api/orders", orders);
app.use("/api/admin", adminR);
app.post("/api/newsletter", async (q, s) => {
  try {
    await Newsletter.create({ email: q.body.email });
  } catch {}
  s.json({ ok: true });
});
app.get("/api/banners", async (_, s) => s.json(await Banner.find()));
app.get("/api/coupons/:code", async (q, s) => {
  const c = await Coupon.findOne({
    code: q.params.code.toUpperCase(),
    active: true,
  });
  c ? s.json(c) : s.status(404).json({ message: "Invalid coupon" });
});
app.get("/api/wishlist", protect, async (q, s) =>
  s.json((await User.findById(q.user._id).populate("wishlist")).wishlist),
);
app.post("/api/wishlist/:id", protect, async (q, s) => {
  const u = await User.findById(q.user._id);
  const i = u.wishlist.indexOf(q.params.id);
  i > -1 ? u.wishlist.splice(i, 1) : u.wishlist.push(q.params.id);
  await u.save();
  s.json(u.wishlist);
});
app.use((e, _q, s, _n) => s.status(500).json({ message: e.message }));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    app.listen(process.env.PORT || 5000, () => console.log("API up")),
  );
