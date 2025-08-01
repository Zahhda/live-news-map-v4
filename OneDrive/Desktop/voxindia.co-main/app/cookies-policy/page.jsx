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
        Cookies Policy
      </h1>

      <p><strong>Last Updated: 3rd June 2025</strong></p>

      <h2 className="text-2xl font-bold mt-8 mb-4">1. What Are Cookies?</h2>
      <p>
        Cookies are small data files placed on your computer or mobile device when you visit a website. They help websites function efficiently, remember visitor preferences, and facilitate reporting. Most browsers support cookies, but users can set their browser to decline or delete cookies as desired.
      </p>

      <h2 className="text-2xl font-bold mt-8 mb-4">2. Why Do We Use Cookies?</h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>Remembering language and preference settings.</li>
        <li>Assisting with geolocation to present the closest store or office locations.</li>
        <li>Serving specific content, such as embedded videos.</li>
        <li>Leveraging user behavior to offer targeted advertisements, including remarketing across third-party websites.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">3. Types of Cookies We Use</h2>

      <h3 className="text-xl font-semibold mt-6 mb-2">a) First-Party and Third-Party Cookies</h3>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li><strong>First-Party Cookies:</strong> Set by our domain, mainly for language/location preferences and basic site functionality.</li>
        <li><strong>Third-Party Cookies:</strong> Set by external parties, such as advertising networks or analytics providers. These may be performance or targeting cookies that we do not directly control.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">b) Session Cookies</h3>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>Temporary and active only during your site visit.</li>
        <li>Deleted after you close your web browser.</li>
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">c) Persistent Cookies</h3>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>Remain on your device after browser closure or system restart.</li>
        <li>Used to remember your website preferences, analyze behavioral patterns, and for targeted advertising.</li>
        <li>Help in measuring the effectiveness of both site functions and advertising efforts.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-8 mb-4">4. How to Reject or Delete Cookies</h2>
      <ul className="list-disc list-inside space-y-1 mb-4">
        <li>You can reject or block all or certain cookies through the cookie preferences panel on our website(s).</li>
        <li>Adjust your browser’s settings to control cookie storage and acceptance.</li>
        <li>Most browsers accept cookies by default, so you may need to manually delete or block cookies if you do not wish them to be used.</li>
        <li>Restricting cookies may limit the functionality of the website.</li>
        <li>By continuing to use the website without deleting or rejecting particular cookies, you consent to their placement on your device.</li>
      </ul>
      <p>
        For further details regarding our Cookies Policy, we recommend regularly reviewing this page for any updates or changes that may affect how cookies operate on your device.
      </p>

      <p className="mt-10 text-sm text-gray-600 text-center">
        © 2025 VOX Interior and Exterior Solutions Pvt Ltd. All rights reserved.
      </p>
    </main>
      <Footer />
    </>
  );
}
