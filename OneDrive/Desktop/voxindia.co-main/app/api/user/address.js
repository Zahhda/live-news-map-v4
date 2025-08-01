// pages/api/user/address.js

import connectDB from "@/config/db";
import Address from "@/models/Address";

export default async function handler(req, res) {
  await connectDB();

  // CREATE or UPDATE
  if (req.method === "POST") {
    const {
      _id,
      phoneNumber,
      fullName,
      email,
      gstin,
      pincode,
      area,
      city,
      state,
    } = req.body;

    // basic validation
    if (!phoneNumber || !fullName || !pincode || !area || !city || !state) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    try {
      let address;
      if (_id) {
        // update existing
        address = await Address.findByIdAndUpdate(
          _id,
          { phoneNumber, fullName, email, gstin, pincode, area, city, state },
          { new: true }
        );
        if (!address) {
          return res
            .status(404)
            .json({ success: false, message: "Address not found" });
        }
      } else {
        // create new
        address = new Address({
          phoneNumber,
          fullName,
          email,
          gstin,
          pincode,
          area,
          city,
          state,
        });
        await address.save();
      }

      return res.status(_id ? 200 : 201).json({ success: true, address });
    } catch (err) {
      console.error("Address POST error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }

  // DELETE
  if (req.method === "DELETE") {
    const { _id } = req.body;
    if (!_id) {
      return res
        .status(400)
        .json({ success: false, message: "`_id` is required to delete" });
    }

    try {
      const deleted = await Address.findByIdAndDelete(_id);
      if (!deleted) {
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });
      }
      return res
        .status(200)
        .json({ success: true, message: "Address deleted" });
    } catch (err) {
      console.error("Address DELETE error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Server error" });
    }
  }

  // Method not allowed
  res.setHeader("Allow", ["POST", "DELETE"]);
  return res
    .status(405)
    .json({ success: false, message: `Method ${req.method} Not Allowed` });
}
