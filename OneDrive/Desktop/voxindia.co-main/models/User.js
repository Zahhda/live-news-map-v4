import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // use phone as _id
  name: { type: String }, // optional now
  email: { type: String, required: true, unique: true }, // generated like number@voxindia.co
  imageUrl: { type: String, default: "" }, // optional
  cartItems: { type: Object, default: {} },
}, { minimize: false });

const User = mongoose.models.user || mongoose.model("user", userSchema);
export default User;
