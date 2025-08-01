// models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    address: {
      fullName: String,
      phoneNumber: String,
      email: String,      // add email
      gstin: String,      // add gstin
      pincode: String,
      area: String,
      city: String,
      state: String,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variantId: String,
        colorName: String,
        quantity: Number,
      },
    ],
    amount: Number,
    paymentMethod: { type: String, enum: ["razorpay", "cod"] },
    razorpayOrderId: String,
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
