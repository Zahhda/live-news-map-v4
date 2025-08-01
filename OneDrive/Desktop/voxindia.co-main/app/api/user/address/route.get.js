import connectDB from "@/config/db";
import Address from "@/models/Address";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return new Response(JSON.stringify({ success: false, message: "Missing phone query param" }), { status: 400 });
  }

  const addresses = await Address.find({ phoneNumber: phone });

  return new Response(JSON.stringify({ success: true, addresses }), { status: 200, headers: { "Content-Type": "application/json" } });
}
