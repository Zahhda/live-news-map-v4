import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  await connectDB();
  const { phone } = await req.json();

  if (!phone) {
    return NextResponse.json({ success: false, message: 'Phone required' }, { status: 400 });
  }

  const user = await User.findById(phone);
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, user });
}
