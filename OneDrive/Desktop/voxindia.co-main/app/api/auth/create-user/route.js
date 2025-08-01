// /api/auth/create-user.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  await connectDB();

  const { phone, name } = await req.json();
  if (!phone) {
    return NextResponse.json({ success: false, message: 'Phone is required' }, { status: 400 });
  }

  const cleanPhone = phone.replace('+91', '');
  const _id = phone;
  const email = `${cleanPhone}@voxindia.co`;

  let user = await User.findById(_id);
  if (!user) {
    user = await User.create({
      _id,
      name: name || cleanPhone,
      email,
      imageUrl: '', // You can leave this empty
    });
  }

  return NextResponse.json({ success: true, user });
}