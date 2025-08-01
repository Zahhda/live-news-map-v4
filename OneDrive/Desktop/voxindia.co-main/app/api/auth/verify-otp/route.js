import { NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const serviceSid = process.env.TWILIO_SERVICE_SID;

export async function POST(req) {
  try {
    const { phone, otp, name } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ success: false, message: 'Phone and OTP required' }, { status: 400 });
    }

    const verificationCheck = await client.verify
      .services(serviceSid)
      .verificationChecks.create({ to: phone, code: otp });

    if (verificationCheck.status !== 'approved') {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    await connectDB();

    const digitsOnly = phone.replace(/^\+/, '');
    const email = `${digitsOnly}@voxindia.co`;

    const user = await User.findOneAndUpdate(
      { _id: phone },
      { _id: phone, name: name || '', email },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ success: true, user, token });
  } catch (error) {
    console.error('[Twilio VERIFY OTP Error]', error?.message || error);
    return NextResponse.json({ success: false, message: error?.message || 'OTP verification failed' }, { status: 500 });
  }
}
