'use client'

import { useState } from "react";
import { FiEdit3 } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
import EditProduct from "./EditProduct";
import ConfirmBox from "./ConfirmBox";
import { toast } from "react-toastify";
import Axios from "@/public/utils/Axios";
import summaryApi from "@/public/common/summaryApi";

const ProductComponent = ({ data, fetchProducts }) => {
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteData, setDeleteData] = useState({
    _id : ""
  })
  
  const handleDeleteProduct = async ( _id ) => {
    try {
      const response = await Axios({
        ...summaryApi.deleteProduct,
        data : {
          _id : _id
        }
      })

      const { data : responseData } = response

      if( responseData.success ) {
        toast.success(responseData.message)
        
        if(fetchProducts){
          fetchProducts()
        }
      }
    } catch (error) {
      toast.error(error)
    }
  }

  return (
    <div className="relative w-52 h-fit bg-white shadow-lg rounded-xl overflow-hidden cursor-pointer">
      {/* Product Image */}
      <div className="relative h-36">
        <img 
          src={data.image[0] || "https://source.unsplash.com/300x200/?food"} 
          alt={data.name} 
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 ease-in-out"
        />
        
        {/* Discount Badge (Only if discount > 0) */}
        {data.discount && parseFloat(data.discount) > 0 && (
          <span className="absolute top-2 left-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md animate-bounce transition-transform duration-300">
            {data.discount}% OFF
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col justify-between h-[110px]">
        {/* Name & Price */}
        <div className="flex justify-between items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900 text-ellipsis hover:scale-110 transition-transform duration-300 ease-in-out line-clamp-1">{data.name}</h3> 
          <span className="text-base font-bold text-emerald-600 mr-1.5 hover:scale-110 transition-transform duration-300 ease-in-out">
            ₹{data.price}
          </span>
        </div>

        {/* Unit Details */}
        <div className="text-xs font-medium text-gray-400 line-clamp-1 flex items-center gap-1 justify-between">
          <span className="text-xs font-semibold text-gray-600">{data.unit}</span>

          {/* Stock Status */}
          <div className={`text-xs font-semibold ${data.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {data.stock > 0 ? "Available" : "Unavailable"} {data.stock}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs font-medium text-gray-400 line-clamp-1">
          {data.discription}
        </p> 

        <div className='flex w-[85%] items-center mt-2'>
          <button 
            className='flex-1 text-xs font-medium text-emerald-600 hover:scale-105' 
            onClick={() => {
              setOpenEdit(true)
            }}
          >
            <FiEdit3 size={13} className='inline text-emerald-600'/>Edit
          </button>
          <button 
            className='flex-1 text-xs font-medium text-red-600 hover:scale-105'
            onClick={() => handleDeleteProduct( data._id )}
          >
            <MdDeleteForever size={13} className='inline text-red-600'/>Delete
          </button>
        </div>
        {
          openEdit && <EditProduct close={() => setOpenEdit(false)} prData={data} fetchProducts={fetchProducts}/>
        }
        {
          openDelete && <ConfirmBox close={() => setOpenDelete(false)} cancel={() => setOpenDelete(false)} confirm={() => setOpenDelete(false)}/>
        }
      </div>
    </div>
  );
};

export default ProductComponent;
