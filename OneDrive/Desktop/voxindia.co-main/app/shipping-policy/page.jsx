"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />
     <main className="max-w-5xl mx-auto p-6 md:p-12 prose prose-lg">
      <h1 className="text-4xl font-extrabold text-center mt-8 mb-10">
        Shipping Policy
      </h1>

      <p><strong>Last Updated: 3rd June 2025</strong></p>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. General Shipping Information</h2>
      <p>
        At <strong>VOX India</strong>, we aim to ensure a seamless shipping experience across all our product categories. All products sold through our website <a href="https://www.greatstack.voxindia.co" className="text-red-700 underline">https://www.greatstack.voxindia.co</a> are shipped through reputed logistics partners to the address provided during checkout.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. Shipping Coverage</h2>
      <p>
        We currently deliver across major cities and towns in India. Deliverability to specific pin codes depends on our third-party logistics coverage areas.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">3. Order Processing Time</h2>
      <p>
        All confirmed orders are typically processed within <strong>2–5 business days</strong> from the date of purchase. Orders received on weekends or public holidays will be processed on the next business day.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">4. Delivery Timeline</h2>
      <p>
        Delivery timelines vary based on the product category and destination. Estimated delivery window is between <strong>5–15 business days</strong> post-dispatch, depending on location and product availability.
      </p>
      <p>
        Custom-made or special-batch items may take longer. Any significant delay will be communicated to the customer proactively.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">5. Shipping Charges</h2>
      <p>
        Shipping charges may be applicable based on the order value, product type, delivery location, or special packaging requirements. Any applicable shipping fees will be visible during the checkout process before you confirm your purchase.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">6. Shipment Tracking</h2>
      <p>
        Once your order is dispatched, you will receive an email and/or SMS confirmation with a tracking ID and link to track your shipment in real time. You may also find this information in your order history under your account dashboard.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">7. Delays and Exceptions</h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>Delays caused by natural calamities, strikes, restricted zones, or force majeure events are beyond our control.</li>
        <li>VOX India is not liable for delays caused by third-party logistics partners but will actively assist in resolving such issues.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">8. Unsuccessful Delivery</h2>
      <p>
        If an order is undeliverable after multiple attempts due to incorrect address or unavailability, your order may be returned to origin. Re-delivery will incur additional shipping charges.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">9. Shipping Damage or Discrepancy</h2>
      <p>
        If your shipment arrives damaged, tampered, or incomplete, please report it to us with photos or videos within <strong>48 hours of delivery</strong>. We will investigate and facilitate a resolution, if applicable, as per our return/exchange policy.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Information</h2>
      <p>
        For any logistics-related concerns, please reach out to our Grievance Officer:
      </p>
      <ul className="list-disc list-inside space-y-1 mb-6">
        <li><strong>Name:</strong> Yashika Dholi</li>
        <li><strong>Designation:</strong> Company Secretary</li>
        <li><strong>Email:</strong>{" "}
          <a href="mailto:companysecretary@voxindia.co" className="text-red-700 underline">
            companysecretary@voxindia.co
          </a>{" "} (IST 10:00 AM to IST 6:00 PM)
        </li>
      </ul>

      <p className="mt-10 text-sm text-gray-600 text-center">
        © 2025 VOX Interior and Exterior Solutions Pvt Ltd. All rights reserved.
      </p>
    </main>
      <Footer />
    </>
  );
}
