import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";       // Your DB connect helper
import Order from "@/models/Order";     // Your Order model
import razorpay from "@/lib/razorpay"; // Your Razorpay instance

// Configure Nodemailer transporter with Gmail (use app password or OAuth token)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,       // your gmail address
    pass: process.env.GMAIL_APP_PASS,   // app password or OAuth token
  },
});

export async function POST(request) {
  try {
    await connectDB();

    const { userId } = getAuth(request);
    if (!userId)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const body = await request.json();
    const { address, items, paymentMethod, totalAmount } = body;

    // Basic validation example
    if (
      !address ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !paymentMethod ||
      !totalAmount
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid order data" },
        { status: 400 }
      );
    }

    // Ensure totalAmount is a number in rupees
    const finalAmount = Number(totalAmount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400 }
      );
    }

    let order;

    if (paymentMethod === "cod") {
      order = await Order.create({
        userId,
        address,
        items,
        paymentMethod,
        amount: finalAmount,
        status: "Pending",
      });
    } else {
      // Create Razorpay order - amount in paise
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(finalAmount * 100), // Convert ₹ to paise safely
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      });

      order = await Order.create({
        userId,
        address,
        items,
        paymentMethod,
        amount: finalAmount,
        razorpayOrderId: razorpayOrder.id,
        status: "Pending",
      });
    }

    // Send confirmation email asynchronously (do not block response)
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: address.email,
      subject: `Order Confirmation - ${order._id}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Your order ID is <strong>${order._id}</strong>.</p>
        <p><strong>Name:</strong> ${address.fullName}</p>
        <p><strong>Email:</strong> ${address.email}</p>
        <p><strong>Phone:</strong> ${address.phoneNumber}</p>
        <p><strong>Shipping Address:</strong><br/>
           ${address.area}, ${address.city}, ${address.state} - ${address.pincode}
        </p>
        <p><strong>GSTIN:</strong> ${address.gstin || "N/A"}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
        <p>We will notify you when your order ships.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
      razorpayOrderId: order.razorpayOrderId || null,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
