"use client";
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";

export default function OrderSummary() {
  const {
    router,
    getCartCount,
    getCartAmount,
    getToken,
    user,
    cartItems,
    setCartItems,
  } = useAppContext();

  const [showModal, setShowModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    gstin: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user_address");
    let last = null;
    if (raw) {
      last = JSON.parse(raw);
      setForm(last);
      setSelected(last);
    }
    (async () => {
      try {
        const token = await getToken();
        const phone = last?.phoneNumber || "";
        const res = await fetch(
          `/api/user/addresses?phone=${encodeURIComponent(phone)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) setAddresses(data.addresses);
      } catch (e) {
        console.error("fetch addresses:", e);
      }
    })();
  }, [getToken]);

  const handleChange = (key, value) => {
    const updatedForm = { ...form, [key]: value };
    setForm(updatedForm);
    localStorage.setItem("user_address", JSON.stringify(updatedForm));
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phoneNumber || !form.email) {
      return toast.error("Name, phone & email are required");
    }
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || res.statusText);
      const data = JSON.parse(text);
      setAddresses((prev) => {
        const idx = prev.findIndex((a) => a._id === data.address._id);
        if (idx > -1) {
          prev[idx] = data.address;
          return [...prev];
        }
        return [...prev, data.address];
      });
      setSelected(data.address);
      setForm(data.address);
      toast.success("Address saved");
      setShowModal(false);
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addr) => {
    if (!confirm(`Delete address for ${addr.fullName}?`)) return;
    try {
      const token = await getToken();
      const res = await fetch("/api/user/address", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id: addr._id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setAddresses((prev) => prev.filter((a) => a._id !== addr._id));
      if (selected?._id === addr._id) setSelected(null);
      toast.success("Address deleted");
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  const selectAddress = (a) => {
    setSelected(a);
    setForm(a);
    localStorage.setItem("user_address", JSON.stringify(a));
  };

  const createOrder = async () => {
    try {
      if (!selected) return toast.error("Please select an address");

      let cartItemsArray = Object.keys(cartItems).map((key) => ({
        product: key,
        quantity: cartItems[key]?.quantity || 0,
      }));

      cartItemsArray = cartItemsArray.filter((item) => item.quantity > 0);
      if (cartItemsArray.length === 0) return toast.error("Cart is empty");

      const token = await getToken();

      const totalAmount = getCartAmount() + Math.floor(getCartAmount() * 0.02);
      const totalAmountInPaise = Math.floor(totalAmount * 100);

      const razorpayOrder = await axios.post(
        "/api/razorpay/order",
        { amount: totalAmountInPaise },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!razorpayOrder.data.success) {
        return toast.error("Failed to create payment order");
      }

      const loaded = await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
      if (!loaded) return toast.error("Failed to load Razorpay script");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.data.order.amount,
        currency: "INR",
        name: "Voxindia",
        description: "Order Payment",
        order_id: razorpayOrder.data.order.id,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            response;

          const confirm = await axios.post(
            "/api/order/create",
            {
              address: selected._id,
              items: cartItemsArray,
              payment_id: razorpay_payment_id,
              razorpay_order_id,
              signature: razorpay_signature,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (confirm.data.success) {
            toast.success(confirm.data.message);
            setCartItems({});
            router.push("/order-placed");
          } else {
            toast.error("Payment verified but order failed");
          }
        },
        theme: { color: "#f40000" },
        prefill: {
          name: user?.fullName || "Customer",
          email: user?.email,
        },
      };

      const razorpayObject = new window.Razorpay(options);
      razorpayObject.open();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Use same format function here too
  function formatINRWithDecimal(amount) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return (
    <div className="w-full md:w-96 bg-gradient-to-br from-white/80 via-white/70 to-white/80 p-6 rounded-3xl shadow-xl font-sans">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center tracking-wide">
        Order Summary
      </h2>

      {/* Address Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700 text-lg">Delivery Address</h3>
        </div>

        {/* Selected Address Box - Glossy */}
        {selected ? (
          <div className="relative bg-gradient-to-tr from-white/90 to-gray-100/80 border border-gray-300 rounded-2xl p-5 shadow-md select-none cursor-default">
            {/* Edit button top right */}
            <button
              onClick={() => setShowModal(true)}
              className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full px-3 py-1 text-sm font-semibold shadow-md transition"
            >
              Edit
            </button>
            <p className="font-semibold text-gray-800 text-lg">{selected.fullName}</p>
            <p className="text-gray-600 mt-1">{selected.phoneNumber}</p>
            <p className="text-gray-600">{selected.email}</p>
            <p className="text-gray-600 mt-2">
              {selected.area}, {selected.city} — {selected.pincode}
            </p>
            <p className="text-gray-600">{selected.state}</p>
            {selected.gstin && (
              <p className="text-gray-600 mt-1 font-mono text-xs tracking-wider">
                GSTIN: {selected.gstin}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No address selected</p>
        )}
      </div>

      {/* Saved Addresses List */}
      {addresses.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-3">Saved Addresses</h4>
          <ul className="max-h-56 overflow-y-auto space-y-2 border border-gray-300 rounded-xl p-3 bg-white shadow-inner">
            {addresses.map((a) => (
              <li
                key={a._id}
                className={`flex justify-between items-start p-3 rounded-xl transition cursor-pointer select-none
                  ${selected?._id === a._id ? "bg-red-50 border border-red-400" : "hover:bg-gray-100"}`}
                onClick={() => selectAddress(a)}
              >
                <div>
                  <p className="font-semibold text-gray-800">{a.fullName}</p>
                  <p className="text-xs text-gray-600">{a.phoneNumber}</p>
                  <p className="text-xs text-gray-600">
                    {a.area}, {a.city}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAddress(a);
                  }}
                  className="text-gray-400 hover:text-red-600 ml-4 text-xl font-bold"
                  aria-label="Remove address"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add Address Button Below List */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-md transition"
        >
          + Add Address
        </button>
      </div>

      {/* Price Summary */}
      <div className="border-t border-gray-300 pt-5 mb-6 text-gray-700">
        <div className="flex justify-between text-base font-medium">
          <span>Items ({getCartCount()})</span>
          <span>{formatINRWithDecimal(getCartAmount())}</span>
        </div>
        <div className="flex justify-between font-semibold mt-1 text-lg">
          <span>Total</span>
          <span>{formatINRWithDecimal(getCartAmount())}</span>
        </div>
      </div>

      {/* Razorpay Payment Button */}
      <button
        onClick={createOrder}
        disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-3xl font-semibold transition shadow-lg"
      >
        {loading ? "Processing…" : "Pay with Razorpay"}
      </button>

      {/* Add/Edit Address Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-2xl shadow-2xl w-full max-w-sm relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl font-bold"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">
              Add / Edit Address
            </h3>
            <form onSubmit={saveAddress} className="space-y-3">
              {[
                { k: "fullName", label: "Full Name" },
                { k: "phoneNumber", label: "Phone Number" },
                { k: "email", label: "Email", type: "email" },
                { k: "gstin", label: "GSTIN (opt.)" },
                { k: "pincode", label: "Pin Code" },
                { k: "area", label: "Area & Street" },
                { k: "city", label: "City" },
                { k: "state", label: "State" },
              ].map(({ k, label, type = "text" }) => (
                <input
                  key={k}
                  type={type}
                  placeholder={label}
                  value={form[k] || ""}
                  onChange={(e) => handleChange(k, e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-300 outline-none transition"
                  required={k !== "gstin"}
                />
              ))}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold transition"
              >
                {loading ? "Saving…" : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
