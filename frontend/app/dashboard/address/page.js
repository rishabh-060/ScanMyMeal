'use client'
import AddAddress from '@/Components/AddAddress'
import BacktoHome from '@/Components/BacktoHome'
import Divider from '@/Components/Divider'
import EditAddress from '@/Components/EditAddress'
import RestrictUser from '@/Components/RestrictUser'
import useMobile from '@/hooks/useMobile'
import { useGlobalContext } from '@/provider/GlobalProvider'
import summaryApi from '@/public/common/summaryApi'
import Axios from '@/public/utils/Axios'
import React, { useEffect, useState } from 'react'
import { MdAddHome, MdDelete, MdEdit  } from "react-icons/md";
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const Address = () => {
  const [ isMobile ] = useMobile()
  const [openAddress, setOpenAddress] = useState(false)
  const [openEditAddress, setOpenEditAddress] = useState(false)
  const [editData, setEditData] = useState({})
  const address = useSelector(state => state.addresses.addressList)
  const { fetchAddress } = useGlobalContext()
  const user = useSelector((state) => state.user)
  
  useEffect(() => {
    if (!user) {
        <RestrictUser />
    }
  }, [])

  const handleDisableAddress = async (id) => {
    try {
      const response = await Axios({
        ...summaryApi.deleteAddress,
        data: {
          _id: id
        }
      });
      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData?.message);
        if(fetchAddress) fetchAddress();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete address.");
    }
  }

  return (
    <main className="px-2 lg:px-5">
      {isMobile && <BacktoHome />}

      {/* Page Heading */}
      <h1 className="text-amber-600 font-bold text-center my-3 lg:my-8 text-2xl">
        Saved Addresses
      </h1>
      <Divider />

      {/* Add New Address Button */}
      <div className="w-full my-5 flex flex-row-reverse">
        <button
          onClick={() => setOpenAddress(true)}
          className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium rounded-md px-5 py-2 shadow-sm transition"
        >
          <MdAddHome size={18} /> Add New Address
        </button>
      </div>

      {/* Address List */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded-xl w-full min-h-52 my-6 p-4 lg:p-6 shadow-inner">
        <div className="grid gap-5">
          {address?.length > 0 ? (
            address.map((item, index) => (
              <div
                key={index}
                className={`flex justify-between items-start bg-white/80 backdrop-blur-sm hover:bg-white rounded-lg p-5 shadow-md border border-amber-100 transition-transform duration-150 hover:scale-[1.01] ${
                  !item.status && "hidden"
                }`}
              >
                {/* Address Info */}
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.address_line}
                  </h2>
                  <p className="text-gray-600 text-sm lg:text-base font-medium">
                    {item.city} - {item.state}
                  </p>
                  <p className="text-gray-600 text-sm lg:text-base font-medium">
                    {item.country} - {item.pincode}
                  </p>
                  <p className="text-gray-600 text-sm lg:text-base font-medium">
                    {item.mobile}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditData(item);
                      setOpenEditAddress(true);
                    }}
                    className="p-2 rounded-full bg-green-50 hover:bg-green-100 border border-green-300 transition"
                  >
                    <MdEdit
                      size={20}
                      className="text-green-600 hover:text-green-700"
                    />
                  </button>

                  <button
                    onClick={() => handleDisableAddress(item._id)}
                    className="p-2 rounded-full bg-red-50 hover:bg-red-100 border border-red-300 transition"
                  >
                    <MdDelete
                      size={20}
                      className="text-red-600 hover:text-red-700"
                    />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6">
              No addresses found.
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
      {openEditAddress && (
        <EditAddress close={() => setOpenEditAddress(false)} editData={editData} />
      )}
    </main>
  )
}

export default Address