import Razorpay from "razorpay";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ success: false, message: "Method not allowed" });

  let { amount } = req.body;

  try {
    // Validate amount: must be a positive integer (paise)
    amount = Number(amount);
    if (!amount || isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return res.status(400).json({ success: false, message: "Invalid amount provided" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount, // amount in paise, exactly as passed
      currency: "INR",
      receipt: "order_rcptid_" + Math.random().toString(36).slice(2),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Razorpay order error", error: error.message });
  }
}
