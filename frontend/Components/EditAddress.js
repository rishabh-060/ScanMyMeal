import { useGlobalContext } from '@/provider/GlobalProvider';
import summaryApi from '@/public/common/summaryApi';
import Axios from '@/public/utils/Axios';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { IoMdHome } from "react-icons/io";
import { IoCloseCircle } from 'react-icons/io5';
import { toast } from 'react-toastify';

const EditAddress = ({ close, editData }) => {
  const [data, setData] = useState({
    _id: editData?._id,
    address_line: editData?.address_line || "",
    mobile: editData?.mobile || "",
    city: editData?.city || "Kanpur",
    state: editData?.state || "Uttar Pradesh",
    country: editData?.country || "India",
    pincode: editData?.pincode || "",
  });

  const { fetchAddress } = useGlobalContext()

  const [loading, setLoading] = useState(false);

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await Axios({
        ...summaryApi.updateAddress,
        data,
      });

      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData?.message);
        if(close) close();
        if(fetchAddress) fetchAddress();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add address.");
    } finally {
      setLoading(false);
    }
  };

  const validValue = data.address_line && data.city && data.state && data.country && data.pincode;

  return (
    <section className="fixed top-0 inset-0 z-60 bg-neutral-300/60 backdrop-blur-sm overflow-y-auto">
      <div className="ml-auto h-full w-full lg:w-[32rem] bg-white p-6 flex flex-col gap-6 rounded-lg shadow-xl overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b pb-3">
          <h1 className="text-xl lg:text-2xl font-semibold text-neutral-700 flex items-center gap-2">
            <IoMdHome className="text-amber-500 animate-bounce transition-all duration-300" />
            Edit Address
          </h1>
          <button onClick={close}>
            <IoCloseCircle size={28} className="text-neutral-700 hover:text-red-500 transition" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-1">
            <label htmlFor="addressline" className="font-medium px-1 text-neutral-700">Address Line:</label>
            <input
              type="text"
              id="addressline"
              name="address_line"
              autoFocus
              required
              onChange={handleOnchange}
              value={data.address_line}
              className="bg-neutral-200 outline-none px-3 py-2 text-amber-600 text-base font-medium w-full rounded placeholder:text-gray-400"
              placeholder="e.g. 123, Civil Lines"
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="mobile" className="font-medium px-1 text-neutral-700">Mobile No.:</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              inputMode="numeric"
              required
              onChange={handleOnchange}
              value={data.mobile}
              className="bg-neutral-200 outline-none px-3 py-2 text-amber-600 text-base font-medium w-full rounded"
              placeholder="10-digit mobile no."
            />
          </div>

          <div className="grid gap-1">
            <label className="font-medium px-1 text-neutral-700">City:</label>
            <div className="bg-neutral-200 px-3 py-2 text-amber-600 text-base font-medium w-full rounded">
              {data.city}
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium px-1 text-neutral-700">State:</label>
            <div className="bg-neutral-200 px-3 py-2 text-amber-600 text-base font-medium w-full rounded">
              {data.state}
            </div>
          </div>

          <div className="grid gap-1">
            <label className="font-medium px-1 text-neutral-700">Country:</label>
            <div className="bg-neutral-200 px-3 py-2 text-amber-600 text-base font-medium w-full rounded">
              {data.country}
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="pincode" className="font-medium px-1 text-neutral-700">Pincode:</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              inputMode="numeric"
              maxLength={6}
              minLength={6}
              required
              onChange={handleOnchange}
              value={data.pincode}
              className="bg-neutral-200 outline-none px-3 py-2 text-amber-600 text-base font-medium w-full rounded"
              placeholder="6-digit PIN"
            />
          </div>

          <button
            type="submit"
            disabled={!validValue || loading}
            className={`flex items-center justify-center w-full mx-auto rounded-full py-2 mt-4 text-gray-600 font-bold text-lg tracking-widest transition-all duration-300
              ${validValue && !loading
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-neutral-200 cursor-not-allowed"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Processing...
              </>
            ) : (
              "Add Address"
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default EditAddress;
