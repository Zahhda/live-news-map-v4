'use client';

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MyAddressesPage() {
  const [userPhone, setUserPhone] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    gstin: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
  });
  const [saving, setSaving] = useState(false);

  // load phone + addresses
  useEffect(() => {
    const phone = sessionStorage.getItem("user_phone") || "";
    setUserPhone(phone);
    if (!phone) return;

    setLoading(true);
    axios
      .get(`/api/user/addresses?phone=${encodeURIComponent(phone)}`)
      .then(res => {
        if (res.data.success) setAddresses(res.data.addresses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
  };

  const saveAddress = async e => {
    e.preventDefault();
    for (let key of ["fullName","email","pincode","area","city","state"]) {
      if (!form[key]) {
        alert(`Please fill ${key}`);
        return;
      }
    }
    setSaving(true);
    try {
      const body = { ...form, phoneNumber: userPhone };
      const res = await axios.post("/api/user/address", body);
      if (res.data.success) {
        setAddresses(a => [...a, res.data.address]);
        setShowForm(false);
        setForm({ fullName:"", email:"", gstin:"", pincode:"", area:"", city:"", state:"" });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pt-16 flex flex-col md:flex-row">
        {/* Sidebar or Topbar */}
        <aside className="w-full md:w-56 bg-white shadow-sm">
          <div className="p-4 md:p-6 font-bold text-xl border-b flex md:block justify-center md:justify-start">
            VOX
          </div>
          <nav className="mt-2 md:mt-4">
            <ul className="flex md:block justify-center">
              <li className="px-4 md:px-6 py-2 md:py-3 bg-[#e80808] text-white rounded-t-md md:rounded-none text-center text-sm md:text-base">
                My Addresses
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 px-2 sm:px-4 md:px-8 py-6">
          <h1 className="text-lg md:text-2xl mb-4 md:mb-6 text-gray-900 text-center">
            Phone: <span className="font-medium">{userPhone || "—"}</span>
          </h1>

          <div className="bg-white rounded-lg shadow p-3 sm:p-6 max-w-lg md:max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold">
                Delivery Addresses
              </h2>
              <button
                onClick={() => setShowForm(f => !f)}
                className="flex items-center gap-2 bg-[#e80808] text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm sm:text-base"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500 text-center py-8">Loading…</p>
            ) : addresses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No addresses saved.</p>
            ) : (
              <ul className="space-y-4">
                {addresses.map(addr => (
                  <li key={addr._id} className="border rounded p-3 sm:p-4 bg-gray-50">
                    <p className="font-medium text-base">{addr.fullName}</p>
                    <p className="text-xs sm:text-sm">{addr.phoneNumber} · {addr.email}</p>
                    <p className="text-xs sm:text-sm mt-1">
                      {addr.area}, {addr.city}, {addr.state} – {addr.pincode}
                    </p>
                    {addr.gstin && <p className="text-xs sm:text-sm">GSTIN: {addr.gstin}</p>}
                  </li>
                ))}
              </ul>
            )}

            {/* Add Form */}
            {showForm && (
              <form onSubmit={saveAddress} className="mt-6 space-y-3">
                {[
                  { k:"fullName", label:"Full Name" },
                  { k:"email", label:"Email", type:"email" },
                  { k:"gstin", label:"GSTIN (opt.)" },
                  { k:"pincode", label:"Pin Code" },
                  { k:"area", label:"Area & Street" },
                  { k:"city", label:"City" },
                  { k:"state", label:"State" },
                ].map(({k,label,type="text"}) => (
                  <input
                    key={k}
                    type={type}
                    placeholder={label}
                    value={form[k]||""}
                    onChange={e=>handleField(k,e.target.value)}
                    className="w-full border px-3 py-2 rounded text-sm focus:ring-2 focus:ring-[#e80808] focus:outline-none"
                    required={k!=="gstin"}
                  />
                ))}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full mt-2 bg-[#e80808] text-white py-2 rounded hover:bg-red-700 transition text-sm sm:text-base"
                >
                  {saving ? "Saving…" : "Save Address"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
