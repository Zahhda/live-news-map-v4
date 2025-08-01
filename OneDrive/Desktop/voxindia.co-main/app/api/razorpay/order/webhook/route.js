// /pages/api/razorpay/webhook.js or /app/api/razorpay/webhook/route.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const receivedSignature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature === receivedSignature) {
    console.log("🔔 Webhook verified:", req.body.event);

    // handle different events
    switch (req.body.event) {
      case 'payment.captured':
        // Process order
        break;
      case 'payment.failed':
        // Notify or retry
        break;
      default:
        break;
    }

    res.status(200).json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
}
