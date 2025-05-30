'use client'
import BacktoHome from '@/Components/BacktoHome';
import Divider from '@/Components/Divider';
import Loader from '@/Components/Loader';
import NoData from '@/Components/NoData';
import UploadCategory from '@/Components/UploadCategory';
import useMobile from '@/hooks/useMobile';
import summaryApi from '@/public/common/summaryApi';
import Axios from '@/public/utils/Axios';
import React, { useEffect, useState } from 'react';
import { TbCategoryPlus } from "react-icons/tb";
import { toast } from 'react-toastify';
import { MdDeleteForever } from "react-icons/md";
import { FiEdit3 } from "react-icons/fi";
import EditCategory from '@/Components/EditCategory';
import ConfirmBox from '@/Components/ConfirmBox';
import { useDispatch, useSelector } from 'react-redux';
import isAdmin from '@/public/utils/isAdmin';
import RestrictUser from '@/Components/RestrictUser';
import MiniLoader from '@/Components/MiniLoader';
import { setAllCategory } from '@/public/store/productSlice';


const Category = () => {
  const user = useSelector((state) => state.user)
  // restrict normal users
  if(!isAdmin(user.role)){
    return <RestrictUser />
  }
  const dispatch = useDispatch();

  
  const [openUploadCategory, setOpenUploadCategory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openConfirmBox, setOpenConfirmBox] = useState(false)
  const [editData, setEditData] = useState({
    name : "",
    image : ""
  })
  const [ deleteCategory, setDeleteCategory ] = useState({
    _id : ""
  })
  const [ isMobile ] = useMobile()

  const allCategory = useSelector(state => state.product.allCategory)

  const handledeleteCategory = async () => {
    try {
      const response = await Axios({
        ...summaryApi.deleteCategory,
        data : deleteCategory
      })
  
      const { data : responseData } = response
  
      if(responseData.success) {
        toast.success(responseData.message)
        setOpenConfirmBox(false)
        fetchCategory()
      }
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  const fetchCategory = async () => {
    setLoading(true)
    try {
      const response = await Axios({
        ...summaryApi.getCategory
      })

      const { data : responseData } = response
      
      if(responseData.success) {
        dispatch(setAllCategory(responseData.data))
      }
    } catch (error) {
        toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategory();
  }, []);

  return (
    <main className='px-2 lg:px-5'>
      {
        isMobile && <BacktoHome />
      }
      <h1 className='text-emerald-600 font-bold text-center my-2 lg:my-6 text-2xl'>Category Options</h1>

      <Divider />

      <div className='w-full my-5 flex flex-row-reverse'>
        <button onClick={() => setOpenUploadCategory(true)} className='mr-1 bg-emerald-700 hover:bg-emerald-600 text-neutral-200 text-sm font-medium rounded-sm px-5 py-1.5'>Add Category <TbCategoryPlus size={18} className='text-neutral-200 inline font-bold'/></button>
      </div>

      {
        openUploadCategory && (
          <UploadCategory fetchCategory={fetchCategory} close={() => setOpenUploadCategory(false)}/>
        )
      }
      
      <section className='relative bg-amber-400 rounded-lg w-full min-h-52 my-6 p-3 lg:p-5'>
        {
          loading && <MiniLoader />
        }
        
        {
          !allCategory[0] && (
            <NoData />
          )
        }

        {
          allCategory[0] && <h1 className="text-2xl text-center font-bold text-amber-700 mb-6">Category List</h1>
        }

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-5 p-4 w-full h-full">
          {allCategory.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center min-h-46 group  p-3 rounded-2xl shadow-md cursor-pointer transition-transform transform hover:scale-105 overflow-hidden relative bg-amber-100 hover:shadow-lg" 
            >
              <div className="w-22 h-22 sm:w-28 sm:h-28 flex justify-center items-center bg-gray-100 rounded-full overflow-hidden object-scale-down">
                <img
                  alt={category.name}
                  src={category.image}
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="font-bold text-emerald-700 m-1 text-center leading-lg">
                {category.name}
              </h1>
              <div className='hidden w-full items-center gap-2 justify-between px-1.5 group-hover:flex absolute bottom-2 left-0 right-0 bg-amber-200 rounded py-1.5 backdrop-blur-lg transition-transform duration-75'>
                <button 
                  className='flex-1 text-xs font-medium text-emerald-600 items-center' 
                  onClick={() => {
                    setOpenEdit(true)
                    setEditData(category)
                  }}
                >
                  <FiEdit3 size={13} className='inline text-emerald-600'/>Edit
                </button>
                <button 
                  className='flex-1 text-xs font-medium text-red-600 items-center'
                  onClick={() => {
                    setOpenConfirmBox(true)
                    setDeleteCategory({
                      _id : category
                    })
                  }}
                >
                  <MdDeleteForever size={13} className='inline text-red-600'/>Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {
          openEdit && <EditCategory fetchCategory={fetchCategory} close={() => setOpenEdit(false)} data={editData}/>
        }

        {
          openConfirmBox && <ConfirmBox close={(() => setOpenConfirmBox(false))} cancel={(() => setOpenConfirmBox(false))} confirm={() => handledeleteCategory()}/>
        }
      </section>
    </main>
  )
}

export default Category