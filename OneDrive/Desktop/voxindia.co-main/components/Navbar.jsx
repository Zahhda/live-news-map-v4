'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User as UserIcon, ShoppingBag, Heart } from 'lucide-react';
import AuthModal from '@/context/AuthModal';
import { useAppContext } from '@/context/AppContext';
import CartSidebar from '@/components/CartSidebar';
import { assets } from '@/assets/assets';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { cartItems } = useAppContext();
  const router = useRouter();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [userName, setUserName] = useState('Guest');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const verified = sessionStorage.getItem('otp_verified') === 'true';
      setIsLoggedIn(verified);

      const name = sessionStorage.getItem('user_name') || 'Guest';
      const phone = sessionStorage.getItem('user_phone') || '';
      const emailFromPhone = phone.replace('+91', '') + '@voxindia.co';

      setUserName(name);
      setUserEmail(sessionStorage.getItem('user_email') || emailFromPhone);
    }
  }, []);

  const handleVerified = () => {
    setIsLoggedIn(true);
    toast.success('Logged in successfully');

    if (typeof window !== 'undefined') {
      const name = sessionStorage.getItem('user_name') || 'Guest';
      const phone = sessionStorage.getItem('user_phone') || '';
      const emailFromPhone = phone.replace('+91', '') + '@voxindia.co';

      setUserName(name);
      setUserEmail(sessionStorage.getItem('user_email') || emailFromPhone);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setShowDropdown(false);
    toast.success('Logged out');
    router.push('/');
  };

  // <-- FIXED: Sum quantities properly -->
  const cartCount = Object.values(cartItems || {}).reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <>
      <nav className="flex justify-between items-center px-4 md:px-16 py-2 bg-white border-b relative z-[9999]">
        {/* Logo */}
        <div className="cursor-pointer" onClick={() => router.push('/')}>
          <Image src={assets.logo} alt="Logo" width={80} height={28} />
        </div>

        {/* Links */}
        <div className="hidden md:flex gap-6 text-gray-800 font-medium">
          <Link href="/">Linerio</Link>
          <Link href="/contact">Contact</Link>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative text-gray-600 hover:text-black"
            aria-label="Cart"
            style={{ padding: 4 }}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="text-gray-600 hover:text-black"
            aria-label="Wishlist"
            style={{ padding: 4 }}
          >
            <Heart className="w-5 h-5" />
          </button>
          <div className="relative" ref={dropdownRef}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  className="text-gray-600 hover:text-black font-medium select-none flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                  aria-label="User menu"
                  type="button"
                  style={{ padding: 0 }}
                >
                  <UserIcon className="w-5 h-5" />
                </button>
                {showDropdown && (
                  <div
                    className="absolute right-0 mt-3 w-60 bg-white shadow-lg rounded-xl py-2 z-[10000] border border-gray-100"
                    style={{
                      minWidth: '220px',
                      boxShadow:
                        '0 4px 24px 0 rgba(34,34,34,0.09), 0 1.5px 7.5px 0 rgba(34,34,34,0.03)',
                    }}
                  >
                    <div className="px-4 pt-3 pb-1">
                      <div className="text-[13px] text-gray-800 font-semibold leading-tight">
                        {userName || 'Guest'}
                      </div>
                      <div className="text-[12px] text-gray-400 truncate">{userEmail}</div>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/add-address');
                      }}
                      className="flex gap-2 items-center w-full px-4 py-2 mt-2 hover:bg-gray-100 rounded-md text-gray-700 font-medium text-[15px] transition"
                      type="button"
                    >
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex gap-2 items-center w-full px-4 py-2 hover:bg-gray-100 rounded-md text-red-600 font-medium text-[15px] transition"
                      type="button"
                    >
                      <svg
                        className="w-4 h-4 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-gray-600 hover:text-black flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
                aria-label="Login"
                type="button"
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </nav>
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onVerified={handleVerified}
        />
      )}
      {/* Cart Sidebar */}
      <CartSidebar
  open={isCartOpen}
  onClose={() => setIsCartOpen(false)}
  onOpenAuth={() => setShowAuthModal(true)} // ✅ THIS IS CRUCIAL
/>

    </>
  );
}
