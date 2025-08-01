// /app/api/razorpay/order/route.js
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req) {
  const body = await req.json();

  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,

  });

  const options = {
    amount: body.amount * 100, // amount in paisa
    currency: "INR",
    receipt: `receipt_order_${Math.random().toString().slice(2, 8)}`,
  };

  try {
    const order = await instance.orders.create(options);
    return NextResponse.json({ success: true, order });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message });
  }
}
