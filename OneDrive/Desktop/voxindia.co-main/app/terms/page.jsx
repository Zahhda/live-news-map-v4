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
        Terms and Conditions
      </h1>

      <p><strong>Last Updated: 3rd June 2025</strong></p>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
      <p>
        Welcome to <strong>VOX India</strong>. These Terms and Conditions govern your access to and use of our e-commerce platform located at <a href="https://www.greatstack.voxindia.co" className="text-red-700 underline">https://www.greatstack.voxindia.co</a>. By accessing our platform, you agree to be bound by these terms.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. Definitions</h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li><strong>“We”, “Us”, “Our”</strong> refers to VOX Interior and Exterior Solutions Private Limited and VOX Building Products Private Limited.</li>
        <li><strong>“You” or “User”</strong> refers to any individual or entity accessing or using the website.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">3. Use of Website</h2>
      <p>
        The website and all its contents are intended solely for personal, non-commercial use. Any use of the content, images, or platform for resale, commercial purposes, or scraping data without our express permission is strictly prohibited.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">4. Eligibility</h2>
      <p>
        You must be 18 years or older to use this website. By agreeing to these terms, you represent that you are at least 18 years of age or are accessing the site under supervision of a legal guardian.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">5. Account and Registration</h2>
      <p>
        To make purchases, users may be required to register and create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">6. Product Description</h2>
      <p>
        We attempt to be as accurate as possible in describing our products, including colors, dimensions, and specifications. However, we do not warrant that the product descriptions or other content is error-free, complete, or current.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">7. Orders and Pricing</h2>
      <p>
        Prices displayed on the website are subject to change. We reserve the right to cancel any order at our discretion, including for pricing errors or availability issues, even after order confirmation.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">8. Payment</h2>
      <p>
        We accept major forms of payment, including credit/debit cards and UPI. Your payment information is securely handled by certified third-party gateways.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">9. Shipping and Delivery</h2>
      <p>
        Orders will be shipped according to estimated timelines but delays may occur due to unforeseen circumstances. All shipping and delivery details are explained at checkout.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">10. Returns and Refunds</h2>
      <p>
        Returns and exchanges are only applicable under certain circumstances, such as manufacturer defects or damaged goods. For more details, please refer to our Return Policy.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">11. Intellectual Property</h2>
      <p>
        All content on the platform including logos, text, images, and software are the property of VOX India and are protected under applicable intellectual property laws. You are not permitted to use any content without express permission.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">12. Limitations of Liability</h2>
      <p>
        In no event shall VOX India be liable for any direct, indirect, incidental, or consequential damages resulting from your access or use of the platform or from any content, product, or service.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">13. Indemnification</h2>
      <p>
        You agree to indemnify and hold harmless VOX India and its affiliates, officers, and employees from any claim or demand, including reasonable attorneys’ fees, arising from your violation of these Terms or any applicable law.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">14. Governing Law</h2>
      <p>
        These terms are governed by and construed in accordance with the laws of India. Any dissent or legal matter arising under these terms shall be subject to the jurisdiction of Bangalore courts.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">15. Termination</h2>
      <p>
        We reserve the right to suspend or terminate access if we believe there is a breach of these Terms or unlawful activity. Upon termination, your right to use the website will cease.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">16. Amendments to These Terms</h2>
      <p>
        We may modify these Terms at any time. Users will be notified of significant changes. Continued use of the platform implies acceptance of the updated terms.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">17. Contact Details</h2>
      <p>
        For any queries, concerns, or support requests, please contact our Grievance Officer:
      </p>
      <ul className="list-disc list-inside space-y-1 mb-6">
        <li><strong>Name:</strong> Yashika Dholi</li>
        <li><strong>Designation:</strong> Company Secretary</li>
        <li>
          <strong>Email:</strong>{" "}
          <a href="mailto:companysecretary@voxindia.co" className="text-red-700 underline">
            companysecretary@voxindia.co
          </a>{" "}
          (IST 10:00 AM to IST 6:00 PM)
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
