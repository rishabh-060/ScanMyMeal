import React, { useState } from "react";
import { IoCloseCircle } from "react-icons/io5";
import Axios from "@/public/utils/Axios";
import summaryApi from "@/public/common/summaryApi";

const ManageOrder = ({ close, data, fetchUpcomingOrders }) => {
  const [selectedStatus, setSelectedStatus] = useState(data.order_status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const actionOptions = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "delivered",
    "cancelled",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      setError("Please select an order status.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await Axios({
        ...summaryApi.manageOrder,
        data: {
          orderId: data.orderId,
          action: selectedStatus,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        fetchUpcomingOrders();
        close();
      } else {
        setError(responseData.message || "Failed to update order status.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="fixed top-0 left-0 w-full h-screen bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-lg shadow-lg p-6 relative">
        <button
          onClick={close}
          className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800"
        >
          <IoCloseCircle size={28} />
        </button>

        <h2 className="text-lg font-bold mb-2 text-neutral-700">Manage Order</h2>
        <p className="text-sm text-neutral-600 mb-1">
          <span className="font-medium">Order ID:</span> {data.orderId}
        </p>
        <p className="text-sm text-neutral-600 mb-3">
          <span className="font-medium">Product:</span> {data.product_details?.name || "N/A"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Update Order Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring focus:ring-amber-300 text-neutral-700"
            >
              {actionOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md font-medium text-white ${
              loading
                ? "bg-amber-300 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600"
            } transition`}
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ManageOrder;
