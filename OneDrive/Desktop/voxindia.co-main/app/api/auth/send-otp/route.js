import { NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_SERVICE_SID;

export async function POST(req) {
  try {
    const { phone } = await req.json();

    if (!phone || !phone.startsWith('+')) {
      return NextResponse.json({ success: false, message: 'Invalid phone number' }, { status: 400 });
    }

    const verification = await client.verify
      .services(serviceSid)
      .verifications.create({ to: phone, channel: 'sms' });

    return NextResponse.json({ success: true, status: verification.status });
  } catch (error) {
    console.error('[Twilio SEND OTP Error]', error?.message, error?.code);
    return NextResponse.json({ success: false, message: error?.message || 'OTP send failed' }, { status: 500 });
  }
}
