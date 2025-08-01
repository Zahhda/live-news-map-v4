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
        Return & Cancellation Policy
      </h1>

      <p><strong>Last Updated: 3rd June 2025</strong></p>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. Returns & Exchange Policy</h2>
      <p>
        At <strong>VOX India</strong>, we ensure that all our products are
        shipped in perfect condition. Due to the nature of the products (interior
        and exterior panels, ceilings, floors, fittings), we currently do not
        offer general returns once an order is accepted and dispatched.
      </p>

      <p>
        However, exchange or return is only entertained under the following conditions:
      </p>

      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>If the product received is damaged or defective on delivery.</li>
        <li>If the product delivered is incorrect or mismatched with your order.</li>
        <li>If there are major manufacturing defects clearly visible or experienced during installation.</li>
      </ul>

      <p>
        In such cases, please report the issue to us within <strong>48 hours</strong> of delivery,
        via email or WhatsApp. You may be asked to share pictures/videos of the item(s)/packaging for inspection.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. Cancellation Policy</h2>
      <p>
        Once an order is confirmed and processed, cancellation may not be
        guaranteed, especially for custom or non-standard orders.
      </p>
      <p>
        Order cancellation is only possible if:
      </p>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>The order has not yet been dispatched or shipped from our warehouse.</li>
        <li>The product is not a special or made-to-order item.</li>
      </ul>

      <p>
        If your cancellation request is approved, the refund (if applicable) will
        be processed within 7–14 business days via the original mode of payment.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">3. Exceptions</h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>No return or exchange is entertained for installed or partially used products.</li>
        <li>Items must be returned in original packaging and unused condition for eligibility.</li>
        <li>VOX India reserves the final right to approve or deny a return, exchange, or cancellation request.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">4. Reporting an Issue</h2>
      <p>Please get in touch with our support within <strong>2 working days</strong> if any issue arises with your shipment. Contact details:</p>
      <ul className="list-disc list-inside space-y-1 mb-6">
        <li><strong>Name:</strong> Yashika Dholi</li>
        <li><strong>Designation:</strong> Company Secretary</li>
        <li><strong>Email:</strong>{' '}
          <a href="mailto:companysecretary@voxindia.co" className="text-red-700 underline">
            companysecretary@voxindia.co
          </a>{' '} (IST 10:00 AM to IST 6:00 PM)
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
