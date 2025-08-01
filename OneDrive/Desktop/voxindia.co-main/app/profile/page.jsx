'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [userPhone, setUserPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phoneNumber: '',
    pincode: '',
    area: '',
    city: '',
    state: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const phone = sessionStorage.getItem('user_phone');
    if (!phone) return;

    setUserPhone(phone);

    // Load user & address
    const fetchData = async () => {
      try {
        const resUser = await axios.post('/api/auth/get-user', { phone });
        const user = resUser.data.user;
        setUserId(user._id);
        setName(user.name);

        const resAddr = await axios.post('/api/auth/get-address', { userId: user._id });
        if (resAddr.data.address) setAddress(resAddr.data.address);
      } catch {
        toast.error('Failed to load profile');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('/api/auth/update-address', {
        userId,
        ...address,
      });
      toast.success('Address saved!');
    } catch {
      toast.error('Failed to save address');
    }
    setSaving(false);
  };

  if (!userId) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Hello {name || userPhone}</h1>

      <input
        name="fullName"
        value={address.fullName}
        onChange={handleChange}
        placeholder="Full Name"
        className="w-full border mb-3 px-4 py-2 rounded"
      />
      <input
        name="phoneNumber"
        value={address.phoneNumber}
        onChange={handleChange}
        placeholder="Phone Number"
        className="w-full border mb-3 px-4 py-2 rounded"
      />
      <input
        name="pincode"
        value={address.pincode}
        onChange={handleChange}
        placeholder="Pincode"
        className="w-full border mb-3 px-4 py-2 rounded"
      />
      <input
        name="area"
        value={address.area}
        onChange={handleChange}
        placeholder="Area"
        className="w-full border mb-3 px-4 py-2 rounded"
      />
      <input
        name="city"
        value={address.city}
        onChange={handleChange}
        placeholder="City"
        className="w-full border mb-3 px-4 py-2 rounded"
      />
      <input
        name="state"
        value={address.state}
        onChange={handleChange}
        placeholder="State"
        className="w-full border mb-4 px-4 py-2 rounded"
      />

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#e80808] text-white px-6 py-2 rounded hover:bg-[#cc0606] disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Address'}
      </button>

      <button
        onClick={() => {
          sessionStorage.clear();
          location.href = '/';
        }}
        className="ml-4 text-red-600 hover:underline"
      >
        Logout
      </button>
    </div>
  );
}
