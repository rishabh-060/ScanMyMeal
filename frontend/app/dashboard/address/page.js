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
    <main className='px-2 lg:px-5'>
      {
        isMobile && <BacktoHome />
      }
      <h1 className='text-emerald-600 font-bold text-center my-2 lg:my-6 text-2xl'>Saved Addresses</h1>

      <Divider />

      <div className='w-full my-5 flex flex-row-reverse'>
        <button onClick={() => setOpenAddress(true)} className='mr-1 bg-emerald-700 hover:bg-emerald-600 text-neutral-200 text-sm font-medium rounded-sm px-5 py-1.5'>Add new address <MdAddHome size={18} className='text-neutral-200 inline font-bold'/></button>
      </div>

      <section className='bg-amber-300 rounded-lg w-full min-h-52 my-6 p-3 lg:p-5'>
        <div className='grid gap-4'>
          {
            address?.length > 0 ? (
              address.map((item, index) => (
                <div key={index} className={`bg-neutral-100 hover:bg-neutral-200 shadow-md rounded-lg p-4 flex justify-between transition-transform duration-100 ease-in-out ${ !item.status && 'hidden'}`}>
                  <div>
                    <h2 className='text-lg font-semibold text-neutral-700'>{item.address_line}</h2>
                    <p className='text-neutral-500 font-semibold text-sm lg:text-base'>{item.city} - {item.state}</p>
                    <p className='text-neutral-500 font-semibold text-sm lg:text-base'>{item.country} - {item.pincode}</p>
                    <p className='text-neutral-500 font-semibold text-sm lg:text-base'>{item.mobile}</p>
                  </div>

                  <div className='flex gap-2 justify-end h-fit'>
                    <button
                      onClick={() => {
                        setEditData(item)
                        setOpenEditAddress(true)
                      }}
                      className='border-green-500 hover:border-green-600 text-white font-semibold text-sm rounded-md flex items-center'
                    >
                      <MdEdit size={22} className='mr-1 text-green-500 hover:text-green-600 font-semibold' />
                    </button>
                    <button
                      onClick={() => handleDisableAddress(item._id)}
                      className='border-red-500 hover:border-red-600 text-white font-semibold text-sm  rounded-md flex items-center'
                    >
                      <MdDelete size={22} className='mr-1 text-red-500 hover:text-red-600 font-semibold' />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-gray-500'>No addresses found</div>
            )
          }
        </div>
      </section>
      {
        openAddress && <AddAddress close={() => setOpenAddress(false)}/>
      }
      {
        openEditAddress && <EditAddress close={() => setOpenEditAddress(false)} editData={editData}/>
      }
    </main>
  )
}

export default Address