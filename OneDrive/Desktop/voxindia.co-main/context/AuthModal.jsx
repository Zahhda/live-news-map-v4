'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { assets } from '@/assets/assets';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function AuthModal({ isOpen, onClose, onVerified }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setPhone('');
      setName('');
      setCode(Array(OTP_LENGTH).fill(''));
      setLoading(false);
      setStatusMsg('');
      setResendTimer(0);
    }
  }, [isOpen]);

  const isPhoneValid = phone.length === 10;
  const otpValue = code.join('');

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
  };

  const handleOtpChange = (index, value) => {
    if (/\D/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('Text').slice(0, OTP_LENGTH);
    const newCode = pasted.split('').slice(0, OTP_LENGTH);
    setCode(newCode);
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { phone: '+91' + phone });
      sessionStorage.setItem('user_phone', '+91' + phone);
      setStatusMsg('OTP sent successfully!');
      setStep('otp');
      setResendTimer(RESEND_SECONDS);
      setCode(Array(OTP_LENGTH).fill(''));
      toast.success('OTP sent!');
    } catch {
      setStatusMsg('Failed to send OTP.');
      toast.error('Failed to send OTP');
    }
    setLoading(false);
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await axios.post('/api/auth/send-otp', { phone: '+91' + phone });
      setStatusMsg('OTP resent!');
      setResendTimer(RESEND_SECONDS);
      setCode(Array(OTP_LENGTH).fill(''));
      toast.success('OTP resent!');
    } catch {
      setStatusMsg('Failed to resend OTP.');
      toast.error('Failed to resend OTP');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (sessionStorage.getItem('otp_verified') === 'true') {
      setStatusMsg('Already verified!');
      toast.success('Already verified!');
      if (onVerified) onVerified();
      onClose();
      return;
    }
    if (otpValue.length < OTP_LENGTH) {
      setStatusMsg('Please enter the 6-digit OTP.');
      toast.error('Enter 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', {
        phone: '+91' + phone,
        otp: otpValue,
        name: name.trim() || undefined,
      });
      if (res.data.success && res.data.user) {
        const { user, token } = res.data;
        sessionStorage.setItem('otp_verified', 'true');
        sessionStorage.setItem('user_token', token);
        sessionStorage.setItem('user_phone', user.phone || '+91' + phone);
        sessionStorage.setItem('user_name', user.name || '');
        sessionStorage.setItem('user_email', user.email || '');
        sessionStorage.setItem('user_image', user.imageUrl || '');
        setStatusMsg('OTP verified!');
        toast.success('Verified!');
        if (onVerified) onVerified();
        setTimeout(onClose, 700);
      } else {
        setStatusMsg(res.data.message || 'Invalid OTP.');
        toast.error(res.data.message || 'Invalid OTP');
      }
    } catch {
      setStatusMsg('Invalid OTP.');
      toast.error('Invalid OTP');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-xs sm:max-w-md md:w-96 rounded-xl px-3 sm:px-6 py-4 sm:py-8 relative shadow-2xl flex flex-col"
        style={{ zIndex: 100000 }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-800"
        >✕</button>
        <div className="mb-6 flex justify-center">
          <Image src={assets.logo} alt="Logo" width={64} height={64} />
        </div>
        <h2 className="text-center text-xl font-semibold text-gray-900 mb-1">
          {step === 'phone' ? 'Enter Phone Number' : 'Enter OTP'}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-4">
          {step === 'phone'
            ? "We'll send a code to your number"
            : 'Type the 6-digit code we sent you'}
        </p>
        {statusMsg && (
          <div className="text-center mb-4 text-sm font-medium text-[#e80808] min-h-[22px]">
            {statusMsg}
          </div>
        )}
        {step === 'phone' && (
          <>
            {/* Beautified, never-edge-touching phone input */}
            <div className="w-full mb-4">
              <div className="flex items-center w-full bg-gray-50 border border-gray-200 rounded-lg shadow-sm px-2 py-1 gap-2">
                <span className="text-gray-700 font-medium px-2 py-2 rounded select-none bg-gray-100 border border-gray-200">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="1234567890"
                  className="flex-1 min-w-0 bg-transparent border-0 focus:ring-0 focus:outline-none px-2 py-2 text-base"
                  style={{ fontSize: '1rem' }}
                />
              </div>
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-[#e80808] transition"
            />
          </>
        )}
        {step === 'otp' && (
          <div>
            <div className="flex justify-center mb-4 gap-2" onPaste={handleOtpPaste}>
              {Array(OTP_LENGTH)
                .fill()
                .map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={code[i] || ''}
                    ref={el => (inputsRef.current[i] = el)}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    className="w-10 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e80808] transition"
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !code[i] && i > 0) {
                        inputsRef.current[i - 1]?.focus();
                      }
                    }}
                  />
                ))}
            </div>
            <div className="flex justify-center items-center mb-4">
              <button
                type="button"
                onClick={resendOtp}
                className={`text-xs font-semibold underline ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#e80808]'} transition`}
                disabled={resendTimer > 0}
              >
                Resend OTP
              </button>
              {resendTimer > 0 && <span className="ml-2 text-xs text-gray-400">({resendTimer}s)</span>}
            </div>
          </div>
        )}
        <button
          onClick={step === 'phone' ? sendOtp : verifyOtp}
          disabled={loading || (step === 'phone' ? !isPhoneValid : otpValue.length < OTP_LENGTH)}
          className={`w-full py-3 rounded-xl text-white font-medium transition
            ${loading ? 'bg-red-400 cursor-wait' : 'bg-[#e80808] hover:bg-[#cc0606] focus:ring-2 focus:ring-offset-1 focus:ring-[#e80808]'}`}
        >
          {loading
            ? step === 'phone'
              ? 'Sending...'
              : 'Verifying...'
            : step === 'phone'
            ? 'Send Code'
            : 'Verify OTP'}
        </button>
      </motion.div>
    </div>
  );
}
