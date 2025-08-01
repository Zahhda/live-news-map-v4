import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/vox.india.interiors",
    svg: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M18 2h-3a4 4 0 0 0-4 4v3H8v4h3v9h4v-9h3l1-4h-4V6a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/vox.india.interior/",
    svg: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M16.5 7.5h.01" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    href: "https://in.pinterest.com/voxindiainterior",
    svg: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* simple, neutral “P” mark style */}
        <circle cx="12" cy="12" r="9" />
        <path d="M10.5 17.5l.9-3.6m2.1-1.4a2.5 2.5 0 1 0-2.5-2.5" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/vox-india/",
    svg: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 11v6M8 7.5h.01M12 17v-3.5a2 2 0 1 1 4 0V17" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@voxindia2018",
    svg: (
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="6.5" width="18" height="11" rx="2" />
        <path d="M10 10l4 2-4 2z" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <>
      <style>{`
        body, button, input, select, textarea, a, p, h1, h2, h3, h4, h5, h6, div, address, ul, li {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}</style>

      <footer className="mt-[4%] bg-gray-100 text-gray-700 py-12 px-6 md:px-16 lg:px-2">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
          <Image src={assets.logo} alt="VOX Logo" width={80} height={40} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Premium slatted wall and ceiling panels for modern interiors.
            </p>
            <div className="flex space-x-4 mt-4 text-gray-600">
              {socialLinks.map(({ name, href, svg }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="hover:text-red-700"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/product/6882edb775fde2ca4e81543a" className="hover:underline">
                  S-Line
                </Link>
              </li>
              <li>
                <Link href="/product/6882ef8a75fde2ca4e815629" className="hover:underline">
                  M-Line
                </Link>
              </li>
              <li>
                <Link href="/product/6882f06b75fde2ca4e8156b6" className="hover:underline">
                  L-Line
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-semibold mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies-policy" className="hover:underline">
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link href="/returns-cancellation" className="hover:underline">
                  Returns &amp; Cancellation
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:underline">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/warranty-policy" className="hover:underline">
                  Warranty Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <address className="not-italic text-sm space-y-2">
              <p>1202, 100-ft Rd</p>
              <p>Indiranagar</p>
              <p>Bengaluru, KA-560008</p>
              <p>
                <a href="tel:+919528500500" className="hover:underline text-red-700">
                  +91 9528-500-500
                </a>
              </p>
              <p>
                <a href="mailto:customercare@voxindia.co" className="hover:underline">
                  customercare@voxindia.co
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
          © 2025 VOX Interior and Exterior Solutions Pvt Ltd. All rights reserved.
        </div>
      </footer>
    </>
  );
};

export default Footer;
