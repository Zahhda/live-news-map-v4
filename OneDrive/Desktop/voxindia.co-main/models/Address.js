import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, index: true }, // +91XXXXXXXXXX
  fullName: String,
  email: String,
  gstin: String,
  pincode: String,
  area: String,
  city: String,
  state: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Address || mongoose.model("Address", AddressSchema);
